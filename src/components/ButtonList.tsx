import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MousePointer, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { ChatbotButton } from '../types/forms';
import { buttonService } from '../services/buttonService';
import { formService } from '../services/formService';
import { ButtonEditor } from './ButtonEditor';

export function ButtonList({ canEdit }: { canEdit?: boolean }) {
  const [buttons, setButtons] = useState<ChatbotButton[]>([]);
  const [selectedButton, setSelectedButton] = useState<ChatbotButton | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [buttonActions, setButtonActions] = useState<Map<string, ButtonAction>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadButtons();
  }, []);

  const loadButtons = async () => {
    setLoading(true);
    try {
      const allButtons = await buttonService.getAllButtons();
      setButtons(allButtons);
      await loadButtonActions(allButtons);
    } catch (error) {
      console.error('Failed to load buttons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadButtonActions = async (buttons: ChatbotButton[]) => {
    const actionsMap = new Map<string, ButtonAction>();
    const connections = await buttonService.getAllConnections();
    const forms = await formService.getForms();

    for (const button of buttons) {
      const connection = connections.find(conn => conn.button_id === button.id);

      if (connection) {
        const form = forms.find(f => f.id === connection.form_id);
        if (form) {
          actionsMap.set(button.id, {
            type: 'form',
            label: 'Open Form',
            value: form.form_title,
            formId: form.id,
          });
        }
      } else {
        switch (button.type) {
          case 'cta':
            if (button.id === 'btn_continue_ai') {
              actionsMap.set(button.id, {
                type: 'chat',
                label: 'Continue with AI Chat',
                value: 'Opens AI conversation',
              });
            } else if (button.id === 'btn_talk_to_human') {
              actionsMap.set(button.id, {
                type: 'expert_support',
                label: 'Speak to Expert',
                value: 'Connect users with human support agents',
              });
            }
            break;
          case 'quick_reply':
            actionsMap.set(button.id, {
              type: 'chat',
              label: 'Send Message to Bot',
              value: button.label,
            });
            break;
          case 'menu':
            actionsMap.set(button.id, {
              type: 'unassigned',
              label: 'No Action Assigned',
              value: 'Click to configure',
            });
            break;
        }
      }
    }

    setButtonActions(actionsMap);
  };

  const getButtonTypeColor = (type: string) => {
    switch (type) {
      case 'cta':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'quick_reply':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'menu':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'form':
        return <LinkIcon className="w-4 h-4" />;
      case 'chat':
        return <MousePointer className="w-4 h-4" />;
      case 'url':
        return <ExternalLink className="w-4 h-4" />;
      case 'expert_support':
        return <MousePointer className="w-4 h-4" />;
      default:
        return <MousePointer className="w-4 h-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'form':
        return 'text-[#f37021] bg-orange-50';
      case 'chat':
        return 'text-blue-600 bg-blue-50';
      case 'url':
        return 'text-green-600 bg-green-50';
      case 'expert_support':
        return 'text-purple-600 bg-purple-50';
      case 'unassigned':
        return 'text-gray-500 bg-gray-50 border-dashed';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleEditButton = (button: ChatbotButton) => {
    if (!canEdit) return;
    setSelectedButton(button);
    setIsEditing(true);
  };

  const handleCloseEditor = () => {
    setSelectedButton(null);
    setIsEditing(false);
    loadButtons();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="h-6 w-1/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-50 rounded" />
              </div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEditing && selectedButton) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCloseEditor}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Buttons
          </button>
          <h2 className="text-xl font-bold text-gray-900">Configure Button Action</h2>
        </div>
        <ButtonEditor button={selectedButton} onClose={handleCloseEditor} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f37021] to-[#d85a0a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Chatbot Buttons</h2>
            <p className="text-white/90">Manage button actions and configure redirections</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-3xl font-bold">{buttons.length}</div>
            <div className="text-sm opacity-90">Total Buttons</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {buttons.map((button) => {
          const action = buttonActions.get(button.id);
          return (
            <div
              key={button.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-[#f37021] transition-all p-6 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{button.label}</h3>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getButtonTypeColor(button.type)}`}>
                          {button.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{button.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Location: {button.location}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action ? getActionColor(action.type) : 'bg-gray-50'}`}>
                          {action ? getActionIcon(action.type) : <MousePointer className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              {action?.label || 'No Action'}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {action?.value || 'Click configure to set up an action'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEditButton(button)}
                    disabled={!canEdit}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 whitespace-nowrap ${
                      canEdit ? 'bg-[#f37021] text-white hover:bg-[#d85a0a]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Configure
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {buttons.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MousePointer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Buttons Available</h3>
          <p className="text-gray-600">Buttons will appear here once configured in the bot</p>
        </div>
      )}
    </div>
  );
}

interface ButtonAction {
  type: 'form' | 'chat' | 'url' | 'unassigned' | 'expert_support';
  label: string;
  value: string;
  formId?: string;
  url?: string;
}
