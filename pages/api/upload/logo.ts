import { NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { compose, withTenant, withErrorHandling, AuthenticatedRequest } from '../../../src/middleware/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Use OS temp directory for runtime file uploads. In serverless environments
// writing under the project folder (e.g. /var/task/public/...) may be read-only.
// Use a namespaced folder inside the system temp directory which is writable.
const uploadDir = path.join(os.tmpdir(), 'fpt-chatbot', 'uploads', 'temp');

// Ensure temp upload directory exists (recursive)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.error('Failed to create upload temp directory:', uploadDir, e);
}
 function normalizeCloudinaryConfig(config: { url?: string; cloud_name?: string; api_key?: string; api_secret?: string; upload_preset?: string }) {
  const normalized = {
    ...config,
    url: (config.url || '').trim(),
    cloud_name: (config.cloud_name || '').trim(),
    api_key: (config.api_key || '').trim(),
    api_secret: (config.api_secret || '').trim(),
    upload_preset: (config.upload_preset || '').trim(),
  };

  if (normalized.url.startsWith('CLOUDINARY_URL=')) {
    normalized.url = normalized.url.substring('CLOUDINARY_URL='.length).trim();
  }

  // allow quoted values
  if (normalized.url.startsWith('"') && normalized.url.endsWith('"')) {
    normalized.url = normalized.url.slice(1, -1).trim();
  }

  if (normalized.url.startsWith('cloudinary://')) {
    const match = normalized.url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      normalized.cloud_name = normalized.cloud_name || match[3];
      normalized.api_key = normalized.api_key || match[1];
      normalized.api_secret = normalized.api_secret || match[2];
    }
  }

  return normalized;
}

async function getCloudinaryConfig(req: AuthenticatedRequest) {
  const cloudinaryConfig = normalizeCloudinaryConfig({
    url: process.env.CLOUDINARY_URL || '',
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
  });

  const tenantDb = req.tenantDb;

  if (!tenantDb) {
    console.warn('No tenant DB available in getCloudinaryConfig, using env config');
    return cloudinaryConfig;
  }

  // 1) Prefer user-level team member Cloudinary config (if present)
  if (req.user?.id) {
    try {
      const userId = ObjectId.isValid(req.user.id) ? new ObjectId(req.user.id) : null;
      if (userId) {
        const userDoc = await tenantDb.collection('team_members').findOne({ _id: userId });
        if (userDoc?.cloudinary) {
          console.log('Using user-level Cloudinary config from team_members', req.user?.id);
          return normalizeCloudinaryConfig({ ...cloudinaryConfig, ...userDoc.cloudinary });
        } else {
          console.log('No user-level Cloudinary config found in team_members for', req.user?.id);
        }
      } else {
        console.warn('Invalid user id for team_members lookup:', req.user.id);
      }
    } catch (userErr) {
      console.warn('Could not load user Cloudinary config from team_members:', userErr);
    }
  }

  // 2) Fallback to system settings
  try {
    const settings = await tenantDb.collection('system_settings').findOne({ settings_id: 'main_settings' });
    if (settings?.cloudinary) {
      console.log('Using system settings Cloudinary config from system_settings');
      return normalizeCloudinaryConfig({ ...cloudinaryConfig, ...settings.cloudinary });
    } else {
      console.log('No Cloudinary settings found in system_settings');
    }
  } catch (settingsErr) {
    console.warn('Could not load system Cloudinary config from system_settings:', settingsErr);
  }

  console.log('Using env-based Cloudinary config as final fallback');
  return cloudinaryConfig;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      maxTotalFileSize: 10 * 1024 * 1024, // 10MB total
      filename: (name, ext) => {
        // Generate unique temporary filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `temp_logo_${timestamp}_${random}${ext}`;
      },
      filter: (part) => {
        // Only allow image files
        return part.mimetype?.startsWith('image/') || false;
      },
    });


    const parsed = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const files = parsed.files;
    const uploadedFile = files.logo?.[0] || files.logo;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cloudinaryConfig = await getCloudinaryConfig(req);
    const cloudinaryUrl = cloudinaryConfig.url;
    const cloudinaryCloudName = cloudinaryConfig.cloud_name;

    let uploadedUrl: string | null = null;
    let uploadedViaCloudinary = false;

    if ((cloudinaryUrl || cloudinaryCloudName) && globalThis.fetch) {
      try {
        let apiKey = cloudinaryConfig.api_key || '';
        let apiSecret = cloudinaryConfig.api_secret || '';
        let cloudName = cloudinaryCloudName || '';

        if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
          const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
          if (match) {
            apiKey = apiKey || match[1];
            apiSecret = apiSecret || match[2];
            cloudName = cloudName || match[3];
          }
        }

        if (cloudName) {
          const fileBuffer = fs.readFileSync(uploadedFile.filepath);
          const mimeType = uploadedFile.mimetype || 'image/png';
          const base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

          const formData = new FormData();
          formData.append('file', base64Image);
          formData.append('folder', 'fpt_chatbot/logos');

          // Use signed upload if API key+secret are available
          if (apiKey && apiSecret) {
            const timestamp = Math.floor(Date.now() / 1000);
            const signParams = {
              folder: 'fpt_chatbot/logos',
              timestamp,
            };

            const toSign = Object.keys(signParams)
              .sort()
              .map((k) => `${k}=${signParams[k]}`)
              .join('&');

            const signature = crypto
              .createHash('sha1')
              .update(`${toSign}${apiSecret}`)
              .digest('hex');

            formData.append('api_key', apiKey);
            formData.append('timestamp', String(timestamp));
            formData.append('signature', signature);
          } else if (cloudinaryConfig.upload_preset) {
            formData.append('upload_preset', cloudinaryConfig.upload_preset);
          }

          const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

          const cloudResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData as unknown as BodyInit,
          });

          const rawResponse = await cloudResponse.text();
          if (!cloudResponse.ok) {
            console.warn('Cloudinary logo upload failed', cloudResponse.status, rawResponse);
            return res.status(400).json({
              error: 'Cloudinary upload failed',
              details: rawResponse,
            });
          }

          let cloudData;
          try {
            cloudData = JSON.parse(rawResponse);
          } catch (e) {
            console.warn('Cloudinary response JSON parse failed', rawResponse, e);
            return res.status(500).json({ error: 'Invalid Cloudinary response format', details: rawResponse });
          }

          if (cloudData.secure_url) {
            uploadedUrl = cloudData.secure_url;
            uploadedViaCloudinary = true;
          } else if (cloudData.url && typeof cloudData.url === 'string') {
            uploadedUrl = cloudData.url;
            uploadedViaCloudinary = true;
          } else {
            console.warn('Cloudinary upload returned unexpected payload', cloudData);
            return res.status(400).json({
              error: 'Cloudinary upload did not return a URL',
              details: cloudData,
            });
          }
        }
      } catch (cloudError) {
        console.warn('Cloudinary logo upload error:', cloudError);
      }
    }

    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const mimeType = uploadedFile.mimetype || 'image/png';

    if (!uploadedViaCloudinary || !uploadedUrl || uploadedUrl.startsWith('data:')) {
      fs.unlinkSync(uploadedFile.filepath);
      return res.status(400).json({
        error: 'Cloudinary upload did not return a valid remote URL. Please verify Cloudinary settings and ensure your API key/secret are correct.'
      });
    }

    fs.unlinkSync(uploadedFile.filepath);

    return res.status(200).json({
      success: true,
      url: uploadedUrl,
      filename: uploadedFile.originalFilename || 'logo',
      mimeType,
      size: fileBuffer.length,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return res.status(500).json({
      error: 'Failed to upload logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default compose(withErrorHandling, withTenant)(handler);