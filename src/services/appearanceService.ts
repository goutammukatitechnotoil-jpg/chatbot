interface AppearanceDraft {
  _id?: string;
  chatbotId: string;
  name: string;
  colorTheme: string;
  headerColorTheme: string;
  logoUrl: string;
  iconType: 'default' | 'siriwhite' | 'siritrans';
  chatbotName: string;
  quickQuestionsTitle?: string;
  triggerMessage: string;
  botGreetingMessage: string;
  popupTitle: string;
  popupDescription: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = '/api/appearance/drafts';

export class AppearanceService {
  static async getDrafts(chatbotId: string = 'main'): Promise<AppearanceDraft[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatbotId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch drafts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching drafts:', error);
      throw error;
    }
  }

  static async saveDraft(chatbotId: string, draftData: Omit<AppearanceDraft, '_id' | 'chatbotId' | 'created_at' | 'updated_at'>): Promise<AppearanceDraft> {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatbotId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save draft: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  static async deleteDraft(chatbotId: string, draftId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draftId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete draft: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  }

  static async getDraftById(draftId: string): Promise<AppearanceDraft | null> {
    try {
      // Since we don't have a specific endpoint, we'll get all drafts and find the one we need
      const drafts = await this.getDrafts('main');
      return drafts.find(draft => draft._id === draftId) || null;
    } catch (error) {
      console.error('Error fetching draft by ID:', error);
      throw error;
    }
  }
}

export default AppearanceService;