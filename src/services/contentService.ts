const API_BASE_URL = '/api/content';

export interface SliderImage {
  image_url: string;
  link_url: string;
  title: string;
  description: string;
}

export interface ChatbotContent {
  slider_images: SliderImage[];
  quick_questions_title?: string;
  predefined_sentences: string[];
  welcome_messages: string[];
  error_messages: {
    connection_error: string;
    timeout_error: string;
    general_error: string;
  };
  button_labels: {
    send: string;
    close: string;
    minimize: string;
    restart: string;
  };
}

// Safe JSON parsing helper
async function safeJsonParse(response: Response) {
  const text = await response.text();

  if (response.status === 304) {
    throw new Error('Received 304 Not Modified for JSON request. Disable browser caching or use no-store for API requests.');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML instead of JSON - likely a server error or routing issue');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
}

export class ContentService {
  static async getContent(): Promise<ChatbotContent> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
          throw new Error(`Failed to fetch content: ${response.status} ${response.statusText} - Received HTML response`);
        }
        throw new Error(`Failed to fetch content: ${response.status} ${response.statusText} - ${text}`);
      }

      const data = await safeJsonParse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  }

  static async updateContent(content: Partial<ChatbotContent>): Promise<ChatbotContent> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Failed to update content: Payload too large. Ensure slider images are stored as URL references (Cloudinary) rather than inline data URIs.');
        }
        const text = await response.text();
        throw new Error(`Failed to update content: ${response.status} ${response.statusText} - ${text}`);
      }

      const data = await safeJsonParse(response);
      console.log('Content updated successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }

  static async saveContent(content: ChatbotContent): Promise<ChatbotContent> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        throw new Error(`Failed to save content: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      console.log('Content saved successfully:', data.message);
      return data.data;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  }
}

export default ContentService;
