import { ChatbotButton, ButtonFormConnection } from '../types/forms';

// Helper function to safely parse JSON responses
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML response instead of JSON - server may have returned an error page');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
};

export const buttonService = {
  async getAllButtons(): Promise<ChatbotButton[]> {
    try {
      const response = await fetch('/api/button');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching buttons:', error);
      return [];
    }
  },

  async getButtonById(id: string): Promise<ChatbotButton | null> {
    try {
      const response = await fetch(`/api/button/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.data;
    } catch (error) {
      console.error('Error fetching button by id:', error);
      return null;
    }
  },

  async getButtonsByType(type: 'quick_reply' | 'cta' | 'menu'): Promise<ChatbotButton[]> {
    try {
      const response = await fetch(`/api/button?type=${type}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching buttons by type:', error);
      return [];
    }
  },

  async connectButtonToForm(buttonId: string, formId: string): Promise<void> {
    try {
      const response = await fetch('/api/button/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonId, formId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error connecting button to form:', error);
      throw error;
    }
  },

  async disconnectButton(buttonId: string): Promise<void> {
    try {
      const response = await fetch('/api/button/connect', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buttonId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error disconnecting button:', error);
      throw error;
    }
  },

  async getFormIdForButton(buttonId: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/button/connection?buttonId=${buttonId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.formId || null;
    } catch (error) {
      console.error('Error getting form ID for button:', error);
      return null;
    }
  },

  async getButtonsConnectedToForm(formId: string): Promise<ChatbotButton[]> {
    try {
      const response = await fetch(`/api/button/connections?formId=${formId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error getting buttons connected to form:', error);
      return [];
    }
  },

  async getAllConnections(): Promise<ButtonFormConnection[]> {
    try {
      const response = await fetch('/api/button/connections');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await safeJsonParse(response);
      return result.data || [];
    } catch (error) {
      console.error('Error getting all connections:', error);
      return [];
    }
  },

  async updateButton(buttonId: string, buttonData: Partial<ChatbotButton>): Promise<void> {
    try {
      const response = await fetch(`/api/button/${buttonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buttonData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating button:', error);
      throw error;
    }
  },
};
