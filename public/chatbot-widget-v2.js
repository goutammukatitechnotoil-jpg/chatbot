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
        quickQuestionsTitle: config.quickQuestionsTitle || config.quick_questions_title || 'Quick Questions:',
        buttonIds: config.buttonIds || {},
        chatbotButtons: config.chatbotButtons || [],
        buttonFormConnections: config.buttonFormConnections || []
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
      this.isBotTyping = false;
      this.currentSlide = 0;
      this.sliderInterval = null;
      this.activeForm = null;
      this.forms = [];
      this.formFields = [];
      this.formSubmitting = false;
      this.formSuccess = false;

      this.leadSessionCreated = false;
      this.proxySocket = null;
      this.proxyReady = false;
      this.proxyConnecting = false;  // Prevent concurrent connection attempts
      this.pendingProxyMessages = [];
      this.recentUserMessages = [];
      this.renderedActivityIds = new Set();
      this.botSenderIds = new Set();
      this.allMessageSources = [];
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
              chatbotButtons: data.chatbotButtons || [],
              buttonFormConnections: data.buttonFormConnections || this.config.buttonFormConnections || []
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
        console.error('Failed to load chatbot config:', error);
      }
    }

    async createLeadSession() {
      if (this.leadSessionCreated) return;
      this.leadSessionCreated = true;
      console.log('Creating lead session...');
      try {
        // Use the first user message if available, else empty

        const session_info = await this.getSessionInfo();
        const leadData = {
          session_id: this.sessionId,
          form_id: {},
          form_name: {},
          form_data: {
            "name": "Anonymous User",
            "purpose": "Chat Only"
          },
          chat_history: this.messages.map(m => ({
            sender: m.sender,
            message: m.text,
            timestamp: m.timestamp || new Date().toISOString()
          })),
          source: 'widget',
          session_info

        };
        console.log("leadData", leadData);

        const response = await fetch(`${this.config.apiUrl}/api/widget/lead-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            configKey: this.config.configKey,
            ...leadData
          })
        });
        console.log("response", response);
      } catch (e) {
        console.error('Failed to create lead session:', e);
      }
    }

    captureSessionInfo() {
      this.sessionInfo = {
        sessionId: this.sessionId,
        tenantId: this.config.tenantId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        referrer: document.referrer,
        currentUrl: window.location.href,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      };
    }

    injectStyles() {
      const style = document.createElement('style');
      style.setAttribute('nonce', nonce);
      style.textContent = `
        /* Adaptive Card Custom Styles */
        .fpt-adaptive-card-wrapper {
          margin: 8px 0;
          background: #f9fafb;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(30, 58, 138, 0.08);
          padding: 18px 18px 12px 18px;
          border: 1px solid #e5e7eb;
          max-width: 90%;
          font-family: inherit;
        }
        .fpt-adaptive-card-wrapper .ac-adaptiveCard {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-family: inherit !important;
        }
        .fpt-adaptive-card-wrapper .ac-container {
          background: transparent !important;
        }
        .fpt-adaptive-card-wrapper .ac-textBlock {
          color: #1e293b !important;
          font-size: 15px !important;
          /* Allow multi-line ellipsis up to 4 lines (improves long titles on mobile) */
          display: -webkit-box !important;
          -webkit-box-orient: vertical !important;
          -webkit-line-clamp: 4 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: normal !important;
        }
        .fpt-adaptive-card-wrapper .ac-actionSet .ac-pushButton {
          background: #1e3a8a !important;
          color: #fff !important;
          border-radius: 6px !important;
          border: none !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          padding: 10px 20px !important;
          margin: 6px 6px 0 0 !important;
          box-shadow: 0 1px 4px rgba(30,58,138,0.07);
          transition: background 0.2s;
        }
        .fpt-adaptive-card-wrapper .ac-actionSet .ac-pushButton:hover {
          background: #f37021 !important;
          color: #fff !important;
        }
        .fpt-adaptive-card-wrapper input,
        .fpt-adaptive-card-wrapper textarea,
        .fpt-adaptive-card-wrapper select {
          border-radius: 6px !important;
          border: 1px solid #d1d5db !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          font-family: inherit !important;
          background: #fff !important;
        }
        .fpt-adaptive-card-wrapper input:focus,
        .fpt-adaptive-card-wrapper textarea:focus,
        .fpt-adaptive-card-wrapper select:focus {
          border-color: #1e3a8a !important;
          outline: none !important;
        }
        .fpt-adaptive-card-wrapper .ac-input.ac-input-required {
          border-color: #ef4444 !important;
        }
        .fpt-adaptive-card-wrapper .ac-label {
          font-weight: 500 !important;
          color: #374151 !important;
          margin-bottom: 4px !important;
        }
        .fpt-adaptive-card-wrapper .ac-errorMessage {
          color: #ef4444 !important;
          font-size: 12px !important;
          margin-top: 2px !important;
        }
        .fpt-adaptive-card-wrapper .ac-image {
          border-radius: 8px !important;
          box-shadow: 0 1px 4px rgba(30,58,138,0.07);
        }

        .fpt-chatbot-container * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .fpt-chatbot-button {
          position: fixed;
          ${this.config.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
          bottom: 24px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: ${this.config.zIndex};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .fpt-chatbot-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .fpt-chatbot-button svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .fpt-chatbot-button-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #10b981;
          border: 2px solid white;
          border-radius: 50%;
        }

        .fpt-chatbot-window {
          position: fixed;
          bottom: 24px;
          ${this.config.position === 'bottom-right' ? 'right: 24px;' : 'left: 24px;'}
          width: min(1100px, calc(100vw - 48px));
          height: 600px;
          max-height: calc(100vh - 48px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: ${this.config.zIndex};
          display: flex;
          flex-direction: column;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95) translateY(10px);
          transition: all 0.3s ease;
        }

        .fpt-chatbot-window.open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        @media (max-width: 640px) {
          /* Make adaptive cards use more available width on small screens */
          .fpt-adaptive-card-wrapper {
            max-width: calc(100% - 32px) !important;
            margin: 8px 16px;
          }

          /* Stack action buttons vertically and make them full-width for easier tapping */
          .fpt-adaptive-card-wrapper .ac-actionSet {
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }

          .fpt-adaptive-card-wrapper .ac-actionSet .ac-pushButton {
            width: 100% !important;
            padding: 12px 14px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }

          .fpt-chatbot-window {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
          }
        }

        .fpt-chatbot-header {
          background: ${this.config.headerColor};
          color: white;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .fpt-chatbot-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fpt-chatbot-header-right {
          display:flex;
          align-items:center;
          gap:8px;
        }

        .fpt-chatbot-header-logo {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .fpt-chatbot-header-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fpt-chatbot-header-info h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .fpt-chatbot-header-info p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .fpt-chatbot-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .fpt-chatbot-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .fpt-chatbot-close svg {
          width: 20px;
          height: 20px;
        }

        .fpt-chatbot-body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-width: 0;
        }

        .fpt-chatbot-main {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Welcome Screen */
        .fpt-chatbot-welcome {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Image Slider */
        .fpt-image-slider {
          position: relative;
          max-height: 360px;
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .fpt-slider-track {
          display: flex;
          transition: transform 0.5s ease;
          height: 100%;
        }

        .fpt-slider-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
          cursor: pointer;
        }

        .fpt-slider-slide img {
          width: 100%;
          height: 100%;
          object-fit: fill;
        }

        .fpt-slider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .fpt-image-slider:hover .fpt-slider-nav {
          opacity: 1;
        }

        .fpt-slider-nav:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .fpt-slider-nav.prev {
          left: 12px;
        }

        .fpt-slider-nav.next {
          right: 12px;
        }

        .fpt-slider-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .fpt-slider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.3s;
        }

        .fpt-slider-dot.active {
          background: white;
        }

        /* CTA Buttons */
        .fpt-cta-buttons {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .fpt-cta-button {
          flex: 1;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .fpt-cta-button:hover {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .fpt-cta-buttons {
            flex-direction: column;
          }
        }

        /* Quick Questions */
        .fpt-quick-questions {
          margin-top: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
          /* Keep layout stable when scrollbar appears */
          scrollbar-gutter: stable;
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.15) transparent;
        }

        /* WebKit scrollbar styling to make the thumb visible */
        .fpt-quick-questions::-webkit-scrollbar {
          width: 10px;
        }
        .fpt-quick-questions::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 6px;
        }
        .fpt-quick-questions::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.15);
          border-radius: 6px;
        }

        .fpt-quick-questions h4 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .fpt-quick-questions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .fpt-quick-question-btn {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fpt-quick-question-btn:hover {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        /* Messages Area */
        .fpt-chatbot-messages {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fpt-message {
          display: flex;
          gap: 12px;
        }

        .fpt-message.user {
          flex-direction: row-reverse;
        }

        .fpt-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fpt-message-avatar.user {
          background: #e5e7eb;
        }

        .fpt-message-avatar.bot {
          background: white;
          padding: 2px;
        }

        .fpt-message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .fpt-message-content {
          flex: 1;
          max-width: 70%;
          min-width: 0;
        }

        .fpt-message.user .fpt-message-content {
          display: flex;
          justify-content: flex-end;
        }

        .fpt-message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: anywhere;
        }

        .fpt-message.user .fpt-message-bubble {
          background: ${this.config.primaryColor};
          color: white;
        }

        .fpt-message.bot .fpt-message-bubble {
          background: #f3f4f6;
          color: #1f2937;
        }

        .fpt-message-bubble strong {
          font-weight: 600;
        }

        .fpt-message-bubble em {
          font-style: italic;
        }

        .fpt-message-bubble code {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }

        .fpt-message-bubble a {
          color: ${this.config.primaryColor};
          text-decoration: underline;
        }

        .fpt-message.user .fpt-message-bubble a {
          color: white;
        }

        /* Typing Indicator */
        .fpt-typing-indicator {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .fpt-typing-bubble {
          background: #f3f4f6;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          gap: 4px;
        }

        .fpt-typing-dot {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: fpt-bounce 1.4s infinite ease-in-out;
        }

        .fpt-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .fpt-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes fpt-bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        /* Predefined Sentences Bar */
        .fpt-predefined-bar {
          padding: 12px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          overflow-x: auto;
          flex-shrink: 0;
        }

        .fpt-predefined-bar::-webkit-scrollbar {
          display: none;
        }

        .fpt-predefined-list {
          display: flex;
          gap: 8px;
          padding-bottom: 8px;
        }

        /* Sources toggle: hidden by default (desktop), shown on small screens */
        .fpt-sources-toggle {
          display: none !important;
        }
        /* Sources close: hidden on desktop, shown on mobile via media query */
        .fpt-sources-close {
          display: none;
          margin-left:8px;
        }

        .fpt-predefined-chip {
          flex-shrink: 0;
          padding: 6px 16px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 9999px;
          font-size: 12px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fpt-predefined-chip:hover {
          border-color: ${this.config.primaryColor};
          background: #fff7ed;
        }

        /* Input Area */
        .fpt-chatbot-input {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
          flex-shrink: 0;
        }

        .fpt-input-wrapper {
          display: flex;
          gap: 8px;
        }

        .fpt-input-field {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }

        .fpt-input-field:focus {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
        }

        .fpt-send-button {
          width: 48px;
          height: 48px;
          background: ${this.config.primaryColor};
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }

        .fpt-send-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .fpt-send-button:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .fpt-send-button svg {
          width: 20px;
          height: 20px;
        }

        /* Sources Panel */
        .fpt-sources-panel {
          width: ${this.config.sourcesWidth || 300}px;
          max-width: 40%;
          min-width: 280px;
          flex: 0 0 ${this.config.sourcesWidth || 300}px;
          border-left: 1px solid #e5e7eb;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .fpt-sources-panel {
            display: none;
          }
        }

        /* Mobile behavior: show sources as a bottom-sheet when opened via toggle */
        @media (max-width: 640px) {
          .fpt-sources-panel {
            /* keep hidden by default; container toggles visibility */
            display: none !important;
          }

          .fpt-chatbot-container.mobile-sources-open .fpt-sources-panel {
            display: flex !important;
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 80vh !important;
            max-height: 100vh !important;
            z-index: ${this.config.zIndex + 20000} !important;
            transform: translateY(100%);
            transition: transform 260ms ease;
            box-shadow: 0 -8px 30px rgba(15,23,42,0.12);
            background: #ffffff;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            flex-direction: column !important;
            overflow: hidden;
          }

          .fpt-chatbot-container.mobile-sources-open .fpt-sources-panel.open {
            transform: translateY(0) !important;
          }

          /* Keep the chat window visible by nudging it upward when sources are open */
          .fpt-chatbot-container.mobile-sources-open .fpt-chatbot-window {
            bottom: 46vh !important;
          }

          .fpt-chatbot-container.messages-visible .fpt-sources-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
            padding: 6px 10px !important;
            height: 36px !important;
            background: transparent;
            border: 1px solid rgba(0,0,0,0.06);
            color: inherit;
            margin-right: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            border-radius: 8px;
          }

          .fpt-chatbot-container.mobile-sources-open .fpt-sources-close {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            font-size: 22px;
            line-height: 1;
            padding: 6px 8px;
            cursor: pointer;
            color: #374151;
            border-radius: 8px;
          }
          .fpt-sources-close:hover {
            background: rgba(0,0,0,0.04);
          }
        }

        .fpt-sources-header {
          padding: 16px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .fpt-sources-list {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
        }

        .fpt-sources-list::-webkit-scrollbar {
          width: 8px;
        }

        .fpt-sources-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .fpt-sources-list::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.35);
          border-radius: 999px;
        }

        .fpt-sources-list::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }

        .fpt-source-item {
          background: #ffffff;
          padding: 12px 13px;
          border-radius: 10px;
          border: 1px solid #dbe3ee;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit !important;
          display: block;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          outline: none;
        }

        .fpt-source-item:hover {
          border-color: #c7d2e3;
          background: #f8fafc;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
        }

        .fpt-source-item:focus,
        .fpt-source-item:focus-visible {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 3px ${this.config.primaryColor}22;
        }

        .fpt-source-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 6px;
          line-height: 1.45;
          word-break: break-word;
        }

        .fpt-source-link {
          font-size: 12px;
          color: #2563eb;
          text-decoration: none;
          display: block;
          line-height: 1.45;
          word-break: break-all;
          overflow-wrap: anywhere;
        }

        .fpt-source-link:hover {
          text-decoration: underline;
        }

        .fpt-source-index {
           display: none;
        }

        /* Form Modal */
        .fpt-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: ${this.config.zIndex + 10};
          padding: 20px;
        }

        .fpt-form-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .fpt-form-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .fpt-form-header .title {
            flex: 1; min-width: 0;
        }

        .fpt-form-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0;
        }

        .fpt-form-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0; 
          margin-left: 16px;
        }

        .fpt-form-close:hover {
          background: #f3f4f6;
        }

        .fpt-form-body {
          padding: 24px;
        }

        .fpt-form-success {
          text-align: center;
          padding: 40px 24px;
        }

        .fpt-form-success-icon {
          width: 64px;
          height: 64px;
          background: #10b981;
          border-radius: 50%;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fpt-form-success-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }

        .fpt-form-success h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .fpt-form-success p {
          font-size: 14px;
          color: #6b7280;
        }

        .fpt-form-field {
          margin-bottom: 20px;
        }

        .fpt-form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .fpt-form-required {
          color: #ef4444;
        }

        .fpt-form-input,
        .fpt-form-textarea,
        .fpt-form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }

        .fpt-form-input:focus,
        .fpt-form-textarea:focus,
        .fpt-form-select:focus {
          border-color: ${this.config.primaryColor};
          box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
        }

        .fpt-form-input.error,
        .fpt-form-textarea.error,
        .fpt-form-select.error {
          border-color: #ef4444;
        }

        .fpt-form-textarea {
          resize: vertical;
          min-height: 80px;
        }
.fpt-chatbot-window {
  pointer-events: none;
}
 
.fpt-chatbot-window.open {
  pointer-events: auto;
}
        .fpt-form-error {
          font-size: 12px;
          color: #ef4444;
          margin-top: 4px;
        }

        .fpt-form-submit {
          width: 100%;
          padding: 12px 24px;
          background: ${this.config.primaryColor};
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .fpt-form-submit:hover:not(:disabled) {
          opacity: 0.9;
        }

        .fpt-form-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .fpt-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: fpt-spin 0.8s linear infinite;
        }

        @keyframes fpt-spin {
          to { transform: rotate(360deg); }
        }

        .svgChatIcon {
            width:100%;height:100%;display:flex;align-items:center;justify-content:center;
            border-radius:50%;overflow:hidden;
        }

        .svgChatIcon .siriwhite {
            background:#fff;
        }

        .svgChatIcon .siritrans {
            background:linear-gradient(to bottom right, ${this.config.colorTheme}, #000);
        }

        .svgChatIconDefault {
            background-color: ${this.config.colorTheme};
        }

        .displayBlock {
            display:block;
        }

        .displayFlex {
            display: flex;
        }

        .displayNone {
            display: none;
        }

        .fpt-form-description {
            margin: 8px 0 0 0; color: #6b7280; font-size: 14px;
        }

        .preStyle {
            white-space:pre-wrap;word-break:break-word;
        }

      `;
      document.head.appendChild(style);

      // Add styles for temporary popup message
      const popupStyle = document.createElement('style');
      // FSoft nonce
      popupStyle.setAttribute('nonce', nonce);
      popupStyle.textContent = `
        .temporary-message {
          position: fixed;
          min-width: 280px;
          max-width: 340px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(30,58,138,0.13);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          opacity: 0;
          pointer-events: none;
          transform: translateY(20px) scale(0.98);
          transition: opacity 0.4s, transform 0.4s;
        }
        .temporary-message.show {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }
        .temporary-message.close-anim {
          opacity: 0;
          transform: translateY(20px) scale(0.98);
        }
        .temporary-message .content-wrapper {
          display: flex;
          align-items: center;
        }
        .temporary-message .avatar.bot-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          margin-right: 16px;
          background: #f3f4f6;
          object-fit: contain;
        }
        .temporary-message .text-container {
          flex: 1;
        }
        .temporary-message .title {
          font-size: 16px;
          font-weight: 600;
          color: #1e3a8a;
          margin-bottom: 4px;
        }
        .temporary-message .description {
          font-size: 14px;
          color: #374151;
        }
        .temporary-message .no-select {
          user-select: none;
        }
        .temporary-message .no-wrap {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `;
      document.head.appendChild(popupStyle);
    }

    darkenColor(color, percent) {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, (num >> 16) - amt);
      const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
      const B = Math.max(0, (num & 0x0000ff) - amt);
      return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    createWidget() {
      const container = document.createElement('div');
      container.className = 'fpt-chatbot-container';

      let svgChatIcon = '';
      // Set icon content based on type
      if (this.config.iconType === 'siriwhite') {
        svgChatIcon = `
                    <div class="svgChatIcon siriwhite">
                      <svg width="80%" height="80%" viewBox="0 0 100 100" class="displayBlock" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="3" fill="#8B5CF6">
                          <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="35" cy="50" r="3" fill="#EC4899">
                          <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="65" cy="50" r="3" fill="#06B6D4">
                          <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="25" cy="50" r="2" fill="#F59E0B">
                          <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="75" cy="50" r="2" fill="#10B981">
                          <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    </div>
                  `;
      } else if (this.config.iconType === 'siritrans') {
        svgChatIcon = `
                    <div class="svgChatIcon siritrans">
                      <svg width="80%" height="80%" viewBox="0 0 100 100" class="displayBlock" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="3" fill="#FFFFFF">
                          <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="35" cy="50" r="3" fill="#FFFFFF">
                          <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="65" cy="50" r="3" fill="#FFFFFF">
                          <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="25" cy="50" r="2" fill="#FFFFFF">
                          <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="75" cy="50" r="2" fill="#FFFFFF">
                          <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    </div>
                  `;
      } else {
        // Default iconType or fallback
        svgChatIcon = `
                    <div class="w-16 h-16 rounded-full flex items-center justify-center shadow-md svgChatIconDefault">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                  `;
      }

      container.innerHTML = `
        <button class="fpt-chatbot-button" aria-label="Open chat">
          ${svgChatIcon}
        </button>
        
        <div class="fpt-chatbot-window">
              <div class="fpt-chatbot-header">
            <div class="fpt-chatbot-header-left">
              <div class="fpt-chatbot-header-logo">
                <img src="${this.config.logoUrl}" alt="Logo">
              </div>
              <div class="fpt-chatbot-header-info">
                <h3>${this.config.chatbotName}</h3>
                <p>Online</p>
              </div>
            </div>
            <div class="fpt-chatbot-header-right">
              <button class="fpt-sources-toggle" aria-label="Toggle sources" title="Sources">Sources</button>
              <button class="fpt-chatbot-close" aria-label="Close chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="fpt-chatbot-body">
            <div class="fpt-chatbot-main">
              <div class="fpt-chatbot-welcome ${this.showWelcome ? 'displayFlex' : 'displayNone'}">
                ${this.renderImageSlider()}
                ${this.renderCTAButtons()}
                ${this.renderQuickQuestions()}
              </div>

              <div class="fpt-chatbot-messages ${this.showWelcome ? 'displayNone' : 'displayFlex'}"></div>

              <div class="fpt-predefined-bar ${this.showWelcome ? 'displayNone' : (this.config.predefinedSentences.length > 0 ? 'displayBlock' : 'displayNone')}">
                <div class="fpt-predefined-list"></div>
              </div>

              <div class="fpt-chatbot-input ${this.showWelcome ? 'displayNone' : 'displayBlock'}">
                <div class="fpt-input-wrapper">
                  <input type="text" class="fpt-input-field" placeholder="Type your message...">
                  <button class="fpt-send-button" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="fpt-sources-panel" role="dialog" aria-label="Sources panel">
              <div class="fpt-sources-header">
                <span class="fpt-sources-title">Sources</span>
                <button class="fpt-sources-close" aria-label="Close sources">×</button>
              </div>
              <div class="fpt-sources-list"></div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
      this.container = container;
      this.button = container.querySelector('.fpt-chatbot-button');
      this.button.style.zIndex = 999999;

      this.window = container.querySelector('.fpt-chatbot-window');
      this.messagesContainer = container.querySelector('.fpt-chatbot-messages');
      this.inputField = container.querySelector('.fpt-input-field');
      this.sendButton = container.querySelector('.fpt-send-button');
      this.welcomeScreen = container.querySelector('.fpt-chatbot-welcome');
      this.predefinedBar = container.querySelector('.fpt-predefined-bar');
      this.predefinedList = container.querySelector('.fpt-predefined-list');
      this.sourcesListEl = container.querySelector('.fpt-sources-list');
      // Mobile sources controls
      this.sourcesToggle = container.querySelector('.fpt-sources-toggle');
      this.sourcesCloseBtn = container.querySelector('.fpt-sources-close');
      this.sourcesPanel = container.querySelector('.fpt-sources-panel');

      if (this.sourcesPanel) {
        // stop propagation for interactions inside the panel
        this.sourcesPanel.addEventListener('pointerdown', (ev) => ev.stopPropagation(), { passive: true });
        this.sourcesPanel.addEventListener('click', (ev) => ev.stopPropagation());
      }

      if (this.sourcesToggle) {
        this.sourcesToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const opened = this.container.classList.toggle('mobile-sources-open');
          if (opened) {
            this.sourcesPanel && this.sourcesPanel.classList.add('open');
            // set aria state and focus first item for accessibility
            try {
              this.sourcesToggle.setAttribute('aria-expanded', 'true');
              const first = this.sourcesPanel && this.sourcesPanel.querySelector('.fpt-source-item');
              if (first) first.focus();
            } catch (err) { }
          } else {
            try { this.sourcesToggle.setAttribute('aria-expanded', 'false'); } catch (err) { }
            this.sourcesPanel && this.sourcesPanel.classList.remove('open');
          }
        });
      }

      if (this.sourcesCloseBtn) {
        this.sourcesCloseBtn.addEventListener('click', (e) => {
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          e.stopPropagation();
          e.preventDefault();
          this.container.classList.remove('mobile-sources-open');
          this.sourcesPanel && this.sourcesPanel.classList.remove('open');
          return false;
        });
      }

      const closeIfOutside = (e) => {
        try {
          if (!this.container) return;
          if (!this.container.classList.contains('mobile-sources-open')) return;
          if (e && e.defaultPrevented) return;
          if (this.sourcesPanel && this.sourcesPanel.contains(e.target)) return;
          this.container.classList.remove('mobile-sources-open');
          this.sourcesPanel && this.sourcesPanel.classList.remove('open');
        } catch (err) { /* swallow */ }
      };

      document.addEventListener('pointerdown', closeIfOutside);
      document.addEventListener('click', closeIfOutside);

      if (this.config.sliderImages.length > 0) {
        this.startSlider();
      }

      const message = {
        id: Date.now() + Math.random(),
        text: this.config.botGreetingMessage,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      this.messages.push(message);
      this.renderMessage(message);
      this.scrollToBottom();

      this.updatePredefinedSentences();

      // Show temporary popup message over button after 1s
      setTimeout(() => {
        console.log('Temporary message over button would be shown here.');
        this.showTemporaryMessageOverButton();
      }, 1000);

      // Initialize sources panel with placeholder
      this.updateSources([]);
    }

    renderImageSlider() {
      if (!this.config.slider_images || this.config.slider_images.length === 0) {
        return '';
      }

      const slides = this.config.slider_images.map((img, idx) => {
        const rawImage = (img && img.image_url) ? img.image_url : '';
        const apiBase = (this.config.apiUrl || '').replace(/\/$/, '');
        const isAbsolute = /^(https?:)?\/\//i.test(rawImage) || rawImage.startsWith('data:');
        let imageSrc = rawImage;
        if (rawImage && !isAbsolute) {
          if (apiBase) {
            imageSrc = rawImage.startsWith('/') ? `${apiBase}${rawImage}` : `${apiBase}/${rawImage}`;
          } else {
            imageSrc = rawImage;
          }
        }

        const link = img && (img.link_url || img.link) ? (img.link_url || img.link) : '#';
        const target = (link && link !== '#') ? '_blank' : '_self';

        return `
        <div class="fpt-slider-slide" data-index="${idx}" data-link="${link}">
          <a href="${link}" target="${target}" rel="noopener noreferrer">
            <img src="${imageSrc}" alt="${img && img.title ? img.title : 'Slide ' + (idx + 1)}" style="object-fit:fill;">
          </a>
        </div>
      `;
      }).join('');

      
      const dots = (this.config.sliderImages || this.config.slider_images || []).map((_, idx) => `
        <button class="fpt-slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></button>
      `).join('');

      return `
        <div class="fpt-image-slider">
          <div class="fpt-slider-track">${slides}</div>
          <button class="fpt-slider-nav prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <button class="fpt-slider-nav next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
          <div class="fpt-slider-dots">${dots}</div>
        </div>
      `;
    }

    renderCTAButtons() {

      if (this.config.chatbotButtons && this.config.chatbotButtons.length > 0) {
        const buttons = this.config.chatbotButtons.map(btn => {
          const btnId = btn.action_type || btn.action_type;
          return `<button class="fpt-cta-button" data-action="${btnId}" >${btn.label}</button>`;
        }).join('');

        return `
          <div class="fpt-cta-buttons">
            ${buttons}
          </div>
        `;
      }
    }

    renderQuickQuestions() {
      if (!this.config.predefined_sentences || this.config.predefined_sentences.length === 0) {
        return '';
      }

      const questions = this.config.predefined_sentences.map((sentence, idx) => `
        <button class="fpt-quick-question-btn" data-index="${idx}">${sentence}</button>
      `).join('');

      const title = this.config.quickQuestionsTitle || this.config.quick_questions_title || 'Quick Questions:';
      return `
        <div class="fpt-quick-questions">
          <h4>${title}</h4>
          <div class="fpt-quick-questions-list">${questions}</div>
        </div>
      `;
    }

    startSlider() {
      this.sliderInterval = setInterval(() => {
        this.nextSlide();
      }, 4000);
    }

    stopSlider() {
      if (this.sliderInterval) {
        clearInterval(this.sliderInterval);
        this.sliderInterval = null;
      }
    }

    nextSlide() {
      if (!this.config.sliderImages || this.config.sliderImages.length === 0) return;
      this.currentSlide = (this.currentSlide + 1) % this.config.sliderImages.length;
      this.updateSlider();
    }

    prevSlide() {
      if (!this.config.sliderImages || this.config.sliderImages.length === 0) return;
      this.currentSlide = (this.currentSlide - 1 + this.config.sliderImages.length) % this.config.sliderImages.length;
      this.updateSlider();
    }

    goToSlide(index) {
      this.currentSlide = index;
      this.updateSlider();
    }

    updateSlider() {
      const track = this.container.querySelector('.fpt-slider-track');
      const dots = this.container.querySelectorAll('.fpt-slider-dot');

      if (track) {
        track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
      }

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.currentSlide);
      });
    }

    updatePredefinedSentences() {
      if (!this.predefinedList) return;

      this.predefinedList.innerHTML = this.config.predefinedSentences.map((sentence, idx) => `
        <button class="fpt-predefined-chip" data-index="${idx}">${sentence}</button>
      `).join('');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggleChat());

      const closeBtn = this.container.querySelector('.fpt-chatbot-close');
      closeBtn.addEventListener('click', () => this.toggleChat());

      this.sendButton.addEventListener('click', () => this.handleSend());
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });

      this.inputField.addEventListener('input', (e) => {
        this.sendButton.disabled = !e.target.value.trim();
      });

      // CTA Buttons
      this.container.addEventListener('click', (e) => {
        if (e.target.closest('[data-action="expert_support"]')) {
          this.trackButtonClick(this.config.buttonIds.speakToExpert || 'btn_speak_to_expert');
          this.handleSpeakToExpert();
        } else if (e.target.closest('[data-action="start_chat"]')) {
          this.trackButtonClick(this.config.buttonIds.continueWithAI || 'btn_continue_with_ai');
          this.handleContinueWithAI();
        }
      });

      // Quick Questions (Welcome)
      this.container.addEventListener('click', (e) => {
        const quickBtn = e.target.closest('.fpt-quick-question-btn');
        if (quickBtn) {
          const index = parseInt(quickBtn.dataset.index);
          const sentence = this.config.predefinedSentences[index];
          this.trackButtonClick(`btn_quick_${index + 1}`);
          this.handleContinueWithAI();
          setTimeout(() => this.handlePredefinedClick(sentence), 100);
        }
      });

      // Predefined Chips (Chat)
      this.container.addEventListener('click', (e) => {
        const chip = e.target.closest('.fpt-predefined-chip');
        if (chip) {
          const index = parseInt(chip.dataset.index);
          const sentence = this.config.predefinedSentences[index];
          this.handlePredefinedClick(sentence);
        }
      });

      // Image Slider
      this.container.addEventListener('click', (e) => {
        const prevBtn = e.target.closest('.fpt-slider-nav.prev');
        const nextBtn = e.target.closest('.fpt-slider-nav.next');
        const dot = e.target.closest('.fpt-slider-dot');
        const slide = e.target.closest('.fpt-slider-slide');

        if (prevBtn) {
          this.prevSlide();
          this.stopSlider();
          this.startSlider();
        } else if (nextBtn) {
          this.nextSlide();
          this.stopSlider();
          this.startSlider();
        } else if (dot) {
          const index = parseInt(dot.dataset.index);
          this.goToSlide(index);
          this.stopSlider();
          this.startSlider();
        } else if (slide) {
          const link = slide.dataset.link;
          if (link && link !== '#') {
            window.open(link, '_blank');
          }
        }
      });
    }

    async trackButtonClick(buttonId) {
      // try {
      //     await fetch(`${this.config.apiUrl}/api/buttons/click`, {
      //         method: 'POST',
      //         headers: {
      //             'Content-Type': 'application/json',
      //             'X-Config-Key': this.config.configKey
      //         },
      //         body: JSON.stringify({
      //             sessionId: this.sessionId,
      //             buttonId: buttonId,
      //             timestamp: new Date().toISOString(),
      //             context: {
      //                 page: window.location.href,
      //                 referrer: document.referrer
      //             }
      //         })
      //     });
      // } catch (error) {
      //     console.error('Failed to track button click:', error);
      // }
    }

    async handleSpeakToExpert() {
      try {
        this.showFormModal(this.getConnectedFormForAction('speak_to_expert'));

      } catch (error) {
        console.error('Failed to handle Speak to Expert:', error);
      }
    }

    getConnectedFormForAction(actionType) {
      if (!Array.isArray(this.config.chatbotButtons) || !Array.isArray(this.config.buttonFormConnections) || !Array.isArray(this.forms)) {
        return this.activeForm || null;
      }

      const button = this.config.chatbotButtons.find((btn) => btn && btn.action_type === actionType);
      if (!button || !button.id) {
        return this.activeForm || null;
      }

      const connection = this.config.buttonFormConnections.find((item) => item && item.button_id === button.id);
      if (!connection || !connection.form_id) {
        return this.activeForm || null;
      }

      return this.forms.find((form) => form && form.id === connection.form_id) || this.activeForm || null;
    }

    handleContinueWithAI() {
      this.showWelcome = false;
      this.welcomeScreen.style.display = 'none';
      this.messagesContainer.style.display = 'flex';
      // mark container so UI (sources toggle) can be shown when messages are visible
      if (this.container) this.container.classList.add('messages-visible');
      this.predefinedBar.style.display = this.config.predefined_sentences.length > 0 ? 'block' : 'none';
      this.container.querySelector('.fpt-chatbot-input').style.display = 'block';
      // Show sources panel when chat is active
      if (this.sourcesListEl) {
        this.sourcesListEl.parentElement.style.display = 'flex';
      }

      // Initialize proxy connection only when user continues with AI
      this.initializeProxy();
    }

    handlePredefinedClick(sentence) {
      this.inputField.value = sentence;
      this.sendButton.disabled = false;
      this.handleSend();
    }

    showFormModal(formOverride) {
      const formToRender = formOverride || this.activeForm;
      if (!formToRender) {
        console.warn('No active form available for widget modal');
        return;
      }

      const overlay = document.createElement('div');
      overlay.className = 'fpt-form-overlay';
      const formDescription = formToRender.form_description ? `<div class="fpt-form-description">${formToRender.form_description}</div>` : '';
      overlay.innerHTML = `
        <div class="fpt-form-modal">
          <div class="fpt-form-header">
            <div class="title">
              <h3>${formToRender.form_name}</h3>
              ${formDescription}
            </div>
            <button class="fpt-form-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="fpt-form-body">
            ${this.renderFormFields(formToRender)}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      overlay.querySelector('.fpt-form-close').addEventListener('click', () => {
        overlay.remove();
      });

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });

      overlay.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(overlay, formToRender);
      });
    }

    renderFormFields(formConfig) {
      // Support API response: { data: [ ...fields ] }
      const fieldsArray = Array.isArray(this.formFields.data) ? this.formFields.data : this.formFields;
      const fields = fieldsArray.map(field => {
        const requiredMark = field.is_required ? '<span class="fpt-form-required">*</span>' : '';
        let inputHTML = '';
        const requiredAttr = field.is_required ? 'required' : '';
        switch (field.field_type) {
          case 'textarea':
            inputHTML = `<textarea class="fpt-form-textarea" id="${field.field_id}" name="${field.field_name}" placeholder="${field.placeholder || ''}" ${requiredAttr}></textarea>`;
            break;
          case 'select':
            const options = field.options || [];
            // Compute default value for Country field from widget config
            const defaultVal = (field.field_id === 'Country' && formConfig && formConfig.defaultCountryName)
              ? formConfig.defaultCountryName
              : (field.default_value || '');

            console.log("defaultVal", defaultVal);

            inputHTML = `
              <select class="fpt-form-select" id="${field.field_id}" name="${field.field_name}" ${requiredAttr}>
                <option value="">${field.placeholder || 'Select ' + field.field_name}</option>
                ${options.map(opt => {
              // Support string options or { id, label } / { value, label }
              if (typeof opt === 'string') {
                const isSelected = defaultVal && opt === defaultVal ? ' selected' : '';
                return `<option value="${opt}"${isSelected}>${opt}</option>`;
              } else {
                const val = opt.id || opt.value || opt.code || opt.label || '';
                const label = opt.label || opt.name || val;
                const isSelected = defaultVal && (val === defaultVal || opt.label === defaultVal) ? ' selected' : '';
                return `<option value="${val}"${isSelected}>${label}</option>`;
              }
            }).join('')}
              </select>
            `;
            break;
          default:
            inputHTML = `<input type="${field.field_type}" id="${field.field_id}" class="fpt-form-input" name="${field.field_name}" placeholder="${field.placeholder || ''}" ${requiredAttr}>`;
        }
        return `
          <div class="fpt-form-field">
            <label class="fpt-form-label" for="${field.field_id}">${field.field_name}${requiredMark}</label>
            ${inputHTML}
            <div class="fpt-form-error"></div>
          </div>
        `;
      }).join('');


      // Static Terms & Privacy checkbox (not driven by form fields)
      const termsUrl = (formConfig && formConfig.terms_url) ? formConfig.terms_url : (this.config.termsUrl || '');
      const privacyUrl = (formConfig && formConfig.privacy_url) ? formConfig.privacy_url : (this.config.privacyUrl || '');

      // Allow admin to include {terms} and {privacy} tokens in the `terms_message`.
      const rawMsg = (formConfig && formConfig.terms_message)
        ? formConfig.terms_message
        : (this.config.termsMessage || 'I agree to the {terms} and {privacy}.');

      const termAnchor = `<a href="${termsUrl || '#'}" target="_blank" style="color:${this.config.headerColor || '#1e3a8a'};text-decoration:underline;">Terms &amp; Conditions</a>`;
      const privacyAnchor = `<a href="${privacyUrl || '#'}" target="_blank" style="color:${this.config.headerColor || '#1e3a8a'};text-decoration:underline;">Privacy Policy</a>`;

      let renderedMsg = rawMsg.replace(/\{\{?terms\}?\}/gi, termAnchor).replace(/\{\{?privacy\}?\}/gi, privacyAnchor);

      const termsHtml = `
        <div class="fpt-form-terms" style="margin:12px 0;">
          <label style="display:flex;align-items:flex-start;gap:8px;font-size:14px;color:#374151;">
            <input type="checkbox" name="__accept_terms" required style="margin-top:4px;" />
            <span class="fpt-terms-message" style="line-height:1.3;">${renderedMsg}</span>
          </label>
        </div>
      `;

      return `
        <form>
          ${fields}
          ${termsHtml}
          <button type="submit" class="fpt-form-submit">
            <span>${(formConfig && formConfig.cta_button_text) || 'Submit'}</span>
          </button>
        </form>
      `;
    }

    async handleFormSubmit(overlay, formConfig) {
      const form = overlay.querySelector('form');
      const formData = new FormData(form);
      const data = {};

      // Map field_id to value instead of field_name
      const fieldsArray = Array.isArray(this.formFields.data) ? this.formFields.data : this.formFields;
      formData.forEach((value, key) => {
        const field = fieldsArray.find(f => f.field_name === key);
        if (field && field.field_id) {
          data[field.field_id] = value;
        } else {
          data[key] = value;
        }
      });

      const submitBtn = form.querySelector('.fpt-form-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="fpt-spinner"></div><span>Submitting...</span>';

      try {
        const session_info = await this.getSessionInfo();
        const leadData = {
          session_id: this.sessionId,
          form_id: formConfig.id,
          form_name: formConfig.form_name,
          form_data: data,
          chat_history: this.messages.map(m => ({
            sender: m.sender,
            message: m.text,
            timestamp: m.timestamp || new Date().toISOString()
          })),
          source: 'widget',
          session_info
        };
        console.log("leadData", leadData);

        // Call new widget lead API
        const response = await fetch(`${this.config.apiUrl}/api/widget/lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            configKey: this.config.configKey,
            lead_data: leadData
          })
        });

        if (!response.ok) throw new Error('Failed to submit lead');

        // Show success
        this.showFormSuccess(overlay, formConfig);

      } catch (error) {
        console.error('Form submission error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit</span>';
        if (window.Swal) {
          Swal.fire({
            title: 'Submission Failed',
            text: 'Failed to submit form. Please try again.',
            icon: 'error',
            confirmButtonColor: this.config.headerColor || '#1e3a8a'
          });
        } else {
          console.error('Failed to submit form. Please try again.');
        }
      }
    }

    showFormSuccess(overlay, formConfig) {
      const modal = overlay.querySelector('.fpt-form-modal');
      modal.innerHTML = `
        <div class="fpt-form-success">
          <div class="fpt-form-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
          </div>
          <h3>${formConfig.thank_you_title || ''}</h3>
          <p>${formConfig.thank_you_message || 'Thank you for your submission.'}</p>
        </div>
      `;

      setTimeout(() => {
        overlay.remove();
      }, 2000);
    }

    toggleChat() {
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.window.classList.add('open');
        // mark container as chat-open so UI controls (like sources toggle) can appear
        if (this.container) this.container.classList.add('chat-open');
        // Create lead on chat start
        this.createLeadSession();
        this.button.style.display = 'none';
        // Show sources toggle when chat opens (mobile)
        if (this.sourcesToggle) {
          try { this.sourcesToggle.setAttribute('aria-expanded', 'false'); } catch (err) { }
        }
        // Hide sources panel if welcome screen is shown
        if (this.sourcesListEl) {
          this.sourcesListEl.parentElement.style.display = this.showWelcome ? 'none' : 'flex';
        }
      } else {
        this.window.classList.remove('open');
        if (this.container) this.container.classList.remove('chat-open');
        // keep `messages-visible` so the sources toggle remains available even after closing
        this.button.style.display = 'flex';
      }
    }

    async initializeProxy() {
      // Prevent concurrent connection attempts
      if (this.proxyConnecting || (this.proxySocket && (this.proxySocket.readyState === WebSocket.OPEN || this.proxySocket.readyState === WebSocket.CONNECTING))) {
        console.log('[Proxy] Connection already in progress or established');
        return;
      }

      this.proxyConnecting = true;
      console.log('[Proxy] Starting connection...');

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
          this.proxyConnecting = false;
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
                // Keep set bounded to avoid unbounded growth in long sessions.
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
          console.log('[Proxy] Connection closed, cleaning up');
          this.proxySocket = null;
          this.proxyReady = false;
          this.proxyConnecting = false;
          if (this.isOpen) {
            console.log('[Proxy] Widget still open, reconnecting in 3 seconds...');
            setTimeout(() => this.initializeProxy(), 3000);
          }
        };
      } catch (error) {
        console.error('Failed to initialize proxy connection:', error);
        this.proxyConnecting = false;
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

    async sendBotActivity(activity) {
      if (!activity || activity.type !== 'message') return;

      const payload = {
        type: 'user_message',
        text: activity.text,
        value: activity.value,
        locale: activity.locale || this.config.locale,
        channelData: activity.channelData
      };

      this.isBotTyping = true;
      this.updateTypingIndicator();

      if (!this.proxySocket || this.proxySocket.readyState !== WebSocket.OPEN) {
        await this.initializeProxy();
      }

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

      // If sender is explicitly user-like, always skip for bot UI rendering.
      if (fromId && (fromId === 'user' || fromId === 'user1')) {
        return;
      }

      // Direct Line often sends user-echo activities on the same stream; skip them.
      if (isLikelyUserEcho) {
        return;
      }

      // Learn bot sender ids from valid bot replies, then suppress messages from unknown senders.
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

      const cleanedText = (incomingText || '').trim();
      const isPlaceholderText = cleanedText === '.' || cleanedText === '...' || cleanedText === '…';
      const shouldRenderText = !!cleanedText && !isPlaceholderText;

      // Keep loader active for non-meaningful interim payloads.
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

        // Parse sources from the message text - porting logic from Chatbot.tsx
        // Pattern 1: **Source List of Response:** (with colon)
        let sourceListMatch = messageText.match(/\*\*Source List of Response:\*\*([\s\S]*?)$/i);
        
        // Pattern 2: **Source List of Response** (without colon)
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

        if (sourceListMatch) {
          const sourceSection = sourceListMatch[1] || sourceListMatch[2];
          const lines = sourceSection.split('\n').filter(line => line.trim());

          lines.forEach((line) => {
            // Pattern A: Reference format [1]: https://url "Title"
            const refMatch = line.match(/^\[(\d+)\]:\s*(https?:\/\/[^\s]+)\s*"([^"]+)"/);
            if (refMatch) {
              const source = {
                title: refMatch[3].trim(),
                url: refMatch[2],
              };
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
                parsedSources.push(source);
              }
            }
            // Pattern D: Bold titles without URLs
            else if (line.includes('**')) {
              const titleMatch = line.match(/\*\*([^*]+)\*\*/);
              if (titleMatch) {
                const source = {
                  title: titleMatch[1].trim(),
                  url: undefined,
                };
                parsedSources.push(source);
              }
            }
          });

          // Remove the source section from the message text
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

        // Handle submit actions
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
              // Send form details to lead API if needed
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

    async updateLeadSession(message, sources = []) {
      try {
        await fetch(`${this.config.apiUrl}/api/widget/lead-session`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            configKey: this.config.configKey,
            session_id: this.sessionId,
            message: message.text,
            sender: message.sender,
            sources: sources
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
        ? `<div class="fpt-message-avatar user"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`
        : `<div class="fpt-message-avatar bot"><img nonce="${nonce}" src="${this.config.logoUrl}" alt="Bot" onerror="this.src='/FPTSoftware.png'"></div>`;

      messageEl.innerHTML = `${avatarHTML}<div class="fpt-message-content"><div class="fpt-message-bubble">${this.formatText(message.text)}</div></div>`;
      this.messagesContainer.appendChild(messageEl);
    }

    formatText(text) {
      if (!text) return '';
      let formatted = text;

      formatted = formatted.replace(/^.*?\n\n/, '');
      formatted = formatted.replace(/\*\*FleziMate,\s*the\s*virtual\s*assistant\s*of\s*FPT\s*Software\*\*/gi, '').trim();

      // Remove source/reference blocks from the rendered message body.
      formatted = formatted.replace(/(\*\*\s*Source\s*List\s*of\s*Response\s*\*\*|Source\s*List\s*of\s*Response)[\s\S]*/i, '');
      formatted = formatted.replace(/\[\d+\]:\s*https?:\/\/[^\s]+/g, '');

      // Fix malformed anchor text like url)[1]
      formatted = formatted.replace(/<a\s+href="([^"]*)\)\[\d+\]"([^>]*)>([^<]*)\)\[\d+\]</g, '<a href="$1"$2>$3<');

      formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/(^|[^*])\*(?!\*)([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
      formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');

      if (!/<a\s+href=/i.test(formatted)) {
        formatted = formatted.replace(
          /(https?:\/\/[^\s<]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
      }

      formatted = formatted.replace(/  \n/g, '<br>');
      formatted = formatted.replace(/\n/g, '<br>');

      return formatted.trim();
    }

    updateTypingIndicator() {
      const existing = this.messagesContainer.querySelector('.fpt-typing-indicator');
      if (existing) existing.remove();
      if (this.isBotTyping) {
        const indicator = document.createElement('div');
        indicator.className = 'fpt-message bot fpt-typing-indicator';
        indicator.innerHTML = `<div class="fpt-message-avatar bot"><img nonce="${nonce}" src="${this.config.logoUrl}" alt="Bot" onerror="this.src='/FPTSoftware.png'"></div><div class="fpt-message-content"><div class="fpt-typing-bubble"><div class="fpt-typing-dot"></div><div class="fpt-typing-dot"></div><div class="fpt-typing-dot"></div></div></div>`;
        this.messagesContainer.appendChild(indicator);
      }
      this.scrollToBottom();
    }

    escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    cleanSourceText(value) {
      return String(value || '')
        .replace(/<a\b[^>]*>/gi, ' ')
        .replace(/<a\b[^>]*$/gi, ' ')
        .replace(/<\/a>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/(?:target|rel|href)\s*=\s*['"][^'"]*['"]/gi, ' ')
        .replace(/(?:target|rel|href)\s*=\s*[^\s>]+/gi, ' ')
        .replace(/window\.open\s*\([^)]*\)/gi, ' ')
        .replace(/_blank|noopener|noreferrer/gi, ' ')
        .replace(/&quot;|&#34;|&#39;|&apos;/gi, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^['"\s>]+|['"\s>]+$/g, '')
        .trim();
    }

    updateSources(sources = []) {
      if (!this.sourcesListEl) return;
      
      // Store sources with message association to slice them like React component
      if (!this.allMessageSources) this.allMessageSources = [];
      if (sources.length > 0) {
        this.allMessageSources.push(sources);
      }

      // Keep sources from last 3 bot messages
      const recentSourcesGroups = this.allMessageSources.slice(-3);
      
      let sourcesHtml = '';
      const seenSources = new Set();
      recentSourcesGroups.forEach((group) => {
        sourcesHtml += group.map((source, idx) => {
          const cleanTitle = this.cleanSourceText(source.title) || 'Untitled Source';
          const cleanUrl = this.cleanSourceText(source.url);
          const dedupeKey = `${cleanTitle}__${cleanUrl}`;
          if (seenSources.has(dedupeKey)) {
            return '';
          }
          seenSources.add(dedupeKey);
          const safeHref = source.url ? this.escapeHtml(source.url) : '#';
          return `
          <a class="fpt-source-item" ${source.url ? `href="${safeHref}" target="_blank" rel="noopener noreferrer"` : 'href="#" tabindex="-1"'} >
            <div class="fpt-source-title">${idx + 1}. ${this.escapeHtml(cleanTitle)}</div>
            ${cleanUrl ? `
              <div class="fpt-source-link">
                ${this.escapeHtml(cleanUrl)}
              </div>
            ` : ''}
          </a>
        `;
        }).join('');
      });

      if (!sourcesHtml) {
        this.sourcesListEl.innerHTML = '<p style="text-align:center;color:#6b7280;font-size:12px;margin-top:20px;">Source references will appear here</p>';
      } else {
        this.sourcesListEl.innerHTML = sourcesHtml;
      }
    }

    scrollToBottom() {
      setTimeout(() => {
        if (this.messagesContainer) {
          this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
      }, 100);
    }
  }

  // Public API
  window.FPTChatbot = {
    init: function (config) {
      // Inject SweetAlert if not present
      if (!window.Swal) {
        const swalScript = document.createElement('script');
        swalScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(swalScript);
      }

      if (!config.configKey) {
        console.error('FPT Chatbot: configKey is required');
        return;
      }

      console.log("FPT Chatbot: Initializing with config", config);

      // Evaluate chatbot visibility rules from public settings before initializing
      (async function () {
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
