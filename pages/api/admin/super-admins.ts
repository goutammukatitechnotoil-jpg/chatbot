import { NextApiResponse } from 'next';
import { AuthenticatedRequest, withSuperAdmin, withErrorHandling, compose } from '../../../src/middleware/auth';
import { multiTenantDB } from '../../../src/services/multiTenantDatabaseService';
import AuthService from '../../../src/services/authService';
import { SuperAdmin, SUPER_ADMIN_PERMISSIONS } from '../../../src/types/tenant';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all super admins
 */
async function getSuperAdmins(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { superAdmins } = await multiTenantDB.getMasterCollections();
    
    const admins = await superAdmins
      .find({})
      .project({ password_hash: 0 }) // Exclude password hash
      .toArray();

    return res.status(200).json({
      success: true,
      admins: admins.map(admin => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        permissions: admin.permissions,
        last_login_at: admin.last_login_at,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }))
    });
  } catch (error: any) {
    console.error('Error fetching super admins:', error);
    return res.status(500).json({
      error: 'Failed to fetch super admins',
      details: error.message
    });
  }
}

/**
 * Create new super admin
 */
async function createSuperAdmin(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { name, email, password, role = 'super_admin' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long'
      });
    }

    const { superAdmins } = await multiTenantDB.getMasterCollections();

    // Check if email already exists
    const existingAdmin = await superAdmins.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingAdmin) {
      return res.status(409).json({
        error: 'A super admin with this email already exists'
      });
    }

    // Validate role
    if (role !== 'super_admin' && role !== 'support') {
      return res.status(400).json({
        error: 'Invalid role. Must be either "super_admin" or "support"'
      });
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create new super admin
    const newAdmin: SuperAdmin = {
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      status: 'active',
      permissions: [...SUPER_ADMIN_PERMISSIONS],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await superAdmins.insertOne(newAdmin);

    // Return admin without password hash
    const { password_hash, ...adminResponse } = newAdmin;

    return res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      admin: adminResponse
    });
  } catch (error: any) {
    console.error('Error creating super admin:', error);
    return res.status(500).json({
      error: 'Failed to create super admin',
      details: error.message
    });
  }
}

/**
 * Update super admin
 */
async function updateSuperAdmin(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id, name, email, role, status, password } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Super admin ID is required'
      });
    }

    const { superAdmins } = await multiTenantDB.getMasterCollections();

    // Check if admin exists
    const existingAdmin = await superAdmins.findOne({ id });
    if (!existingAdmin) {
      return res.status(404).json({
        error: 'Super admin not found'
      });
    }

    // Prevent self-deactivation
    if (status === 'inactive' && req.user?.id === id) {
      return res.status(400).json({
        error: 'You cannot deactivate your own account'
      });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (email) {
      // Check if new email is already in use by another admin
      const emailInUse = await superAdmins.findOne({ 
        email: email.toLowerCase(),
        id: { $ne: id }
      });
      if (emailInUse) {
        return res.status(409).json({
          error: 'Email is already in use by another super admin'
        });
      }
      updateData.email = email.toLowerCase();
    }
    if (role && (role === 'super_admin' || role === 'support')) {
      updateData.role = role;
    }
    if (status && (status === 'active' || status === 'inactive')) {
      updateData.status = status;
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long'
        });
      }
      updateData.password_hash = await AuthService.hashPassword(password);
    }

    await superAdmins.updateOne(
      { id },
      { $set: updateData }
    );

    const updatedAdmin = await superAdmins.findOne(
      { id },
      { projection: { password_hash: 0 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Super admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error: any) {
    console.error('Error updating super admin:', error);
    return res.status(500).json({
      error: 'Failed to update super admin',
      details: error.message
    });
  }
}

/**
 * Delete super admin
 */
async function deleteSuperAdmin(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Super admin ID is required'
      });
    }

    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(400).json({
        error: 'You cannot delete your own account'
      });
    }

    const { superAdmins } = await multiTenantDB.getMasterCollections();

    // Check if admin exists
    const existingAdmin = await superAdmins.findOne({ id });
    if (!existingAdmin) {
      return res.status(404).json({
        error: 'Super admin not found'
      });
    }

    // Count remaining active super admins
    const activeAdminsCount = await superAdmins.countDocuments({
      status: 'active',
      id: { $ne: id }
    });

    if (activeAdminsCount === 0) {
      return res.status(400).json({
        error: 'Cannot delete the last active super admin. At least one active super admin must remain.'
      });
    }

    await superAdmins.deleteOne({ id });

    return res.status(200).json({
      success: true,
      message: 'Super admin deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting super admin:', error);
    return res.status(500).json({
      error: 'Failed to delete super admin',
      details: error.message
    });
  }
}

/**
 * Main handler
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return await getSuperAdmins(req, res);
    case 'POST':
      return await createSuperAdmin(req, res);
    case 'PUT':
      return await updateSuperAdmin(req, res);
    case 'DELETE':
      return await deleteSuperAdmin(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

export default compose(withErrorHandling, withSuperAdmin)(handler);
