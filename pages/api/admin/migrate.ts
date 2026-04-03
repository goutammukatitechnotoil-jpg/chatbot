import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling, withRateLimit, compose } from '../../../src/middleware/auth';
import MigrationService from '../../../src/services/migrationService';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, key } = req.body;

  // Require special key for migration operations
  const migrationKey = process.env.MIGRATION_KEY || 'migrate-fpt-chatbot-2024';
  if (key !== migrationKey) {
    return res.status(403).json({ error: 'Invalid migration key' });
  }

  try {
    switch (action) {
      case 'migrate':
        await MigrationService.migrateToMultiTenant();
        return res.status(200).json({ 
          success: true, 
          message: 'Migration completed successfully' 
        });

      case 'setup-dev':
        await MigrationService.setupDevelopment(req.body);
        return res.status(200).json({ 
          success: true, 
          message: 'Development environment setup completed' 
        });

      case 'check':
        const needsMigration = await MigrationService.isMigrationNeeded();
        return res.status(200).json({ 
          success: true, 
          needsMigration,
          message: needsMigration ? 'Migration is needed' : 'Migration not needed'
        });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error: any) {
    console.error('Migration error:', error);
    return res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
}

export default compose(
  withErrorHandling,
  withRateLimit(1, 60000) // Only 1 migration per minute
)(handler);
