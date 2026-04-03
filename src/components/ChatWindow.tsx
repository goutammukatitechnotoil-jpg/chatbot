import { useState, useRef, useEffect } from 'react';
import { X, Send, User, ExternalLink } from 'lucide-react';
import { ImageSlider } from './ImageSlider';
import { FormRenderer } from './FormRenderer';
import { AdaptiveCard } from './AdaptiveCard';
import { useChatbotConfig } from '../contexts/ChatbotConfigContext';
import { CustomForm, FormField } from '../types/forms';
import { buttonService } from '../services/buttonService';
import { formService } from '../services/formService';

interface Source {
  title: string;
  url?: string;
}

interface Attachment {
  contentType: string;
  content: any;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: Source[];
  attachments?: Attachment[];
  buttonId?: string;
  buttonText?: string;
  isAutoTriggered?: boolean;
}

interface SliderImage {
  image_url: string;
  link_url: string;
}

interface ChatWindowProps {
  onClose: () => void;
  onSpeakToExpert: () => void;
  sliderImages: SliderImage[];
  predefinedSentences: string[];
  onSendMessage: (message: string) => Promise<void>;
  onContinueWithAI: () => void;
  messages: Message[];
  isBotTyping?: boolean;
  onAdaptiveCardSubmit?: (data: Record<string, any>) => void;
  sessionId: string;
}

// Function to render formatted text with markdown-like styling
const renderFormattedText = (text: string) => {
  if (!text) return null;

  // Split text into parts and process formatting
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    // Bold text: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={index} className="font-bold text-gray-900">{content}</strong>;
    }
    // Italic text: *text*
    else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const content = part.slice(1, -1);
      return <em key={index} className="italic">{content}</em>;
    }
    // Code text: `text`
    else if (part.startsWith('`') && part.endsWith('`')) {
      const content = part.slice(1, -1);
      return <code key={index} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{content}</code>;
    }
    // Regular text
    else {
      return part;
    }
  });
};

export function ChatWindow({
  onClose,
  onSpeakToExpert,
  sliderImages,
  predefinedSentences,
  onSendMessage,
  onContinueWithAI,
  messages,
  isBotTyping = false,
  onAdaptiveCardSubmit,
  sessionId,
}: ChatWindowProps) {
  const { config } = useChatbotConfig();
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeForm, setActiveForm] = useState<CustomForm | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [buttonIds, setButtonIds] = useState<{ speakToExpert?: string; continueWithAI?: string }>({});

  useEffect(() => {
    console.log('ChatWindow config updated:', config);
    console.log('Sources width:', config.sourcesWidth);
  }, [config]);

  useEffect(() => {
    const messagesWithSources = messages.filter(m => m.sources && m.sources.length > 0);
    console.log('🔍 ChatWindow received messages with sources:', messagesWithSources.length);
    messagesWithSources.forEach((msg, idx) => {
      console.log(`🔍 Message ${idx + 1} sources:`, msg.sources);
    });
  }, [messages]);

  // Enhanced debugging for sources
  useEffect(() => {
    console.log('🔍 ChatWindow - Total messages:', messages.length);
    const messagesWithSources = messages.filter(m => m.sources && m.sources.length > 0);
    console.log('🔍 ChatWindow - Messages with sources:', messagesWithSources.length);
    messagesWithSources.forEach((msg, idx) => {
      console.log(`🔍 ChatWindow - Message ${idx + 1} ID: ${msg.id}, sources count: ${msg.sources?.length}`, msg.sources);
    });
  }, [messages]);

  // Fetch button IDs on component mount
  useEffect(() => {
    const fetchButtonIds = async () => {
      try {
        const buttons = await buttonService.getButtonsByType('cta');
        const speakToExpertButton = buttons.find(btn => btn.label === 'Speak to Expert');
        const continueWithAIButton = buttons.find(btn => btn.label === 'Continue with AI');

        setButtonIds({
          speakToExpert: speakToExpertButton?.id,
          continueWithAI: continueWithAIButton?.id
        });
      } catch (error) {
        console.error('Error fetching button IDs:', error);
      }
    };

    fetchButtonIds();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleContinueWithAI = () => {
    setShowWelcome(false);
    onContinueWithAI();
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue('');

    await onSendMessage(message);
  };

  const handlePredefinedClick = async (sentence: string) => {
    setInputValue('');
    await onSendMessage(sentence);
  };

  const handleButtonClick = async (buttonId: string, defaultAction?: () => void) => {
    const formId = await buttonService.getFormIdForButton(buttonId);

    if (formId) {
      const form = await formService.getFormById(formId);
      if (form && form.is_active) {
        const fields = await formService.getFormFields(formId);
        setActiveForm(form);
        setFormFields(fields);
        setShowForm(true);
        return;
      }
    }

    if (defaultAction) {
      defaultAction();
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);

    // Set submitting state to show loading indicator
    setFormSubmitting(true);

    try {
      // Convert messages to chat history format
      const chatHistory = messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        message: msg.text,
        timestamp: msg.timestamp.toISOString()
      }));

      // Create lead interaction with conversation history
      const leadData = {
        session_id: sessionId,
        date: new Date().toISOString(),
        chat_history: chatHistory,
        form_data: {
          name: data.Name || data.name || '',
          email: data.Email || data.email || '',
          company: data.Company || data.company || '',
          phone: data.Phone || data.phone || '',
          country: data.Country || data.country || '',
          job_title: data['Job Title'] || data.job_title || data.jobtitle || '',
          purpose: data.Purpose || data.purpose || '',
          details: data.Details || data.details || '',
          ...data // Include any additional form fields
        },
        last_message: messages.length > 0 ? messages[messages.length - 1].text : '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Submit form data (existing functionality)
      await formService.submitForm({
        form_id: activeForm?.id || '',
        session_id: sessionId,
        custom_data: data,
      });

      // Always check for existing lead and update, never create duplicates
      const existingLeadResponse = await fetch(`/api/lead?sessionId=${sessionId}`);
      const existingLeadResult = await existingLeadResponse.json();

      if (existingLeadResult.data) {
        // Update existing lead with form data, merging with existing data
        const mergedLeadData = {
          ...leadData,
          // Merge form_data with existing data, prioritizing new form data
          form_data: {
            ...existingLeadResult.data.form_data,
            ...leadData.form_data,
            // Mark as form submission (not chat only)
            purpose: leadData.form_data.purpose || existingLeadResult.data.form_data.purpose || 'Form Submission'
          },
          // Update with latest chat history
          chat_history: chatHistory,
          last_message: leadData.last_message,
          updated_at: new Date().toISOString()
        };

        const updateResponse = await fetch(`/api/lead/${existingLeadResult.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedLeadData),
        });

        if (updateResponse.ok) {
          console.log('✅ Existing lead updated with form submission data');
        } else {
          console.error('❌ Failed to update existing lead');
        }
      } else {
        // Create new lead entry (fallback case)
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });

        if (!response.ok) {
          throw new Error(`Failed to create lead entry: ${response.status}`);
        }

        console.log('✅ New lead created with form submission data');
      }

      // Show success confirmation
      setFormSubmitting(false);
      setFormSuccess(true);

      // Optional: Send a message to the chat after successful submission
      await onSendMessage(`Form submitted: ${activeForm?.form_name}`);

    } catch (error) {
      console.error('❌ Error submitting form and creating lead:', error);
      setFormSubmitting(false);
      setFormSuccess(false);
      setShowForm(false);
      setActiveForm(null);
      setFormFields([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 sm:bottom-6 sm:right-6 sm:inset-auto w-full h-full sm:w-[1100px] sm:h-[600px] sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-3rem)] bg-white sm:rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
      <div style={{ backgroundColor: config.headerColorTheme }} className="text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
            <img src={config.logoUrl} alt="FPT Software" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg">{config.chatbotName}</h3>
            <p className="text-xs text-gray-200">Online</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {showWelcome ? (
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          <ImageSlider images={sliderImages} />

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={() => handleButtonClick(buttonIds.speakToExpert || '', () => onSpeakToExpert())}
              style={{ backgroundColor: config.colorTheme }}
              className="flex-1 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-sm sm:text-base"
            >
              Speak to Expert
            </button>
            <button
              onClick={() => handleButtonClick(buttonIds.continueWithAI || '', handleContinueWithAI)}
              style={{ backgroundColor: config.colorTheme }}
              className="flex-1 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-sm sm:text-base"
            >
              Continue with AI
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Questions:</h4>
            <div className="space-y-2">
              {predefinedSentences.map((sentence, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleButtonClick(`btn_quick_${index + 1}`, () => {
                      handleContinueWithAI();
                      setTimeout(() => handlePredefinedClick(sentence), 100);
                    });
                  }}
                  className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-sm"
                >
                  {sentence}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-row overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 min-h-0">
              {messages
                .filter((message) => !(message.isAutoTriggered && !message.text))
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-gray-200' : 'bg-white'
                        }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      ) : (
                        <img src={config.logoUrl} alt="FPT" className="w-full h-full object-contain p-0.5" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] sm:max-w-[70%] ${message.sender === 'user' ? 'flex justify-end' : ''}`}
                    >
                      <div className="space-y-2">
                        {message.text && (
                          <div
                            style={message.sender === 'user' ? { backgroundColor: config.colorTheme } : {}}
                            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${message.sender === 'user'
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                              {renderFormattedText(message.text)}
                            </div>
                          </div>
                        )}

                        {/* Render Adaptive Cards */}
                        {message.sender === 'bot' && message.attachments?.map((attachment, index) => {
                          if (attachment.contentType === 'application/vnd.microsoft.card.adaptive') {
                            return (
                              <div key={`card-${index}`} className="mt-2">
                                <AdaptiveCard
                                  content={attachment.content}
                                  onSubmit={(data) => {
                                    console.log('Adaptive Card submitted:', data);
                                    if (onAdaptiveCardSubmit) {
                                      onAdaptiveCardSubmit(data);
                                    }
                                  }}
                                />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}

              {isBotTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <img src="/FPTSoftware.png" alt="FPT" className="w-full h-full object-contain p-0.5" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {predefinedSentences.length > 0 && (
              <div className="px-3 sm:px-6 py-2 sm:py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {predefinedSentences.map((sentence, index) => (
                    <button
                      key={index}
                      onClick={() => handlePredefinedClick(sentence)}
                      className="flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-300 rounded-full text-[10px] sm:text-xs hover:border-[#f37021] hover:bg-orange-50 transition-colors whitespace-nowrap"
                    >
                      {sentence}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                  style={{ '--tw-ring-color': config.colorTheme } as React.CSSProperties}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  style={{ backgroundColor: inputValue.trim() ? config.colorTheme : undefined }}
                  className="w-10 h-10 sm:w-12 sm:h-12 text-white rounded-lg hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex border-l border-gray-200 bg-gray-50 flex-col overflow-hidden flex-shrink-0"
            style={{
              width: '300px',
              minWidth: '280px'
            }}
          >
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <h4 className="font-semibold text-gray-800 mb-4 sticky top-0 bg-gray-50 pb-2">Sources</h4>
              <div className="space-y-3 pb-4">
                {messages
                  .filter((m) => m.sources && m.sources.length > 0)
                  .slice(-3)  // Show sources from last 3 messages instead of just 1
                  .map((message) => (
                    <div key={message.id} className="space-y-3">
                      {message.sources?.map((source, idx) => (
                        <div
                          key={`${message.id}-${idx}`}
                          className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {idx + 1}. {source.title}
                            </p>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#f37021] hover:text-[#d85a0a] hover:underline flex items-start gap-1 break-all leading-relaxed"
                              >
                                <span className="break-words flex-1">{source.url}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                {messages.filter((m) => m.sources && m.sources.length > 0).length === 0 && (
                  <p className="text-sm text-gray-500 text-center mt-8">
                    Source references will appear here
                  </p>
                )}
              </div>
            </div>

            {(() => {
              const triggeredMessage = messages.slice().reverse().find(m => m.buttonId && m.isAutoTriggered);
              return triggeredMessage ? (
                <div className="border-t border-gray-300 bg-white p-3 sm:p-4 flex-shrink-0">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-3 sm:p-4 shadow-sm">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 sm:mb-3 text-center">
                      Would you like to get a personalized quote?
                    </p>
                    <button
                      onClick={() => handleButtonClick(triggeredMessage.buttonId!)}
                      style={{ backgroundColor: config.colorTheme }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-white text-xs sm:text-sm font-bold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      {triggeredMessage.buttonText}
                    </button>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {showForm && activeForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-6 z-10 overflow-y-auto">
          <div className="w-full max-w-2xl my-auto">
            <FormRenderer
              form={activeForm}
              fields={formFields}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setActiveForm(null);
                setFormFields([]);
                setFormSubmitting(false);
                setFormSuccess(false);
              }}
              isLoading={formSubmitting}
              isSuccess={formSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
