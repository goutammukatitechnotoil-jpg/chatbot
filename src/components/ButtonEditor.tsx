import { useState, useEffect } from 'react';
import { Save, Link as LinkIcon, MessageSquare, ExternalLink, X, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { ChatbotButton, CustomForm } from '../types/forms';
import { buttonService } from '../services/buttonService';
import { formService } from '../services/formService';

interface ButtonEditorProps {
  button: ChatbotButton;
  onClose: () => void;
}

type ActionType = 'chat' | 'form' | 'url' | 'none' | 'expert_support';

import { useLoading } from '../contexts/LoadingContext';

export function ButtonEditor({ button, onClose }: ButtonEditorProps) {
  const { setIsLoading } = useLoading();
  const [actionType, setActionType] = useState<ActionType>('none');
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [customUrl, setCustomUrl] = useState('');
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [newLabel, setNewLabel] = useState(button.label);

  useEffect(() => {
    loadForms();
    loadCurrentAction();
  }, [button]);

  const loadForms = async () => {
    const allForms = await formService.getForms();
    setForms(allForms.filter(f => f.is_active));
  };

  const loadCurrentAction = async () => {
    const formId = await buttonService.getFormIdForButton(button.id);
    if (formId) {
      setActionType('form');
      setSelectedFormId(formId);
    } else if (button.id === 'btn_talk_to_human') {
      setActionType('expert_support');
    } else if (button.type === 'cta' || button.type === 'quick_reply') {
      setActionType('chat');
    } else {
      setActionType('none');
    }
  };

  const handleSaveLabel = async () => {
    if (!newLabel.trim()) return;
    
    setLoading(true);
    setIsLoading(true, 'Updating button label...');
    try {
      await buttonService.updateButton(button.id, {
        ...button,
        label: newLabel.trim()
      });
      button.label = newLabel.trim();
      setEditingLabel(false);
      Swal.fire({
        title: 'Updated!',
        text: 'Button label updated successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Failed to update button label:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update button label',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setIsLoading(true, 'Saving button configuration...');
    try {
      if (actionType === 'form' && selectedFormId) {
        await buttonService.connectButtonToForm(button.id, selectedFormId);
      } else if (actionType === 'none' || actionType === 'chat' || actionType === 'expert_support') {
        await buttonService.disconnectButton(button.id);
      }

      Swal.fire({
        title: 'Configured!',
        text: 'Button action configured successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save button action:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save button action',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const actionTypes = [
    {
      type: 'chat' as ActionType,
      label: 'In-App Chat',
      description: 'Continue conversation within the chatbot',
      icon: MessageSquare,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      available: button.type === 'cta' || button.type === 'quick_reply',
    },
    {
      type: 'expert_support' as ActionType,
      label: 'Speak to Expert',
      description: 'Connect users with human support agents',
      icon: MessageSquare,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      available: button.id === 'btn_talk_to_human',
    },
    {
      type: 'form' as ActionType,
      label: 'Open Form',
      description: 'Display a custom form to collect information',
      icon: LinkIcon,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      available: true,
    },
    {
      type: 'url' as ActionType,
      label: 'Redirect to URL',
      description: 'Navigate to an external URL (Coming Soon)',
      icon: ExternalLink,
      color: 'bg-green-50 border-green-200 text-green-700',
      available: false,
    },
    {
      type: 'none' as ActionType,
      label: 'No Action',
      description: 'Remove any configured action',
      icon: X,
      color: 'bg-gray-50 border-gray-200 text-gray-700',
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Button Information</h3>
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Button Label</p>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-gray-900">{button.label}</p>
              <button
                onClick={() => setEditingLabel(true)}
                className="p-1.5 text-gray-400 hover:text-[#f37021] hover:bg-orange-50 rounded transition-colors flex-shrink-0"
                title="Edit label"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Button Type</p>
            <p className="text-base font-semibold text-gray-900 capitalize">{button.type.replace('_', ' ')}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Description</p>
            <p className="text-base text-gray-900">{button.description}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Location</p>
            <p className="text-base text-gray-900">{button.location}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Configure Action</h3>
        <p className="text-sm text-gray-600 mb-6">
          Select what happens when a user clicks this button
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionTypes.map((action) => {
              const Icon = action.icon;
              const isSelected = actionType === action.type;
              const isDisabled = !action.available;

              return (
                <button
                  key={action.type}
                  onClick={() => !isDisabled && setActionType(action.type)}
                  disabled={isDisabled}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${action.color} border-current shadow-md`
                      : isDisabled
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-white/50' : 'bg-gray-100'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{action.label}</h4>
                        {isDisabled && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1 opacity-80">{action.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-current rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {actionType === 'form' && (
            <div className="mt-6 p-5 bg-orange-50 border-2 border-orange-200 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Form to Display
              </label>
              {forms.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-3">No active forms available</p>
                  <p className="text-sm text-gray-500">Create a form in the Custom Forms section first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {forms.map((form) => (
                    <label
                      key={form.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedFormId === form.id
                          ? 'bg-white border-[#f37021] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="form"
                        value={form.id}
                        checked={selectedFormId === form.id}
                        onChange={(e) => setSelectedFormId(e.target.value)}
                        className="mt-1 w-4 h-4 text-[#f37021] focus:ring-[#f37021]"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{form.form_title}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{form.form_name}</div>
                        {form.form_description && (
                          <div className="text-sm text-gray-500 mt-1">{form.form_description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {actionType === 'url' && (
            <div className="mt-6 p-5 bg-green-50 border-2 border-green-200 rounded-xl">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Enter Destination URL
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-sm text-gray-600 mt-2">
                The button will redirect users to this URL when clicked
              </p>
            </div>
          )}

          {actionType === 'chat' && (
            <div className="mt-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">In-App Chat Behavior</h4>
                  <p className="text-sm text-gray-700">
                    {button.type === 'cta'
                      ? 'This button will continue the conversation within the chatbot interface using AI or connect to human support.'
                      : 'This quick reply will send the message to the bot and continue the conversation.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {actionType === 'none' && (
            <div className="mt-6 p-5 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">No Action Configured</h4>
                  <p className="text-sm text-gray-700">
                    This button will not have any specific action assigned. The default behavior will apply.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || (actionType === 'form' && !selectedFormId)}
          className="px-6 py-3 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {editingLabel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Button Label</h3>
              <button
                onClick={() => {
                  setEditingLabel(false);
                  setNewLabel(button.label);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                  placeholder="Enter button label"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveLabel()}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setEditingLabel(false);
                    setNewLabel(button.label);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLabel}
                  disabled={!newLabel.trim() || loading}
                  className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
