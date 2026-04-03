import { useState, useEffect, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { ChatbotIcon } from './ChatbotIcon';
import { ChatWindow } from './ChatWindow';
import { DirectLineService } from '../services/directLineService';
import { useChatbotConfig } from '../contexts/ChatbotConfigContext';
import { detectBrowserLocale } from '../utils/locale';
import { leadService } from '../services/leadService';
import { SessionInfoService } from '../services/sessionInfoService';

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

import { ContentService, ChatbotContent } from '../services/contentService';

// All content now comes from API/database - no hardcoded fallbacks needed

export function Chatbot() {
  const { config } = useChatbotConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [directLineService] = useState(() => new DirectLineService(config.tokenEndpoint));
  const [content, setContent] = useState<ChatbotContent | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [awaitingResponseSince, setAwaitingResponseSince] = useState<number | null>(null);
  const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set());
  const [recentSentMessages, setRecentSentMessages] = useState<Array<{text: string, timestamp: number}>>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const sentMessageIdsRef = useRef<Set<string>>(new Set());
  const recentSentMessagesRef = useRef<Array<{text: string, timestamp: number}>>([]);

  useEffect(() => {
    directLineService.setTokenEndpoint(config.tokenEndpoint);
  }, [config.tokenEndpoint, directLineService]);



  // Sync refs with state for polling access
  useEffect(() => {
    sentMessageIdsRef.current = sentMessageIds;
    recentSentMessagesRef.current = recentSentMessages;
    console.log('🔄 Synced refs with state:', {
      sentMessageIds: Array.from(sentMessageIds),
      recentSentMessages: recentSentMessages.length
    });
  }, [sentMessageIds, recentSentMessages]);

  // Load content from API
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const contentData = await ContentService.getContent();
      setContent(contentData);
    } catch (error) {
      console.error('Failed to load content from API:', error);
      // Content will be null, components should handle gracefully
      setContent(null);
    }
  };


  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isOpen, isInitialized, directLineService, config.locale, config.autoDetectLocale]);

  const startPolling = useCallback(() => {
    console.log('Starting polling loop...');

    const poll = async () => {
      const activities = await directLineService.pollMessages();

      if (activities && activities.length > 0) {
        // Process bot messages

        activities.forEach((activity) => {
          console.log('🔍🔍🔍 PROCESSING ACTIVITY:', {
            id: activity.id,
            fromId: activity.from?.id,
            text: activity.text?.substring(0, 100),
            hasAttachments: !!activity.attachments
          });
          console.log('🔍 Current sentMessageIds (ref):', Array.from(sentMessageIdsRef.current));
          console.log('🔍 Recent sent messages (ref):', recentSentMessagesRef.current);
          console.log('🔍 ID match check:', activity.id, 'in set?', sentMessageIdsRef.current.has(activity.id || ''));
          
          // Skip only regular text messages that we sent (not adaptive card related messages)
          const isOwnTextMessage = (
            // Check by message ID for regular text messages only
            (activity.id && activity.text && sentMessageIdsRef.current.has(activity.id)) ||
            // Check if this text matches a recently sent message (for regular text messages)
            (activity.text && 
             recentSentMessagesRef.current.some(sent => 
               sent.text === activity.text && 
               (Date.now() - sent.timestamp) < 10000 // Within last 10 seconds
             ))
          );
          
          if (isOwnTextMessage) {
            console.log('🔇🔇🔇 SKIPPING OWN TEXT MESSAGE:', {
              id: activity.id,
              fromId: activity.from?.id,
              text: activity.text?.substring(0, 50),
              reason: 'Text message ID match or recent text match'
            });
            return;
          }
          
          // Process bot messages (either text or attachments) - exclude messages from user or user1
          if (activity.from?.id !== 'user' && activity.from?.id !== 'user1' && (activity.text || activity.attachments)) {
            
            // Filter out form submission echo messages (system responses we don't want to show)
            if (activity.text) {
              const messageText = activity.text.trim();
              
              // Check if this is a form submission echo from the bot (the specific format you showed)
              const isFormEcho = (
                messageText.includes('"actionSubmitId"') && 
                (messageText.includes('"Submit"') || messageText.includes('"Skip"')) &&
                messageText.includes('"name"') && 
                messageText.includes('"email"')
              );
              
              if (isFormEcho) {
                console.log('🔇 Filtering out form submission echo message:', messageText.substring(0, 100) + '...');
                return; // Skip this message
              }
            }

            setMessages((prev) => {
              const exists = prev.some((m) => m.id === activity.id);
              if (exists) return prev;

              let messageText = activity.text || '';
              let parsedSources: Source[] = [];

              // Remove FleziMate signature
              messageText = messageText.replace(/\*\*FleziMate,\s*the\s*virtual\s*assistant\s*of\s*FPT\s*Software\*\*/gi, '').trim();
              
              // Special debugging for "Source List of Response"
              if (messageText.toLowerCase().includes('source list of response')) {
                console.log('🚨 FOUND MESSAGE WITH "Source List of Response"!');
                console.log('🚨 Full message text:', messageText);
                console.log('🚨 Looking for source patterns...');
              }

              // Parse sources from the message text - improved with multiple patterns
              console.log('🔍 Parsing sources from message:', messageText.substring(0, 200) + '...');
              console.log('🔍 Full message text for debugging:', messageText);
              
              // Pattern 1: **Source List of Response:** (with colon)
              let sourceListMatch = messageText.match(/\*\*Source List of Response:\*\*([\s\S]*?)$/i);
              
              // Pattern 2: **Source List of Response** (without colon) - NEW PATTERN
              if (!sourceListMatch) {
                sourceListMatch = messageText.match(/\*\*Source List of Response\*\*([\s\S]*?)$/i);
              }
              
              // Pattern 3: **Sources:** or **References:**
              if (!sourceListMatch) {
                sourceListMatch = messageText.match(/\*\*(Sources?|References?):\*\*([\s\S]*?)$/i);
              }
              
              // Pattern 4: Just "Sources:" without asterisks
              if (!sourceListMatch) {
                sourceListMatch = messageText.match(/Sources?:\s*([\s\S]*?)$/i);
              }
              
              // Pattern 5: Alternative patterns for variations
              if (!sourceListMatch) {
                sourceListMatch = messageText.match(/Source List of Response:\s*([\s\S]*?)$/i);
              }
              
              // Pattern 6: Try to catch any remaining source patterns
              if (!sourceListMatch) {
                sourceListMatch = messageText.match(/(Source List[^:]*:?\s*)([\s\S]*?)$/i);
                if (sourceListMatch) {
                  console.log('🔍 Caught with pattern 6:', sourceListMatch[0].substring(0, 100));
                }
              }
              
              console.log('🔍 Source match result:', sourceListMatch ? 'Found' : 'Not found');
              if (sourceListMatch) {
                console.log('🔍 Matched pattern:', sourceListMatch[0].substring(0, 100));
                console.log('🔍 Source content to parse:', sourceListMatch[1] || sourceListMatch[2]);
              }

              if (sourceListMatch) {
                console.log('🔍 Found source section:', sourceListMatch[0]);
                const sourceSection = sourceListMatch[1] || sourceListMatch[2];

                // Extract individual sources - try multiple patterns
                const lines = sourceSection.split('\n').filter(line => line.trim());
                console.log('🔍 Source lines to parse:', lines);

                lines.forEach((line, lineIndex) => {
                  console.log(`🔍 Processing line ${lineIndex}:`, line);
                  
                  // Pattern A: Reference format [1]: https://url "Title"
                  const refMatch = line.match(/^\[(\d+)\]:\s*(https?:\/\/[^\s]+)\s*"([^"]+)"/);
                  if (refMatch) {
                    const source = {
                      title: refMatch[3].trim(),
                      url: refMatch[2],
                    };
                    console.log('🔍 Parsed reference source:', source);
                    parsedSources.push(source);
                  }
                  // Pattern B: Numbered items (1., 2., etc.)
                  else if (line.match(/^\d+\.\s*/)) {
                    const titleMatch = line.match(/\*\*([^*]+)\*\*/) || line.match(/([^http]+?)(?=https?:|$)/);
                    const urlMatch = line.match(/https?:\/\/[^\s\)]+/);

                    if (titleMatch || urlMatch) {
                      const source = {
                        title: titleMatch ? titleMatch[1].trim() : (urlMatch ? 'Source' : line.replace(/^\d+\.\s*/, '').trim()),
                        url: urlMatch ? urlMatch[0] : undefined,
                      };
                      console.log('🔍 Parsed numbered source:', source);
                      parsedSources.push(source);
                    }
                  } 
                  // Pattern C: Lines with URLs (with or without bullets/dashes)
                  else if (line.includes('http')) {
                    const urlMatch = line.match(/https?:\/\/[^\s\)]+/);
                    const titleMatch = line.match(/\*\*([^*]+)\*\*/) || 
                                     line.match(/[-•*]\s*(.+?)(?=https?:|$)/) ||
                                     line.match(/^(.+?)(?=https?:|$)/);

                    if (urlMatch) {
                      const source = {
                        title: titleMatch ? titleMatch[1].trim().replace(/[*\-\[\]•]/g, '').trim() : 'Source',
                        url: urlMatch[0],
                      };
                      console.log('🔍 Parsed URL source:', source);
                      parsedSources.push(source);
                    }
                  }
                  // Pattern C: Bold titles without URLs
                  else if (line.includes('**')) {
                    const titleMatch = line.match(/\*\*([^*]+)\*\*/);
                    if (titleMatch) {
                      const source = {
                        title: titleMatch[1].trim(),
                        url: undefined,
                      };
                      console.log('🔍 Parsed title-only source:', source);
                      parsedSources.push(source);
                    }
                  }
                });

                // Remove the source section from the message text
                const originalLength = messageText.length;
                messageText = messageText.replace(/\*\*Source List of Response:\*\*[\s\S]*$/i, '').trim();
                messageText = messageText.replace(/\*\*Source List of Response\*\*[\s\S]*$/i, '').trim();
                messageText = messageText.replace(/\*\*(Sources?|References?):\*\*[\s\S]*$/i, '').trim();
                messageText = messageText.replace(/Source List of Response:\s*[\s\S]*$/i, '').trim();
                messageText = messageText.replace(/Sources?:\s*[\s\S]*$/i, '').trim();
                
                const newLength = messageText.length;
                console.log(`🔍 Message after source removal (${originalLength} -> ${newLength} chars):`, messageText.substring(0, 200) + '...');
                console.log('🔍 Extracted sources count:', parsedSources.length);
                parsedSources.forEach((source, idx) => {
                  console.log(`🔍 Source ${idx + 1}:`, source.title, source.url || '(no URL)');
                });
              } else {
                console.log('🔍 No source section found in message');
                // Check if message contains source-like content that wasn't matched
                if (messageText.toLowerCase().includes('source list') || 
                    messageText.toLowerCase().includes('sources:') ||
                    messageText.toLowerCase().includes('references:')) {
                  console.warn('🚨 Message contains source-like content but no sources were parsed!');
                  console.warn('🚨 This might indicate a parsing issue');
                }
              }

              // Process attachments
              let processedAttachments: Attachment[] = [];
              const attachmentSources: Source[] = [];
              
              if (activity.attachments) {
                console.log('🎯 Processing attachments:', activity.attachments);
                
                activity.attachments.forEach((att: any, index: number) => {
                  console.log(`🎯 Attachment ${index}:`, att.contentType, att.content);
                  
                  // Check for Adaptive Cards
                  if (att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content) {
                    processedAttachments.push({
                      contentType: att.contentType,
                      content: att.content,
                    });
                    console.log('🎯 Added Adaptive Card attachment:', att.content.type);
                  } else {
                    // Process as source for other attachment types
                    const source: Source = {
                      title: att.content?.title || att.content?.text || 'Source',
                      url: att.contentUrl || att.content?.url,
                    };
                    if (source.title || source.url) {
                      attachmentSources.push(source);
                    }
                  }
                });
              }

              const allSources = parsedSources.length > 0 ? parsedSources : attachmentSources;

              console.log('Original message:', activity.text);
              console.log('Cleaned message:', messageText);
              console.log('Parsed sources:', allSources);
              console.log('🔍 Sources will be added to message:', allSources.length > 0 ? 'YES' : 'NO');
              console.log('Processed attachments:', processedAttachments);

              if (!messageText && allSources.length === 0 && processedAttachments.length === 0) {
                 console.log('🔇 Ignoring empty bot response without content or attachments');
                 return prev;
              }

              // Hide typing indicator immediately when bot message is added
              setIsBotTyping(false);
              setAwaitingResponseSince(null);
              console.log('Bot response received, hiding typing indicator');

              // Note: Auto-trigger functionality has been removed to focus on lead tracking

              // Track bot message in lead system
              if (messageText) {
                leadService.createOrUpdateSession(
                  sessionId, 
                  messageText, 
                  'bot', 
                  allSources?.length ? allSources : undefined,
                  processedAttachments.length ? processedAttachments : undefined
                ).then((success) => {
                  if (!success) {
                    console.warn('Failed to track bot message in lead system');
                  }
                });
              }

              return [
                ...prev,
                {
                  id: activity.id || `bot-${Date.now()}`,
                  text: messageText,
                  sender: 'bot' as const,
                  timestamp: new Date(),
                  sources: allSources?.length ? allSources : undefined,
                  attachments: processedAttachments.length ? processedAttachments : undefined,
                },
              ];
            });
          }
        });
        // The typing indicator is handled internally when a valid message is actually added to state
      }
    };

    poll();

    const intervalId = setInterval(poll, 2000);
    setPollingInterval(intervalId);
  }, [sentMessageIds, recentSentMessages, directLineService, config, awaitingResponseSince]);

  const handleSendMessage = async (text: string) => {
    console.log('📤📤📤 USER SENDING MESSAGE:', text);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Track user message in lead system
    leadService.createOrUpdateSession(sessionId, text, 'user').then((success) => {
      if (!success) {
        console.warn('Failed to track user message in lead system');
      }
    });

    setIsBotTyping(true);
    setAwaitingResponseSince(Date.now());
    console.log('Showing bot typing indicator');

    // Auto-hide typing indicator after 30 seconds if no response
    setTimeout(() => {
      setIsBotTyping(false);
      setAwaitingResponseSince(null);
      console.log('Auto-hiding typing indicator after timeout');
    }, 30000);

    try {
      const response = await directLineService.sendMessage(text);
      
      // Store the message ID returned by DirectLine to filter it out later
      if (response && response.id) {
        console.log('📤 Sent message ID:', response.id);
        
        // Update both state and ref immediately
        setSentMessageIds(prev => {
          const newSet = new Set([...prev, response.id]);
          // Keep only the last 10 message IDs to prevent memory issues
          if (newSet.size > 10) {
            const idsArray = Array.from(newSet);
            const limitedSet = new Set(idsArray.slice(-10));
            sentMessageIdsRef.current = limitedSet;
            return limitedSet;
          }
          console.log('📤 Updated sentMessageIds:', Array.from(newSet));
          sentMessageIdsRef.current = newSet;
          return newSet;
        });
        
        // Update recent messages ref immediately too
        setRecentSentMessages(prev => {
          const newMessages = [...prev, { text, timestamp: Date.now() }];
          const limitedMessages = newMessages.slice(-5);
          recentSentMessagesRef.current = limitedMessages;
          return limitedMessages;
        });
      } else {
        console.log('📤 No response ID received from DirectLine');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsBotTyping(false);
      setAwaitingResponseSince(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: 'Sorry, there was an error sending your message. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleAdaptiveCardSubmit = async (data: Record<string, any>) => {
    console.log('Adaptive Card submitted with data:', data);
    
    // Show typing indicator for adaptive card submissions
    setIsBotTyping(true);
    setAwaitingResponseSince(Date.now());
    
    // Let DirectLine handle adaptive card submissions natively without interference
    try {
      await directLineService.sendAdaptiveCardAction(data);
      console.log('Adaptive card action sent successfully');
      
      // Capture lead data from adaptive card submission
      await captureAdaptiveCardLead(data);
      
    } catch (error) {
      console.error('Error sending adaptive card action:', error);
      setIsBotTyping(false);
      setAwaitingResponseSince(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: 'Sorry, there was an error submitting the form. Please try again.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Capture lead data from adaptive card submissions
  const captureAdaptiveCardLead = async (data: Record<string, any>) => {
    try {
      const adaptiveCardFormData = {
        name: data.name || data.Name || data.fullName || '',
        email: data.email || data.Email || data.emailAddress || '',
        company: data.company || data.Company || data.companyName || '',
        phone: data.phone || data.Phone || data.phoneNumber || '',
        country: data.country || data.Country || '',
        job_title: data.jobTitle || data['Job Title'] || data.position || '',
        purpose: data.purpose || data.Purpose || data.inquiry || 'Adaptive Card Submission',
        details: data.details || data.Details || data.message || data.comments || JSON.stringify(data),
        ...data // Include all form fields
      };

      await leadService.updateSessionFormData(sessionId, adaptiveCardFormData);
    } catch (error) {
      console.error('❌ Error capturing adaptive card lead:', error);
    }
  };

  const handleSpeakToExpert = () => {
    console.log('Redirecting to expert support');
    Swal.fire({
      title: 'Expert Support',
      text: 'Redirecting to expert support...',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
    });
  };
  const initChatFunction = useCallback(() => {
    if (isInitialized) return;
    
    console.log('Initializing chat...');
    const localeToUse = config.autoDetectLocale ? detectBrowserLocale() : config.locale;
    console.log('Chat locale:', localeToUse, '(auto-detect:', config.autoDetectLocale, ')');

    directLineService.initChat(localeToUse).then(() => {
      console.log('Chat initialized successfully');
      setIsInitialized(true);
      
      // Capture session information and create session in lead tracking system
      const sessionInfo = SessionInfoService.captureClientSideInfo();
      leadService.createOrUpdateSession(sessionId, undefined, undefined, undefined, undefined, sessionInfo).then((success) => {
        if (success) {
          console.log('Session created in lead system with device info:', sessionId);
          console.log('📱 Session Info:', sessionInfo);
        } else {
          console.warn('Failed to create session in lead system');
        }
      });
      
      startPolling();
    }).catch((error) => {
      console.error('Failed to initialize chat:', error);

      setMessages([{
        id: `error-${Date.now()}`,
        text: 'Failed to connect to the chatbot service. Please refresh the page and try again.',
        sender: 'bot',
        timestamp: new Date(),
      }]);
    });
  }, [config, directLineService, isInitialized, sessionId, startPolling]);


  const handleContinueWithAI = () => {
    const botGreeting: Message = {
      id: `bot-greeting-${Date.now()}`,
      text: config.botGreetingMessage,
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botGreeting]);
    
    // Initialize proxy connection only when user continues with AI
    initChatFunction();
  };

  // Capture chat-only leads (when users interact but don't submit forms)
  // This is no longer necessary, as Session info is captured continuously behind the scenes per interaction natively.
  const captureChatOnlyLead = async () => {};

  // Auto-capture chat leads when chat window closes after meaningful interaction
  const handleChatClose = () => {
    captureChatOnlyLead();
    setIsOpen(false);
  };

  return (
    <>
      {!isOpen && <ChatbotIcon onClick={() => setIsOpen(true)} />}
      {isOpen && (
        <ChatWindow
          onClose={handleChatClose}
          onSpeakToExpert={handleSpeakToExpert}
          sliderImages={content?.slider_images || []}
          predefinedSentences={content?.predefined_sentences || []}
          onSendMessage={handleSendMessage}
          onContinueWithAI={handleContinueWithAI}
          messages={messages}
          isBotTyping={isBotTyping}
          onAdaptiveCardSubmit={handleAdaptiveCardSubmit}
          sessionId={sessionId}
        />
      )}
    </>
  );
}
