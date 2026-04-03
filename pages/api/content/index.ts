import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, withTenant, withErrorHandling, compose } from '../../../src/middleware/auth';

async function initializeContentDefaults(db: any) {
  // Initialize with default content if none exists
  const existingContent = await db.collection('chatbot_content').findOne({ content_id: 'main_content' });
  
  if (!existingContent) {
    const defaultContent = {
      content_id: 'main_content',
      slider_images: [
        {
          image_url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
          link_url: 'https://fpt.com/promo1',
          title: 'Promo 1',
          description: 'First promotional content'
        },
        {
          image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
          link_url: 'https://fpt.com/promo2',
          title: 'Promo 2', 
          description: 'Second promotional content'
        },
        {
          image_url: 'https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg?auto=compress&cs=tinysrgb&w=800',
          link_url: 'https://fpt.com/promo3',
          title: 'Promo 3',
          description: 'Third promotional content'
        }
      ],
      quick_questions_title: 'Quick Questions:',
      predefined_sentences: [
        'What services do you offer?',
        'How can I get started?',
        'Tell me about your pricing',
        'I need technical support',
        'How can I contact support?',
        'What are your business hours?'
      ],
      welcome_messages: [
        'Welcome! How can I assist you today?',
        'Hello! I\'m here to help you.',
        'Hi there! What can I do for you?'
      ],
      error_messages: {
        connection_error: 'Unable to connect to the chat service. Please try again later.',
        timeout_error: 'Request timeout. Please try again.',
        general_error: 'Something went wrong. Please try again.'
      },
      button_labels: {
        send: 'Send',
        close: 'Close',
        minimize: 'Minimize',
        restart: 'Restart Chat'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('chatbot_content').insertOne(defaultContent);
    console.log('Initialized default chatbot content in database');
    return defaultContent;
  }
  
  return existingContent;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function contentHandler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const db = req.tenantDb;
    
    if (!db) {
      return res.status(500).json({ error: 'Failed to connect to tenant database' });
    }

    if (req.method === 'GET') {
      // Always ensure we have content in the database, initialize if needed
      const content = await initializeContentDefaults(db);
      
      res.status(200).json({ 
        data: {
          slider_images: content.slider_images,
          quick_questions_title: content.quick_questions_title || content.quickQuestionsTitle || 'Quick Questions:',
          predefined_sentences: content.predefined_sentences,
          welcome_messages: content.welcome_messages,
          error_messages: content.error_messages,
          button_labels: content.button_labels
        }
      });
    } else if (req.method === 'POST' || req.method === 'PUT') {
      const contentData = {
        ...req.body,
        // Allow both snake_case and camelCase keys from clients
        quick_questions_title: req.body.quick_questions_title || req.body.quickQuestionsTitle || req.body.quickQuestions || req.body.quickQuestionsTitle || undefined,
        content_id: 'main_content',
        updated_at: new Date().toISOString(),
      };

      if (Array.isArray(contentData.slider_images)) {
        const hasInvalidDataUri = contentData.slider_images.some((s: any) => typeof s.image_url === 'string' && s.image_url.startsWith('data:'));
        if (hasInvalidDataUri) {
          return res.status(400).json({ error: 'Slider image_url must be a URL (Cloudinary or public) and cannot be a data URI. Please upload thumbnail via /api/upload/slider first.' });
        }
      }

      const result = await db.collection('chatbot_content').updateOne(
        { content_id: 'main_content' },
        { 
          $set: contentData,
          $setOnInsert: { created_at: new Date().toISOString() }
        },
        { upsert: true }
      );

      const updatedContent = await db.collection('chatbot_content').findOne({ content_id: 'main_content' });
      
      if (!updatedContent) {
        return res.status(500).json({ error: 'Failed to retrieve updated content' });
      }
      
      res.status(200).json({ 
        data: {
          slider_images: updatedContent.slider_images,
          quick_questions_title: updatedContent.quick_questions_title || updatedContent.quickQuestionsTitle || 'Quick Questions:',
          predefined_sentences: updatedContent.predefined_sentences,
          welcome_messages: updatedContent.welcome_messages,
          error_messages: updatedContent.error_messages,
          button_labels: updatedContent.button_labels
        },
        message: result.upsertedCount > 0 ? 'Content created' : 'Content updated'
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default compose(withErrorHandling, withTenant)(contentHandler);
