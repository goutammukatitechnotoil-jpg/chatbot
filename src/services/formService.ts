import { CustomForm, FormField, FormSubmission } from '../types/forms';

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!response.ok) {
    if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error(`API request failed ${response.status} ${response.statusText}: received HTML instead of JSON`);
    }

    if (text) {
      try {
        const json = JSON.parse(text);
        throw new Error(`API request failed ${response.status} ${response.statusText}: ${json.error || JSON.stringify(json)}`);
      } catch {
        throw new Error(`API request failed ${response.status} ${response.statusText}: Invalid JSON response: ${text.substring(0, 200)}`);
      }
    }

    throw new Error(`API request failed ${response.status} ${response.statusText}`);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML response instead of JSON - server may be returning an error page');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 200)}...`);
  }
}

export const formService = {
  async getForms(): Promise<CustomForm[]> {
    const response = await fetch('/api/form', { cache: 'no-store' });
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async getFormById(id: string): Promise<CustomForm | null> {
    const response = await fetch(`/api/form/${id}`, { cache: 'no-store' });
    if (response.status === 404) {
      const text = await response.text();
      console.warn(`Form not found for id=${id}. Response text: ${text.substring(0, 200)}`);
      return null;
    }
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async getFormFields(formId: string): Promise<FormField[]> {
    const response = await fetch(`/api/form/fields?formId=${formId}`, { cache: 'no-store' });
    if (response.status === 404) {
      const text = await response.text();
      console.warn(`Form fields not found for formId=${formId}. Response text: ${text.substring(0, 200)}`);
      return [];
    }
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async createForm(form: CustomForm): Promise<CustomForm> {
    const response = await fetch('/api/form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async updateForm(id: string, form: Partial<CustomForm>): Promise<CustomForm> {
    const response = await fetch(`/api/form/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async deleteForm(id: string): Promise<void> {
    const response = await fetch(`/api/form/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const text = await response.text();
      if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
        throw new Error(`API request failed ${response.status} ${response.statusText}: received HTML instead of JSON`);
      }
      throw new Error(`API request failed ${response.status} ${response.statusText}: ${text}`);
    }
  },

  async createField(field: FormField): Promise<FormField> {
    const response = await fetch(`/api/form/fields?formId=${field.form_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(field),
    });
    const result = await parseJsonResponse(response);
    return result?.data;
  },

  async updateField(id: string, field: Partial<FormField>): Promise<FormField> {
    try {
      const response = await fetch(`/api/form/field/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field),
      });
      const result = await parseJsonResponse(response);
      return result?.data;
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
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE') || text.includes('<html>')) {
          throw new Error(`API request failed ${response.status} ${response.statusText}: received HTML instead of JSON`);
        }
        throw new Error(`API request failed ${response.status} ${response.statusText}: ${text}`);
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
    const result = await parseJsonResponse(response);
    return result?.data;
  },
};
