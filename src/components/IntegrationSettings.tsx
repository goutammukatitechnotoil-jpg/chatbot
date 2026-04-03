import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { WebhookConfig, WebhookFieldMapping } from '../../pages/api/integrations/webhook';

interface IntegrationSettingsProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

// Define available lead fields that can be mapped
const LEAD_FIELDS = [
  { key: 'session_id', label: 'Session ID', required: false },
  { key: 'name', label: 'Name', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Phone', required: false },
  { key: 'company', label: 'Company', required: false },
  { key: 'job_title', label: 'Job Title', required: false },
  { key: 'country', label: 'Country', required: false },
  { key: 'purpose', label: 'Purpose', required: false },
  { key: 'details', label: 'Details', required: false },
  { key: 'message', label: 'Message', required: false },
  { key: 'bot_conversation', label: 'Bot Conversation', required: false },
  { key: 'source', label: 'Source', required: false },
  { key: 'created_at', label: 'Created Date', required: false },
  { key: 'ip_address', label: 'IP Address', required: false },
  { key: 'user_agent', label: 'User Agent', required: false },
];

import { useLoading } from '../contexts/LoadingContext';

const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ canEdit, canDelete }) => {
  const { setIsLoading } = useLoading();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST' as 'POST' | 'PUT',
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
    fieldMappings: [] as WebhookFieldMapping[],
    isActive: true
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/integrations/webhook');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data.data || []);
      } else {
        throw new Error('Failed to fetch webhooks');
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setMessage({ type: 'error', text: 'Failed to load webhook configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsLoading(true, editingWebhook ? 'Updating webhook...' : 'Creating webhook...');

    try {
      const url = '/api/integrations/webhook';
      const method = editingWebhook ? 'PUT' : 'POST';
      const payload = editingWebhook 
        ? { _id: editingWebhook._id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await response.json();
        setMessage({ 
          type: 'success', 
          text: editingWebhook ? 'Webhook updated successfully!' : 'Webhook created successfully!' 
        });
        await fetchWebhooks();
        resetForm();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save webhook');
      }
    } catch (error) {
      console.error('Error saving webhook:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save webhook configuration' 
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleDelete = async (webhookId: string) => {
    Swal.fire({
      title: 'Delete Webhook?',
      text: 'Are you sure you want to delete this webhook configuration? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f37021',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        setIsLoading(true, 'Deleting webhook...');
        try {
          const response = await fetch(`/api/integrations/webhook?id=${webhookId}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Webhook has been deleted.',
              icon: 'success',
              confirmButtonColor: '#f37021',
            });
            await fetchWebhooks();
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete webhook');
          }
        } catch (error) {
          console.error('Error deleting webhook:', error);
          Swal.fire({
            title: 'Error!',
            text: error instanceof Error ? error.message : 'Failed to delete webhook configuration',
            icon: 'error',
            confirmButtonColor: '#f37021',
          });
        } finally {
          setLoading(false);
          setIsLoading(false);
        }
      }
    });
  };

  const handleEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      headers: webhook.headers,
      fieldMappings: webhook.fieldMappings,
      isActive: webhook.isActive
    });
    setShowForm(true);
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    Swal.fire({
      title: 'Test Webhook?',
      html: `Ready to test webhook <strong>"${webhook.name}"</strong>?<br/><br/>This will send sample lead data to:<br/><code style="font-size: 0.8em; word-break: break-all;">${webhook.url}</code>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f37021',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Test Now'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        setIsLoading(true, 'Testing webhook...');
        try {
          // Call server-side API to test webhook (avoids CORS issues)
          const response = await fetch('/api/integrations/test-webhook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ webhook })
          });

          const result = await response.json();
          
          if (result.success) {
            Swal.fire({
              title: 'Success!',
              text: result.message || 'Webhook test successful!',
              icon: 'success',
              confirmButtonColor: '#f37021',
            });
          } else {
            Swal.fire({
              title: 'Test Failed',
              text: result.message || 'Webhook test failed. Check the URL and configuration.',
              icon: 'error',
              confirmButtonColor: '#f37021',
            });
          }
        } catch (error) {
          console.error('Error testing webhook:', error);
          Swal.fire({
            title: 'Error!',
            text: `Error testing webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
            icon: 'error',
            confirmButtonColor: '#f37021',
          });
        } finally {
          setLoading(false);
          setIsLoading(false);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' } as Record<string, string>,
      fieldMappings: [],
      isActive: true
    });
    setEditingWebhook(null);
    setShowForm(false);
  };

  const addFieldMapping = () => {
    setFormData({
      ...formData,
      fieldMappings: [
        ...formData.fieldMappings,
        { leadField: '', webhookField: '', required: false }
      ]
    });
  };

  const updateFieldMapping = (index: number, field: keyof WebhookFieldMapping, value: any) => {
    const mappings = [...formData.fieldMappings];
    mappings[index] = { ...mappings[index], [field]: value };
    setFormData({ ...formData, fieldMappings: mappings });
  };

  const removeFieldMapping = (index: number) => {
    const mappings = formData.fieldMappings.filter((_, i) => i !== index);
    setFormData({ ...formData, fieldMappings: mappings });
  };

  const addHeader = () => {
    const key = prompt('Enter header key:');
    if (key) {
      const value = prompt('Enter header value:') || '';
      setFormData({
        ...formData,
        headers: { ...formData.headers, [key]: value }
      });
    }
  };

  const removeHeader = (key: string) => {
    const remainingHeaders = { ...formData.headers };
    delete remainingHeaders[key];
    // Ensure Content-Type header always exists
    if (!remainingHeaders['Content-Type']) {
      remainingHeaders['Content-Type'] = 'application/json';
    }
    setFormData({ ...formData, headers: remainingHeaders });
  };

  if (loading && webhooks.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-48 bg-blue-50 rounded-lg animate-pulse" />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-100" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 border-b border-gray-100 mx-6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Integration Settings</h2>
        <button
          onClick={() => canEdit && setShowForm(true)}
          className={`px-4 py-2 rounded-md transition-colors ${canEdit ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          disabled={loading || !canEdit}
        >
          Add Webhook
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Start Guide */}
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 mb-6">
        <div className="px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-medium text-blue-900">🚀 Quick Start</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-medium text-blue-900 mb-2">Test Webhook Endpoint</h4>
              <div className="bg-white rounded border p-3">
                <code className="text-sm text-gray-800">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/webhook/test
                </code>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Use this endpoint to test your webhook integration. It logs all received data to the console.
              </p>
            </div>
            <div>
              <h4 className="text-md font-medium text-blue-900 mb-2">Quick Setup</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Click "Add Webhook" above</li>
                <li>Use the test endpoint URL</li>
                <li>Configure field mappings</li>
                <li>Click "Test" to verify</li>
                <li>Replace with your real endpoint</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Webhook Configurations</h3>
        </div>
        
        {webhooks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No webhook configurations found. Create your first webhook to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <div key={webhook.webhook_id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{webhook.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        webhook.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>URL:</strong> {webhook.url}</div>
                      <div><strong>Method:</strong> {webhook.method}</div>
                      <div><strong>Field Mappings:</strong> {webhook.fieldMappings.length} configured</div>
                      <div><strong>Created:</strong> {new Date(webhook.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => canEdit && handleTestWebhook(webhook)}
                      className={`text-sm font-medium ${canEdit ? 'text-green-600 hover:text-green-800' : 'text-gray-300 cursor-not-allowed'}`}
                      disabled={loading || !canEdit}
                    >
                      Test
                    </button>
                    <button
                      onClick={() => canEdit && handleEdit(webhook)}
                      className={`text-sm font-medium ${canEdit ? 'text-blue-600 hover:text-blue-800' : 'text-gray-300 cursor-not-allowed'}`}
                      disabled={loading || !canEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => canDelete && handleDelete(webhook.webhook_id)}
                      className={`text-sm font-medium ${canDelete ? 'text-red-600 hover:text-red-800' : 'text-gray-300 cursor-not-allowed'}`}
                      disabled={loading || !canDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingWebhook ? 'Edit Webhook Configuration' : 'Add New Webhook Configuration'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CRM Integration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTTP Method
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as 'POST' | 'PUT' })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-service.com/webhook"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active (webhook will be triggered on new leads)
                </label>
              </div>

              {/* Headers Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Headers
                  </label>
                  <button
                    type="button"
                    onClick={addHeader}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add Header
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                      <span className="text-gray-500">:</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          headers: { ...formData.headers, [key]: e.target.value }
                        })}
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeader(key)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Mappings Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Field Mappings
                  </label>
                  <button
                    type="button"
                    onClick={addFieldMapping}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add Field Mapping
                  </button>
                </div>
                
                {formData.fieldMappings.length === 0 ? (
                  <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-md">
                    No field mappings configured. Add mappings to send specific lead data to your webhook.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fieldMappings.map((mapping, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border border-gray-200 rounded-md">
                        <div className="flex-1">
                          <select
                            value={mapping.leadField}
                            onChange={(e) => updateFieldMapping(index, 'leadField', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Lead Field</option>
                            {LEAD_FIELDS.map(field => (
                              <option key={field.key} value={field.key}>{field.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-gray-500">→</div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Webhook field name"
                            value={mapping.webhookField}
                            onChange={(e) => updateFieldMapping(index, 'webhookField', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={mapping.required}
                            onChange={(e) => updateFieldMapping(index, 'required', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-1 text-xs text-gray-600">Required</label>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFieldMapping(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingWebhook ? 'Update Webhook' : 'Create Webhook')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;
