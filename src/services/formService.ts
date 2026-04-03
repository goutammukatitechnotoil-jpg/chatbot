import { CustomForm, FormField, FormSubmission } from '../types/forms';

export const formService = {
  async getForms(): Promise<CustomForm[]> {
    const response = await fetch('/api/form');
    const result = await response.json();
    return result.data;
  },

  async getFormById(id: string): Promise<CustomForm | null> {
    const response = await fetch(`/api/form/${id}`);
    const result = await response.json();
    return result.data;
  },  async getFormFields(formId: string): Promise<FormField[]> {
    const response = await fetch(`/api/form/fields?formId=${formId}`);
    const result = await response.json();
    return result.data;
  },

  async createForm(form: CustomForm): Promise<CustomForm> {
    const response = await fetch('/api/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    return result.data;
  },

  async updateForm(id: string, form: Partial<CustomForm>): Promise<CustomForm> {
    const response = await fetch(`/api/form/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    return result.data;
  },

  async deleteForm(id: string): Promise<void> {
    await fetch(`/api/form/${id}`, {
      method: 'DELETE',
    });
  },

  async createField(field: FormField): Promise<FormField> {
    const response = await fetch(`/api/form/fields?formId=${field.form_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(field),
    });
    const result = await response.json();
    return result.data;
  },

  async updateField(id: string, field: Partial<FormField>): Promise<FormField> {
    try {
      const response = await fetch(`/api/form/field/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        return result.data;
      } catch (jsonError) {
        if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
          throw new Error('Received HTML response instead of JSON - server may have returned an error page');
        }
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Error updating field:', error);
      throw error;
    }
  },

  async deleteField(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/form/field/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  },

  async submitForm(submission: FormSubmission): Promise<FormSubmission> {
    const response = await fetch('/api/form/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    const result = await response.json();
    return result.data;
  },
};
