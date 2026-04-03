import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { multiTenantDB } from './multiTenantDatabaseService';
import { TenantUser, SuperAdmin, TenantUserRole, TENANT_ROLE_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '../types/tenant';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';


export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: TenantUserRole | 'super_admin' | 'support';
  tenantId?: string;
  permissions: string[];
  isSuperAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantId?: string; // Optional for super admin login
}

class AuthService {
  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: any): AuthToken {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.decode(token) as any;
    
    return {
      token,
      expiresAt: new Date(decoded.exp * 1000).toISOString()
    };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid  or  expired token');
    }
  }

  /**
   * Login tenant user
   */
  static async loginTenantUser(credentials: LoginCredentials): Promise<{ user: AuthUser; token: AuthToken }> {
    const { email, password, tenantId } = credentials;

    if (!tenantId) {
      throw new Error('Tenant ID is required for user login');
    }

    try {
      console.log(`Logging in user ${email} for tenant ${tenantId}`);
      const collections = await multiTenantDB.getTenantCollections(tenantId);
      const user = await collections.tenant_users.findOne({ 
        email: email.toLowerCase(),
        status: 'active' 
      });
      
      console.log("Found user:", user);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const isValid = await AuthService.comparePassword(password, user.password_hash);

      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await collections.tenant_users.updateOne(
        { id: user._id },
        { 
          $set: { 
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } 
        }
      );

      const authUser: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenantId,
        permissions: user.permissions,
        isSuperAdmin: false
      };
      console.log("Auth user:", authUser);

      const tokenPayload = {
        userId:  user._id.toString(),
        email: user.email,
        role: user.role,
        tenantId: tenantId,
        type: 'tenant_user'
      };

      const token = this.generateToken(tokenPayload);

      return { user: authUser, token };

    } catch (error) {
      console.error('Tenant user login error:', error);
      throw error;
    }
  }

  /**
   * Login super admin
   */
  static async loginSuperAdmin(credentials: LoginCredentials): Promise<{ user: AuthUser; token: AuthToken }> {
    const { email, password } = credentials;

    try {
      const { superAdmins } = await multiTenantDB.getMasterCollections();
      const admin = await superAdmins.findOne({ 
        email: email.toLowerCase(),
        status: 'active' 
      });

      if (!admin) {
        throw new Error('Invalid email or password');
      }

      const isValidPassword = await this.comparePassword(password, admin.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await superAdmins.updateOne(
        { id: admin.id },
        { 
          $set: { 
            last_login_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } 
        }
      );

      const authUser: AuthUser = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        isSuperAdmin: true
      };

      const tokenPayload = {
        userId: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'super_admin'
      };

      const token = this.generateToken(tokenPayload);

      return { user: authUser, token };

    } catch (error) {
      console.error('Super admin login error:', error);
      throw error;
    }
  }

  /**
   * Create tenant user
   */
  static async createTenantUser(
    tenantId: string, 
    userData: Omit<TenantUser, 'id' | 'tenant_id' | 'password_hash' | 'permissions' | 'created_at' | 'updated_at'> & { password: string }
  ): Promise<TenantUser> {
    try {
      const collections = await multiTenantDB.getTenantCollections(tenantId);
      
      // Check if user already exists
      const existingUser = await collections.users.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await AuthService.hashPassword(userData.password);
      // const passwordHash = await this.hashPassword(userData.password);
      const permissions = [...TENANT_ROLE_PERMISSIONS[userData.role]];

      const newUser: TenantUser = {
        id: userId,
        tenant_id: tenantId,
        name: userData.name,
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        role: userData.role,
        status: userData.status,
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userData.created_by
      };

      await collections.users.insertOne(newUser);
      
      // Remove password hash from return value
      const { password_hash, ...userWithoutPassword } = newUser;
      return userWithoutPassword as TenantUser;

    } catch (error) {
      console.error('Error creating tenant user:', error);
      throw error;
    }
  }

  /**
   * Create super admin
   */
  static async createSuperAdmin(
    adminData: Omit<SuperAdmin, 'id' | 'password_hash' | 'permissions' | 'created_at' | 'updated_at'> & { password: string }
  ): Promise<SuperAdmin> {
    try {
      const { superAdmins } = await multiTenantDB.getMasterCollections();
      
      // Check if admin already exists
      const existingAdmin = await superAdmins.findOne({ email: adminData.email.toLowerCase() });
      if (existingAdmin) {
        throw new Error('Super admin with this email already exists');
      }

      const adminId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const passwordHash = await this.hashPassword(adminData.password);
      const permissions = [...SUPER_ADMIN_PERMISSIONS];

      const newAdmin: SuperAdmin = {
        id: adminId,
        name: adminData.name,
        email: adminData.email.toLowerCase(),
        password_hash: passwordHash,
        role: adminData.role,
        status: adminData.status,
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await superAdmins.insertOne(newAdmin);
      
      // Remove password hash from return value
      const { password_hash, ...adminWithoutPassword } = newAdmin;
      return adminWithoutPassword as SuperAdmin;

    } catch (error) {
      console.error('Error creating super admin:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Get user from token
   */
  static async getUserFromToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type === 'super_admin') {
        const { superAdmins } = await multiTenantDB.getMasterCollections();
        const admin = await superAdmins.findOne({ 
          id: decoded.userId,
          status: 'active' 
        });

        if (!admin) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          isSuperAdmin: true
        };

      } else if (decoded.type === 'tenant_user') {
        const collections = await multiTenantDB.getTenantCollections(decoded.tenantId);
        const user = await collections.tenant_users.findOne({ 
          _id: new ObjectId(decoded.userId),
          status: 'active' 
        });

        if (!user) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: decoded.tenantId,
          permissions: user.permissions,
          isSuperAdmin: false
        };
      }

      return null;

    } catch (error) {
      console.error('Error getting user from token:', error);
      return null;
    }
  }

  /**
   * Update user permissions based on role change
   */
  static async updateUserPermissions(tenantId: string, userId: string, newRole: TenantUserRole): Promise<void> {
    try {
      const collections = await multiTenantDB.getTenantCollections(tenantId);
      const permissions = [...TENANT_ROLE_PERMISSIONS[newRole]];
      
      await collections.users.updateOne(
        { id: userId },
        { 
          $set: { 
            role: newRole,
            permissions,
            updated_at: new Date().toISOString()
          } 
        }
      );

    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  }
}

export default AuthService;
