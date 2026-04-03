import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ObjectId } from 'mongodb';
import { compose, withTenant, withErrorHandling, AuthenticatedRequest } from '../../../src/middleware/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  success?: boolean;
  url?: string;
  error?: string;
  detail?: any;
};

function normalizeCloudinaryConfig(config: { url?: string; cloud_name?: string; api_key?: string; api_secret?: string; upload_preset?: string }) {
  const normalized = {
    ...config,
    url: (config.url || '').trim(),
    cloud_name: (config.cloud_name || '').trim(),
    api_key: (config.api_key || '').trim(),
    api_secret: (config.api_secret || '').trim(),
    upload_preset: (config.upload_preset || '').trim(),
  };

  if (normalized.url.toUpperCase().startsWith('CLOUDINARY_URL=')) {
    normalized.url = normalized.url.substring('CLOUDINARY_URL='.length).trim();
  }

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
  let cloudinaryConfig = normalizeCloudinaryConfig({
    url: process.env.CLOUDINARY_URL || '',
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || ''
  });

  try {
    const tenantDb = req.tenantDb;

    if (tenantDb && req.user?.id) {
      try {
        const userId = new ObjectId(req.user.id);
        const userDoc = await tenantDb.collection('team_members').findOne({ _id: userId });
        if (userDoc && userDoc.cloudinary) {
          cloudinaryConfig = normalizeCloudinaryConfig({
            ...cloudinaryConfig,
            ...userDoc.cloudinary
          });
          return cloudinaryConfig;
        }
      } catch (userErr) {
        console.warn('Could not load user Cloudinary config:', userErr);
      }
    }

    if (tenantDb) {
      const settings = await tenantDb.collection('system_settings').findOne({ settings_id: 'main_settings' });
      if (settings && settings.cloudinary) {
        cloudinaryConfig = normalizeCloudinaryConfig({
          ...cloudinaryConfig,
          ...settings.cloudinary
        });
      }
    }
  } catch (err) {
    console.warn('Could not load cloudinary config from database, falling back to env:', err);
  }

  return cloudinaryConfig;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use OS temp directory for uploads
  const uploadDir = path.join(os.tmpdir(), 'fpt-chatbot', 'uploads', 'temp');
  try {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error('Failed to create upload temp directory:', uploadDir, e);
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: false,
    maxFileSize: 5 * 1024 * 1024,
    filename: (name, ext, part) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      return `temp_slider_${timestamp}_${random}${ext}`;
    },
    filter: (part) => {
      return part.mimetype?.startsWith('image/') || false;
    }
  });

  try {
    const parsed: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const filesObj = parsed.files || {};
    let uploadedFile = filesObj.image || filesObj.file || filesObj.slider || Object.values(filesObj)[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (Array.isArray(uploadedFile)) uploadedFile = uploadedFile[0];

    const tempPath = uploadedFile?.filepath || uploadedFile?.tempFilePath || uploadedFile?.path;

    if (!tempPath || !fs.existsSync(tempPath)) {
      console.error('Slider upload handler: tempPath missing or file not found:', tempPath);
      return res.status(500).json({ error: 'Uploaded file temporary path not found' });
    }

    // Cloudinary configuration
    const cloudinaryConfig = normalizeCloudinaryConfig(await getCloudinaryConfig(req));
    const cloudinaryUrl = cloudinaryConfig.url;
    const cloudinaryCloudName = cloudinaryConfig.cloud_name;
    const cloudinaryApiKey = cloudinaryConfig.api_key;
    const cloudinaryApiSecret = cloudinaryConfig.api_secret;

    let apiKey = cloudinaryApiKey || '';
    let apiSecret = cloudinaryApiSecret || '';
    let cloudName = cloudinaryCloudName || '';

    if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
      const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        cloudName = match[3];
      }
    }

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary credentials missing:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
      return res.status(400).json({ 
        error: 'Cloudinary is not configured. Please set Cloudinary settings in Settings -> Cloudinary and retry uploading images.' 
      });
    }

    // Read the file as buffer for upload
    const fileBuffer = fs.readFileSync(tempPath);
    const mimeType = uploadedFile.mimetype || 'image/png';
    const base64Image = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    // Cloudinary Upload using the base64 string directly in the body
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Create params for signed upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signParams = {
      folder: 'fpt_chatbot/sliders',
      timestamp,
    };

    const toSign = Object.keys(signParams)
      .sort()
      .map((k) => `${k}=${signParams[k]}`)
      .join('&');

    const signature = require('crypto')
      .createHash('sha1')
      .update(`${toSign}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('file', base64Image); // Cloudinary supports base64 data URLs
    formData.append('folder', 'fpt_chatbot/sliders');
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const cloudResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData as any,
    });

    const cloudData = await cloudResponse.json();

    // Clean up temp file
    try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }

    if (!cloudResponse.ok) {
      console.error('Cloudinary upload failure:', cloudData);
      return res.status(502).json({ 
        error: 'Cloudinary upload failed', 
        detail: cloudData.error?.message || 'Check your Cloudinary credentials' 
      });
    }

    if (!cloudData.secure_url) {
      console.error('Cloudinary response missing secure_url');
      return res.status(502).json({ error: 'Cloudinary did not return a secure URL' });
    }

    return res.status(200).json({ 
      success: true, 
      url: cloudData.secure_url 
    });

  } catch (error: any) {
    console.error('Slider upload catch error:', error);
    return res.status(500).json({ error: error?.message || 'Upload failed' });
  }
}

export default compose(withErrorHandling, withTenant)(handler);

