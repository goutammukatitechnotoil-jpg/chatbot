import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default compose(withTenant, withErrorHandling)(async function releasesHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    const db = req.tenantDb;
    if (!db) {
      console.error('Tenant database connection failed');
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }
    const releasesCollection = db.collection('releases');

    if (req.method === 'GET') {
      // Get all releases for the tenant
      const releases = await releasesCollection
        .find({ tenantId })
        .sort({ published_at: -1 })
        .toArray();

      return res.status(200).json(releases);
    }

    if (req.method === 'POST') {
      const { draftId, draftName, releaseNotes } = req.body;

      if (!draftId || !draftName) {
        return res.status(400).json({ error: 'Draft ID and name are required' });
      }

      const release = {
        tenantId,
        draftId,
        draftName,
        releaseNotes: releaseNotes || '',
        published_at: new Date(),
        published_by: req.user?.email || 'Unknown'
      };

      const result = await releasesCollection.insertOne(release);
      return res.status(201).json({ ...release, _id: result.insertedId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Releases API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});