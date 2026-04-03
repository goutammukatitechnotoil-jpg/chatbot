/**
 * FPT Chatbot Standalone Widget v2
 * A self-contained, embeddable chatbot widget matching the test chatbot design
 * 
 * Usage:
 * <script src="https://your-domain.com/chatbot-widget-v2.js"></script>
 * <script>
 *   FPTChatbot.init({
 *     tenantId: 'your-tenant-id',
 *     apiUrl: 'https://your-api-domain.com',
 *     position: 'bottom-right',
 *     primaryColor: '#f37021',
 *     headerColor: '#1e3a8a'
 *   });
 * </script>
 */

(function (window) {
  'use strict';
  
  // FSoft nonce config
  
  const nonce = 'ZVp1c1hDdk1nU3NnY2xHR1kwPQ==';


  if (window.FPTChatbot) {
    console.warn('FPT Chatbot already initialized');
    return;
  }

  class FPTChatbotWidget {
        showTemporaryMessageOverButton() {
          if (this._tempMsgShown) return;
          this._tempMsgShown = true;
          const config = this.config;
          const popup = document.createElement('div');
          popup.className = 'temporary-message';
          popup.innerHTML = `
            <div class="content-wrapper">
              <img
                src="${config.logoUrl}"
                alt="Bot says"
                draggable="false"
                class="avatar bot-icon"
                onerror="this.src='/FPTSoftware.png'"
              />
              <div class="text-container">
                <div class="title no-select no-wrap">${config.popupTitle || ''}</div>
                <div class="description no-select no-wrap">${config.popupDescription || ''}</div>
              </div>
            </div>
          `;
          // Position absolutely over the chatbot button
          popup.style.position = 'fixed';
          popup.style.zIndex = (this.config.zIndex + 100) || 10100;
          // Default: bottom-right
          if (this.config.position === 'bottom-right' || !this.config.position) {
            popup.style.right = '24px';
            popup.style.bottom = '100px';
          } else {
            popup.style.left = '24px';
            popup.style.bottom = '100px';
          }
          popup.style.pointerEvents = 'none';
          document.body.appendChild(popup);
          setTimeout(() => {
            popup.classList.add('show');
          }, 50);
          setTimeout(() => {
            popup.classList.add('close-anim');
            setTimeout(() => {
              popup.remove();
            }, 1000);
          }, 3000);
        }
    async getSessionInfo() {
      // Device/OS/Browser detection helpers
      function getDeviceType() {
        if (/Mobi|Android/i.test(navigator.userAgent)) return 'Desktop'; // fallback for desktop
        if (/Tablet|iPad/i.test(navigator.userAgent)) return 'Tablet';
        return 'Desktop';
      }
      function getOS() {
        const ua = navigator.userAgent;
        if (/Windows NT/i.test(ua)) return 'Windows';
        if (/Mac OS X/i.test(ua)) return 'macOS';
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Unknown';
      }
      function getBrowser() {
        const ua = navigator.userAgent;
        if (/Chrome\//i.test(ua)) return 'Google Chrome';
        if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
        if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
        if (/Edg\//i.test(ua)) return 'Microsoft Edge';
        if (/OPR\//i.test(ua)) return 'Opera';
        return 'Unknown';
      }
      function getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(Chrome|Firefox|Edg|OPR|Safari)\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+)/);
        return match ? match[2] : 'Unknown';
      }
      function getNetworkType() {
        const nav = navigator;
        if (nav.connection && nav.connection.effectiveType) {
          return nav.connection.effectiveType.charAt(0).toUpperCase() + nav.connection.effectiveType.slice(1) + ' Data';
        }
        return 'Unknown';
      }
      function getTimezone() {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          return 'Unknown';
        }
      }

      // // IP/Country detection (async, fallback to local, try multiple APIs)
      // let ip_address = 'Unknown';
      // let country = 'Unknown';
      // try {
      //     // Try ipapi.co first
      //     let resp = await fetch('https://ipapi.co/json/');
      //     if (resp.ok) {
      //         const data = await resp.json();
      //         ip_address = data.ip || ip_address;
      //         country = data.country_name || country;
      //     }
      //     // If still unknown, try ipinfo.io
      //     if (ip_address === 'Unknown' || country === 'Unknown') {
      //         resp = await fetch('https://ipinfo.io/json?token=demo');
      //         if (resp.ok) {
      //             const data = await resp.json();
      //             ip_address = data.ip || ip_address;
      //             country = data.country || country;
      //         }
      //     }
      //     // If still unknown, try api.db-ip.com (free tier, demo key)
      //     if (ip_address === 'Unknown' || country === 'Unknown') {
      //         resp = await fetch('https://api.db-ip.com/v2/free/self');
      //         if (resp.ok) {
      //             const data = await resp.json();
      //             ip_address = data.ipAddress || ip_address;
      //             country = data.countryName || country;
      //         }
      //     }
      // } catch { }

      return {
        device_type: getDeviceType(),
        operating_system: getOS(),
        browser_type: getBrowser(),
        browser_version: getBrowserVersion(),
        network_type: getNetworkType(),
        timezone: getTimezone(),
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        captured_at: new Date().toISOString()
      };
    }
    constructor(config) {
      this.config = {
        configKey: config.configKey || '',
        apiUrl: config.url,
        position: config.position || 'bottom-right',
        primaryColor: config.primaryColor || '#f37021',
        headerColor: config.headerColor || '#1e3a8a',
        chatbotName: config.chatbotName || 'AI Assistant',
        logoUrl: config.logoUrl || '/FPTSoftware.png',
        welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
        locale: config.locale || 'en-US',
        zIndex: config.zIndex || 9999,
        sliderImages: config.sliderImages || [],
        predefinedSentences: config.predefined_sentences || [],
        quickQuestionsTitle: config.quickQuestionsTitle || config.quick_questions_title || 'Quick Questions:' ,
        buttonIds: config.buttonIds || {}
      };

      this.isOpen = false;
      this.showWelcome = true;
      this.messages = [];
/**
 * FPT Chatbot Standalone Widget v2
 * A self-contained, embeddable chatbot widget matching the test chatbot design
 * 
 * Usage:
 * <script src="https://your-domain.com/chatbot-widget-v2.js"></script>
 * <script>
 *   FPTChatbot.init({
 *     tenantId: 'your-tenant-id',
 *     apiUrl: 'https://your-api-domain.com',
 *     position: 'bottom-right',
 *     primaryColor: '#f37021',
 *     headerColor: '#1e3a8a'
 *   });
 * </script>
 */

(function (window) {
  'use strict';
  
  // FSoft nonce config
  
  const nonce = 'ZVp1c1hDdk1nU3NnY2xHR1kwPQ==';


  if (window.FPTChatbot) {
    console.warn('FPT Chatbot already initialized');
    return;
  }

  class FPTChatbotWidget {
        showTemporaryMessageOverButton() {
          if (this._tempMsgShown) return;
          this._tempMsgShown = true;
          const config = this.config;
          const popup = document.createElement('div');
          popup.className = 'temporary-message';
          popup.innerHTML = `
            <div class="content-wrapper">
              <img
                src="${config.logoUrl}"
                alt="Bot says"
                draggable="false"
                class="avatar bot-icon"
                onerror="this.src='/FPTSoftware.png'"
              />
              <div class="text-container">
                <div class="title no-select no-wrap">${config.popupTitle || ''}</div>
                <div class="description no-select no-wrap">${config.popupDescription || ''}</div>
              </div>
            </div>
          `;
          // Position absolutely over the chatbot button
          popup.style.position = 'fixed';
          popup.style.zIndex = (this.config.zIndex + 100) || 10100;
          // Default: bottom-right
          if (this.config.position === 'bottom-right' || !this.config.position) {
            popup.style.right = '24px';
            popup.style.bottom = '100px';
          } else {
            popup.style.left = '24px';
            popup.style.bottom = '100px';
          }
          popup.style.pointerEvents = 'none';
          document.body.appendChild(popup);
          setTimeout(() => {
            popup.classList.add('show');
          }, 50);
          setTimeout(() => {
            popup.classList.add('close-anim');
            setTimeout(() => {
              popup.remove();
            }, 1000);
          }, 3000);
        }
    async getSessionInfo() {
      // Device/OS/Browser detection helpers
      function getDeviceType() {
        if (/Mobi|Android/i.test(navigator.userAgent)) return 'Desktop'; // fallback for desktop
        if (/Tablet|iPad/i.test(navigator.userAgent)) return 'Tablet';
        return 'Desktop';
      }
      function getOS() {
        const ua = navigator.userAgent;
        if (/Windows NT/i.test(ua)) return 'Windows';
        if (/Mac OS X/i.test(ua)) return 'macOS';
        if (/Android/i.test(ua)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        if (/Linux/i.test(ua)) return 'Linux';
        return 'Unknown';
      }
      function getBrowser() {
        const ua = navigator.userAgent;
        if (/Chrome\//i.test(ua)) return 'Google Chrome';
        if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Safari';
        if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
        if (/Edg\//i.test(ua)) return 'Microsoft Edge';
        if (/OPR\//i.test(ua)) return 'Opera';
        return 'Unknown';
      }
      function getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(Chrome|Firefox|Edg|OPR|Safari)\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+)/);
        return match ? match[2] : 'Unknown';
      }
      function getNetworkType() {
        const nav = navigator;
        if (nav.connection && nav.connection.effectiveType) {
          return nav.connection.effectiveType.charAt(0).toUpperCase() + nav.connection.effectiveType.slice(1) + ' Data';
        }
        return 'Unknown';
      }
      function getTimezone() {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
          return 'Unknown';
        }
      }

      // // IP/Country detection (async, fallback to local, try multiple APIs)
      // let ip_address = 'Unknown';
      // let country = 'Unknown';
      // try {
      //     // Try ipapi.co first
      //     let resp = await fetch('https://ipapi.co/json/');
      //     if (resp.ok) {
      //         const data = await resp.json();
      //         ip_address = data.ip || ip_address;
      //         country = data.country_name || country;
      //     }
      //     // If still unknown, try ipinfo.io
      //     if (ip_address === 'Unknown' || country === 'Unknown') {
      //         resp = await fetch('https://ipinfo.io/json?token=demo');
      //         if (resp.ok) {
      //             const data = await resp.json();
      //             ip_address = data.ip || ip_address;
      //             country = data.country || country;
      //         }
      //     }
      //     // If still unknown, try api.db-ip.com (free tier, demo key)
      //     if (ip_address === 'Unknown' || country === 'Unknown') {
      //         resp = await fetch('https://api.db-ip.com/v2/free/self');
      //         if (resp.ok) {
      //             const data = await resp.json();
      //             ip_address = data.ipAddress || ip_address;
      //             country = data.countryName || country;
      //         }
      //     }
      // } catch { }

      return {
        device_type: getDeviceType(),
        operating_system: getOS(),
        browser_type: getBrowser(),
        browser_version: getBrowserVersion(),
        network_type: getNetworkType(),
        timezone: getTimezone(),
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        captured_at: new Date().toISOString()
      };
    }
    constructor(config) {
      this.config = {
        configKey: config.configKey || '',
        apiUrl: config.url,
        position: config.position || 'bottom-right',
        primaryColor: config.primaryColor || '#f37021',
        headerColor: config.headerColor || '#1e3a8a',
        chatbotName: config.chatbotName || 'AI Assistant',
        logoUrl: config.logoUrl || '/FPTSoftware.png',
        welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today?',
        locale: config.locale || 'en-US',
        zIndex: config.zIndex || 9999,
        sliderImages: config.sliderImages || [],
        predefinedSentences: config.predefined_sentences || [],
        quickQuestionsTitle: config.quickQuestionsTitle || config.quick_questions_title || 'Quick Questions:' ,
        buttonIds: config.buttonIds || {}
      };

      this.isOpen = false;
      this.showWelcome = true;
      this.messages = [];
      this.sources = [];
      this.directLineToken = null;
      this.conversationId = null;
      this.watermark = '';
      this.pollingInterval = null;
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.sentMessageIds = new Set();
      this.botSenderIds = new Set();
      this.renderedActivityIds = new Set();
      this.allMessageSources = [];
      this.recentUserMessages = [];
      this.pendingProxyMessages = [];
      this.isBotTyping = false;
      this.currentSlide = 0;
      this.sliderInterval = null;
      this.activeForm = null;
      this.formFields = [];
      this.formSubmitting = false;
      this.formSuccess = false;

      this.leadSessionCreated = false;
      this.init();
    }

    init() {
      this.loadConfig();

    }

    async loadConfig() {
      try {
        // http://localhost:3000/api/widget/public
        console.log('Loading chatbot config from API:', this.config.apiUrl);
        const response = await fetch(`${this.config.apiUrl}/api/widget/public`, {
          method: 'POST',
          body: JSON.stringify({
            configKey: this.config.configKey
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.config) {
            this.config = {
              ...this.config,
              ...data.config,
              primaryColor: data.config.colorTheme || this.config.primaryColor,
              headerColor: data.config.headerColorTheme || this.config.headerColor,
              logoUrl: data.config.logoUrl || this.config.logoUrl,
              chatbotName: data.config.chatbotName || this.config.chatbotName,
              sliderImages: data.config.slider_images || this.config.slider_images,
              predefinedSentences: data.config.predefined_sentences || this.config.predefined_sentences,
              quickQuestionsTitle: data.config.quick_questions_title || data.config.quickQuestionsTitle || this.config.quickQuestionsTitle,
              buttonIds: data.config.buttonIds || this.config.buttonIds,
              chatbotButtons: data.chatbotButtons || []
            };
            // Load and migrate form fields: convert old string-array options to structured {id,label}
            this.formFields = (data.formFields || []).map(f => {
              if (f && Array.isArray(f.options) && f.options.length > 0 && typeof f.options[0] === 'string') {
                return {
                  ...f,
                  options: f.options.map(opt => ({ id: opt, label: opt }))
                };
              }
              return f;
            });
            this.forms = Array.isArray(data.forms) ? data.forms : [];
            this.activeForm = this.forms.length > 0 ? this.forms[0] : null;

            this.injectStyles();
            this.createWidget();
            this.attachEventListeners();
            this.captureSessionInfo();
          }
        }
      } catch (error) {
        this.button.style.display = 'flex';
      }
    }

    async initializeProxy() {
      if (this.proxySocket && (this.proxySocket.readyState === WebSocket.OPEN || this.proxySocket.readyState === WebSocket.CONNECTING)) return;

      try {
        const apiOrigin = new URL(this.config.apiUrl, window.location.href).origin;
        const wsUrlObj = new URL(apiOrigin);
        wsUrlObj.protocol = wsUrlObj.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrlObj.pathname = '/ws';

        if (this.config.tokenEndpoint) {
          wsUrlObj.searchParams.set('tokenEndpoint', this.config.tokenEndpoint);
        }

        const wsUrl = wsUrlObj.toString();

        console.log('Connecting to Chatbot Proxy:', wsUrl);
        this.proxySocket = new WebSocket(wsUrl);
        this.proxyReady = false;

        this.proxySocket.onopen = () => {
          console.log('Connected to Chatbot Proxy');
          this.flushPendingProxyMessages();
        };

        this.proxySocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connection_ready') {
              this.proxyReady = true;
              this.flushPendingProxyMessages();
            } else if (data.type === 'user_message_ack') {
              if (data.id) {
                this.sentMessageIds.add(data.id);
                if (this.sentMessageIds.size > 200) {
                  const trimmed = Array.from(this.sentMessageIds).slice(-120);
                  this.sentMessageIds = new Set(trimmed);
                }
              }
            } else if (data.type === 'bot_message') {
              this.handleBotMessage(data);
            } else if (data.type === 'error') {
              console.error('Proxy reported error:', data.text);
              this.isBotTyping = false;
              this.updateTypingIndicator();
              this.addAsGenericBotMessage(data.text);
            }
          } catch (e) {
            console.error('Error handling proxy message:', e);
          }
        };

        this.proxySocket.onclose = () => {
          this.proxySocket = null;
          this.proxyReady = false;
          if (this.isOpen) setTimeout(() => this.initializeProxy(), 3000);
        };
      } catch (error) {
        console.error('Failed to initialize proxy connection:', error);
      }
    }

    flushPendingProxyMessages() {
      if (!this.proxySocket || this.proxySocket.readyState !== WebSocket.OPEN || !this.proxyReady) {
        return;
      }

      while (this.pendingProxyMessages.length > 0) {
        const payload = this.pendingProxyMessages.shift();
        try {
          this.proxySocket.send(JSON.stringify(payload));
        } catch (err) {
          console.error('Failed to send queued proxy message:', err);
          break;
        }
      }
    }

    async handleSend() {
      const message = this.inputField.value.trim();
      if (!message) return;
      this.inputField.value = '';
      this.sendButton.disabled = true;
      await this.sendMessage(message);
    }

    async sendMessage(message) {
      if (!message.trim()) return;
      this.showWelcome = false;
      if (this.welcomeScreen) this.welcomeScreen.style.display = 'none';
      this.messagesContainer.style.display = 'flex';
      if (this.container) this.container.classList.add('messages-visible');

      const userMessage = {
        id: `user-${Date.now()}`,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };

      this.messages.push(userMessage);
      this.renderMessage(userMessage);
      this.scrollToBottom();
      this.recentUserMessages.push({
        text: (message || '').trim().toLowerCase(),
        timestamp: Date.now()
      });
      this.recentUserMessages = this.recentUserMessages.filter((m) => (Date.now() - m.timestamp) < 30000);
      this.isBotTyping = true;
      this.updateTypingIndicator();

      if (!this.proxySocket || this.proxySocket.readyState !== WebSocket.OPEN) {
        await this.initializeProxy();
      }

      const payload = { type: 'user_message', text: message, locale: this.config.locale };
      if (this.proxySocket && this.proxySocket.readyState === WebSocket.OPEN && this.proxyReady) {
        this.proxySocket.send(JSON.stringify(payload));
      } else {
        this.pendingProxyMessages.push(payload);
      }
      this.createLeadSession();
      this.updateLeadSession(userMessage);
    }

    sendBotActivity(activity) {
      if (!activity || activity.type !== 'message') return;

      const payload = {
        type: 'user_message',
        text: activity.text,
        value: activity.value,
        locale: activity.locale || this.config.locale,
        channelData: activity.channelData
      };

      if (this.proxySocket && this.proxySocket.readyState === WebSocket.OPEN && this.proxyReady) {
        this.proxySocket.send(JSON.stringify(payload));
      } else {
        this.pendingProxyMessages.push(payload);
      }
    }

    handleBotMessage(data) {
      const incomingText = (data && typeof data.text === 'string') ? data.text : '';
      const normalizeForEchoCheck = (value) => (value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\s+([?.!,;:])/g, '$1')
        .trim();
      const normalizedIncoming = normalizeForEchoCheck(incomingText);
      const activityId = data && data.id ? String(data.id) : '';
      const fromId = data && data.fromId ? String(data.fromId) : '';

      if (activityId) {
        if (this.sentMessageIds.has(activityId)) {
          return;
        }
        if (this.renderedActivityIds.has(activityId)) {
          return;
        }
        this.renderedActivityIds.add(activityId);
        if (this.renderedActivityIds.size > 400) {
          const trimmed = Array.from(this.renderedActivityIds).slice(-250);
          this.renderedActivityIds = new Set(trimmed);
        }
      }

      const isLikelyUserEcho = normalizedIncoming && this.recentUserMessages.some((sent) =>
        normalizeForEchoCheck(sent.text) === normalizedIncoming && (Date.now() - sent.timestamp) < 20000
      );

      if (fromId && (fromId === 'user' || fromId === 'user1')) {
        return;
      }

      if (isLikelyUserEcho) {
        return;
      }

      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      const hasAdaptiveCard = attachments.some((att) =>
        att && att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content
      );
      const attachmentSources = [];
      const processedAttachments = [];

      attachments.forEach((att) => {
        if (!att) return;

        if (att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content) {
          processedAttachments.push({
            contentType: att.contentType,
            content: att.content
          });
          return;
        }

        const source = {
          title: att.content?.title || att.content?.text || 'Source',
          url: att.contentUrl || att.content?.url
        };

        if (source.title || source.url) {
          attachmentSources.push(source);
        }
      });

      if (fromId && (incomingText || hasAdaptiveCard || attachmentSources.length > 0)) {
        this.botSenderIds.add(fromId);
      }
      if (this.botSenderIds.size > 0 && fromId && !this.botSenderIds.has(fromId)) {
        return;
      }

      const cleanedText = (incomingText || '').replace(/\s+/g, ' ').trim();
      const isPlaceholderText = cleanedText === '.' || cleanedText === '...' || cleanedText === 'â€¦';
      const shouldRenderText = !!cleanedText && !isPlaceholderText;

      if (!hasAdaptiveCard && !shouldRenderText && attachmentSources.length === 0) {
        return;
      }

      this.isBotTyping = false;
      this.updateTypingIndicator();

      if (hasAdaptiveCard) {
        this.renderAdaptiveCardMessage(data);
      }

      if (!shouldRenderText && attachmentSources.length > 0) {
        const message = {
          id: data.id || `bot-${Date.now()}`,
          text: '',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: attachmentSources,
          attachments: processedAttachments
        };
        this.messages.push(message);
        this.updateSources(attachmentSources);
        this.scrollToBottom();
        this.updateLeadSession(message, attachmentSources);
        return;
      }

      if (shouldRenderText) {
        let messageText = cleanedText;
        let parsedSources = [];

        let sourceListMatch = messageText.match(/\*\*Source List of Response:\*\*([\s\S]*?)$/i);

        if (!sourceListMatch) {
          sourceListMatch = messageText.match(/\*\*Source List of Response\*\*([\s\S]*?)$/i);
        }
        if (!sourceListMatch) {
          sourceListMatch = messageText.match(/\*\*(Sources?|References?):\*\*([\s\S]*?)$/i);
        }
        if (!sourceListMatch) {
          sourceListMatch = messageText.match(/Sources?:\s*([\s\S]*?)$/i);
        }
        if (!sourceListMatch) {
          sourceListMatch = messageText.match(/Source List of Response:\s*([\s\S]*?)$/i);
        }

        if (sourceListMatch) {
          const sourceSection = sourceListMatch[1] || sourceListMatch[2];
          const lines = sourceSection.split('\n').filter(line => line.trim());

          lines.forEach((line) => {
            const refMatch = line.match(/^\[(\d+)\]:\s*(https?:\/\/[^\s]+)\s*"([^"]+)"/);
            if (refMatch) {
              parsedSources.push({
                title: refMatch[3].trim(),
                url: refMatch[2],
              });
            } else if (line.match(/^\d+\.\s*/)) {
              const titleMatch = line.match(/\*\*([^*]+)\*\*/) || line.match(/([^http]+?)(?=https?:|$)/);
              const urlMatch = line.match(/https?:\/\/[^\s\)]+/);

              if (titleMatch || urlMatch) {
                parsedSources.push({
                  title: titleMatch ? titleMatch[1].trim() : (urlMatch ? 'Source' : line.replace(/^\d+\.\s*/, '').trim()),
                  url: urlMatch ? urlMatch[0] : undefined,
                });
              }
            } else if (line.includes('http')) {
              const urlMatch = line.match(/https?:\/\/[^\s\)]+/);
              const titleMatch = line.match(/\*\*([^*]+)\*\*/) ||
                line.match(/[-â€¢*]\s*(.+?)(?=https?:|$)/) ||
                line.match(/^(.+?)(?=https?:|$)/);

              if (urlMatch) {
                parsedSources.push({
                  title: titleMatch ? titleMatch[1].trim().replace(/[*\-\[\]â€¢]/g, '').trim() : 'Source',
                  url: urlMatch[0],
                });
              }
            } else if (line.includes('**')) {
              const titleMatch = line.match(/\*\*([^*]+)\*\*/);
              if (titleMatch) {
                parsedSources.push({
                  title: titleMatch[1].trim(),
                  url: undefined,
                });
              }
            }
          });

          messageText = messageText.replace(/\*\*Source List of Response:\*\*[\s\S]*$/i, '').trim();
          messageText = messageText.replace(/\*\*Source List of Response\*\*[\s\S]*$/i, '').trim();
          messageText = messageText.replace(/\*\*(Sources?|References?):\*\*[\s\S]*$/i, '').trim();
          messageText = messageText.replace(/Source List of Response:\s*[\s\S]*$/i, '').trim();
          messageText = messageText.replace(/Sources?:\s*[\s\S]*$/i, '').trim();
        }

        const allSources = parsedSources.length > 0 ? parsedSources : attachmentSources;
        const message = {
          id: data.id || `bot-${Date.now()}`,
          text: messageText,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: allSources,
          attachments: processedAttachments
        };
        this.messages.push(message);
        this.renderMessage(message);

        if (allSources.length > 0) {
          this.updateSources(allSources);
        }

        this.scrollToBottom();
        this.updateLeadSession(message, allSources);
      }
    }

    renderAdaptiveCardMessage(data) {
      const adaptiveAttachment = data.attachments.find((att) =>
        att && att.contentType === 'application/vnd.microsoft.card.adaptive' && att.content
      );

      if (!adaptiveAttachment) return;

      const renderAdaptiveCard = (content) => {
        const adaptiveCard = new window.AdaptiveCards.AdaptiveCard();
        adaptiveCard.parse(content);

        adaptiveCard.onExecuteAction = (action) => {
          if (action._propertyBag && action._propertyBag.type === 'Action.Submit') {
            const formData = action._processedData || action.data || {};
            const userId = (this.sessionInfo && this.sessionInfo.tenantId) ? this.sessionInfo.tenantId : 'user';

            if (formData.action === 'skip') {
              const skipBody = {
                type: 'message',
                from: { id: userId },
                locale: this.config.locale,
                value: { action: 'skip', actionSubmitId: 'Skip to Continue' },
                channelData: { postBack: true }
              };
              this.sendBotActivity(skipBody);
            } else {
              (async () => {
                const session_info = await this.getSessionInfo();
                const leadData = {
                  session_id: this.sessionId,
                  form_id: formData.form_id || '',
                  form_name: formData.form_name || '',
                  form_data: formData,
                  chat_history: this.messages.map(m => ({
                    sender: m.sender,
                    message: m.text,
                    timestamp: m.timestamp || new Date().toISOString()
                  })),
                  source: 'widget',
                  session_info
                };
                try {
                  await fetch(`${this.config.apiUrl}/api/widget/lead`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      configKey: this.config.configKey,
                      lead_data: leadData
                    })
                  });
                } catch (err) {
                  console.error('AdaptiveCard form submit error:', err);
                }
              })();

              const messageBody = {
                type: 'message',
                from: { id: userId },
                locale: this.config.locale,
                value: formData,
                channelData: { postBack: true }
              };
              this.sendBotActivity(messageBody);
            }
          }
        };

        const renderedCard = adaptiveCard.render();
        const wrapper = document.createElement('div');
        wrapper.className = 'fpt-message bot';
        wrapper.innerHTML = `
          <div class="fpt-message-avatar bot">
            <img nonce="${nonce}" src="${this.config.logoUrl}" alt="Bot" onerror="this.src='/FPTSoftware.png'">
          </div>
          <div class="fpt-message-content">
            <div class="fpt-adaptive-card-wrapper"></div>
          </div>
        `;
        wrapper.querySelector('.fpt-adaptive-card-wrapper').appendChild(renderedCard);
        this.messagesContainer.appendChild(wrapper);
        this.scrollToBottom();
      };

      if (!window.AdaptiveCards) {
        if (!window.__adaptiveCardsLoading) {
          window.__adaptiveCardsLoading = true;
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/adaptivecards@2.11.0/dist/adaptivecards.min.js';
          script.onload = () => {
            window.__adaptiveCardsLoading = false;
            renderAdaptiveCard(adaptiveAttachment.content);
          };
          script.onerror = () => {
            window.__adaptiveCardsLoading = false;
            this.addAsGenericBotMessage('Failed to load Adaptive Card rendering library.');
          };
          document.head.appendChild(script);
        } else {
          const tryRender = () => {
            if (window.AdaptiveCards) {
              renderAdaptiveCard(adaptiveAttachment.content);
            } else {
              setTimeout(tryRender, 200);
            }
          };
          tryRender();
        }
      } else {
        renderAdaptiveCard(adaptiveAttachment.content);
      }
    }

    addAsGenericBotMessage(text) {
      const message = { id: `bot-${Date.now()}`, text: text, sender: 'bot', timestamp: new Date().toISOString() };
      this.messages.push(message);
      this.renderMessage(message);
      this.scrollToBottom();
    }

    addMessage(text, sender, sources = []) {
      const message = {
        id: Date.now() + Math.random(),
        text: text,
        sender: sender,
        timestamp: new Date().toISOString()
      };

      this.messages.push(message);
      this.renderMessage(message);
      this.scrollToBottom();

      // Update lead session on every message (user or bot)
      this.updateLeadSession(message,sources);
    }

    async updateLeadSession(message, sources) {
      try {
        await fetch(`${this.config.apiUrl}/api/widget/lead-session`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            configKey: this.config.configKey,
            session_id: this.sessionId,
            message: message.text,
            sender: message.sender,
            sources: sources || []
          })
        });
      } catch (e) {
        console.error('Failed to update lead session:', e);
      }
    }


    renderMessage(message) {
      const messageEl = document.createElement('div');
      messageEl.className = `fpt-message ${message.sender}`;

      const avatarHTML = message.sender === 'user'
        ? `<div class="fpt-message-avatar user">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
               <circle cx="12" cy="7" r="4"></circle>
             </svg>
           </div>`
        : `<div class="fpt-message-avatar bot">
	<img nonce="${nonce}" src="${this.config.logoUrl}" alt="Bot">
           </div>`;

      messageEl.innerHTML = `
        ${avatarHTML}
        <div class="fpt-message-content">
          <div class="fpt-message-bubble">${this.formatText(message.text)}</div>
        </div>
      `;

      this.messagesContainer.appendChild(messageEl);
    }

    formatText(text) {
      if (!text) return '';

      text = text.replace(/^.*?\n\n/, '');

      // 1️⃣ Remove “Source List of Response” section + everything after it
      text = text.replace(/(\*\*\s*Source\s*List\s*of\s*Response\s*\*\*|Source\s*List\s*of\s*Response)[\s\S]*/i, '');

      // 2️⃣ Remove reference-style links like:  [1]: https://example.com
      text = text.replace(/\[\d+\]:\s*https?:\/\/[^\s]+/g, '');

      // 2.5️⃣ Fix malformed anchor tags with footnote markers like )[1]
      // Pattern: <a href="URL)[N]"...>URL)[N]</a> → <a href="URL"...>URL</a>
      text = text.replace(/<a\s+href="([^"]*)\)\[\d+\]"([^>]*)>([^<]*)\)\[\d+\]</g, '<a href="$1"$2>$3<');

      // 3️⃣ Bold **text**
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

      // 4️⃣ Italic *text* (avoid bold conflict)
      text = text.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

      // 5️⃣ Code `text`
      text = text.replace(/`(.+?)`/g, '<code>$1</code>');

      // 6️⃣ URLs → clickable links (skip if already wrapped in anchor tags)
      if (!/<a\s+href=/i.test(text)) {
        text = text.replace(
          /(https?:\/\/[^\s]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
      }

      // 7️⃣ Markdown forced line breaks
      text = text.replace(/  \n/g, '<br>');

      // 8️⃣ Convert newlines to <br>
      text = text.replace(/\n/g, '<br>');

      return text.trim();
    }


    updateTypingIndicator() {
      const existing = this.messagesContainer.querySelector('.fpt-typing-indicator');
      if (existing) {
        existing.remove();
      }

      if (this.isBotTyping) {
        const indicator = document.createElement('div');
        indicator.className = 'fpt-typing-indicator';
        indicator.innerHTML = `
          <div class="fpt-message-avatar bot">
            <img nonce="${nonce}" src="${this.config.logoUrl}" alt="Bot">
          </div>
          <div class="fpt-typing-bubble">
            <div class="fpt-typing-dot"></div>
            <div class="fpt-typing-dot"></div>
            <div class="fpt-typing-dot"></div>
          </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
      }
    }

    updateSources(sources) {
      this.sources = sources;
      //  const userMessages = this.messages
      //     ? this.messages.filter(m => m.sender === 'user')
      //     : [];

      // const titleDiv = document.createElement('div');
      // titleDiv.className = 'fpt-source-title';
      // titleDiv.innerHTML = userMessages[userMessages.length - 1]?.text || 'Source';
      // this.sourcesListEl.appendChild(titleDiv);

      // Append each source as a DOM element
      sources.forEach(source => {
        const a = document.createElement('a');
        a.href = source.url || '#';
        a.target = '_blank';
        a.className = 'fpt-source-item';
        a.innerHTML = `
              <div class="fpt-source-title">${source.title || 'Source'}</div>
            `;
        this.sourcesListEl.appendChild(a);
      });
    }

    scrollToBottom() {
      setTimeout(() => {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }, 100);
    }
  }

  // Public API
window.FPTChatbot = {
    init: function (config) {
      if (!config.configKey) {
        console.error('FPT Chatbot: configKey is required');
        return;
      }

      console.log("FPT Chatbot: Initializing with config", config);

      // Evaluate chatbot visibility rules from public settings before initializing
      (async function() {
        try {
          const vis = config.chatbot_visibility || { mode: 'always_show', url_list: [] };

          const currentUrl = window.location.href;

          function patternMatches(pattern, url) {
            try {
              // escape regex special, then replace '*' with '.*'
              const esc = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*').replace(/\*/g, '.*');
              const re = new RegExp('^' + esc + '$', 'i');
              return re.test(url);
            } catch (e) {
              return false;
            }
          }


          const anyMatch = (vis.url_list || []).some(p => patternMatches(p, currentUrl));

          let shouldShow = true;
          if (vis.mode === 'always_show') shouldShow = true;
          else if (vis.mode === 'hide_on_urls') shouldShow = !anyMatch;
          else if (vis.mode === 'show_only_on_urls') shouldShow = anyMatch;

          if (shouldShow) {
            new FPTChatbotWidget(config);
          } else {
            console.log('FPT Chatbot: widget hidden by visibility rules');
          }
        } catch (err) {
          console.warn('Error evaluating visibility rules, initializing widget by default', err);
          try { new FPTChatbotWidget(config); } catch (e) { console.error(e); }
        }
      })();
    }
  };

})(window);
