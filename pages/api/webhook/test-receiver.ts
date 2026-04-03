import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Simple webhook receiver for testing purposes
 * This endpoint accepts any POST request and logs the data
 */
export default async function testReceiverHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('========================================');
    console.log('🎯 Test Webhook Received!');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('========================================');

    // Send success response
    res.status(200).json({ 
      success: true,
      message: 'Webhook received successfully!',
      received_at: new Date().toISOString(),
      data: req.body
    });
  } catch (error) {
    console.error('Test receiver error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
}
