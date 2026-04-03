/**
 * FleziMate Chatbot Loader
 * This script allows embedding the chatbot on any website
 */
 
(function() {
  'use strict';

  // Create the FleziMate namespace
  window.FleziMateChatbot = window.FleziMateChatbot || {};

  // Configuration
  let config = {
    apiUrl: '',
    botId: '',
    botSecret: '',
    colorTheme: '#f37021',
    iconType: 'default',
    logoUrl: '',
    chatbotName: 'FPT AI Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    locale: 'en-US',
    autoDetectLocale: false,
    tokenEndpoint: 'https://directline.botframework.com/v3/directline/tokens/generate'
  };

  // State
  let isOpen = false;
  let chatContainer = null;
  let chatIcon = null;

  // Initialize the chatbot
  window.FleziMateChatbot.init = function(userConfig) {
    // Store API URL and config key
    const apiUrl = userConfig.apiUrl || '';
    const configKey = userConfig.configKey;

    if (!configKey) {
      console.error('FleziMate Chatbot: Config key is required');
      return;
    }

    // Fetch configuration using the config key
    fetch(apiUrl + '/api/config/public?key=' + encodeURIComponent(configKey))
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to fetch chatbot configuration');
        }
        return response.json();
      })
      .then(function(result) {
        // Merge fetched config with defaults and API URL
        config = Object.assign(config, result.data, { 
          apiUrl: apiUrl,
          configKey: configKey 
        });

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createChatbot);
        } else {
          createChatbot();
        }
      })
      .catch(function(error) {
        console.error('FleziMate Chatbot initialization failed:', error);
      });
  };

  // Create the chatbot UI
  function createChatbot() {
    // Create chatbot icon
    createChatIcon();

    // Create chatbot iframe container
    createChatContainer();

    // Add event listeners
    addEventListeners();
  }

  // Create the floating chat icon
  function createChatIcon() {
    chatIcon = document.createElement('div');
    chatIcon.id = 'flezimate-chat-icon';

    // Set background based on icon type
    var backgroundColor = config.iconType === 'siriwhite' ? '#ffffff' : config.colorTheme;

    chatIcon.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: ${backgroundColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9998;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      overflow: hidden;
    `;

    // Set icon content based on type
    if (config.iconType === 'siriwhite') {
      chatIcon.innerHTML = `
        <img src="${config.apiUrl}/siriwhite.gif" alt="Chat" style="width: 100%; height: 100%; object-fit: cover;">
      `;
    } else if (config.iconType === 'siritrans') {
      chatIcon.innerHTML = `
        <img src="${config.apiUrl}/siritrans.gif" alt="Chat" style="width: 100%; height: 100%; object-fit: cover;">
      `;
    } else {
      chatIcon.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }

    // Hover effect
    chatIcon.addEventListener('mouseenter', function() {
      chatIcon.style.transform = 'scale(1.1)';
      chatIcon.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });

    chatIcon.addEventListener('mouseleave', function() {
      chatIcon.style.transform = 'scale(1)';
      chatIcon.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    document.body.appendChild(chatIcon);
  }

  // Create the chat container with iframe
  function createChatContainer() {
    chatContainer = document.createElement('div');
    chatContainer.id = 'flezimate-chat-container';
    chatContainer.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 40px);
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      display: none;
      overflow: hidden;
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'flezimate-chat-iframe';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;

    // Build iframe URL with config key
    const params = new URLSearchParams({
      configKey: config.configKey,
      embedded: 'true'
    });

    iframe.src = `${config.apiUrl}?${params.toString()}`;

    chatContainer.appendChild(iframe);
    document.body.appendChild(chatContainer);
  }

  // Add event listeners
  function addEventListeners() {
    // Toggle chat on icon click
    chatIcon.addEventListener('click', toggleChat);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });

    // Handle messages from iframe (for future features)
    window.addEventListener('message', function(event) {
      if (event.origin !== config.apiUrl) return;

      // Handle messages from the chatbot iframe
      if (event.data.type === 'flezimate-close') {
        closeChat();
      }
    });
  }

  // Toggle chat window
  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  // Open chat window
  function openChat() {
    isOpen = true;
    chatContainer.style.display = 'block';
    chatContainer.style.opacity = '0';
    chatContainer.style.transform = 'translateY(20px)';

    // Animate in
    setTimeout(function() {
      chatContainer.style.opacity = '1';
      chatContainer.style.transform = 'translateY(0)';
    }, 10);

    // Change icon to X
    chatIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
  }

  // Close chat window
  function closeChat() {
    isOpen = false;
    chatContainer.style.opacity = '0';
    chatContainer.style.transform = 'translateY(20px)';

    setTimeout(function() {
      chatContainer.style.display = 'none';
    }, 300);

    // Change icon back to chat
    chatIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
  }

  // Public API
  window.FleziMateChatbot.open = openChat;
  window.FleziMateChatbot.close = closeChat;
  window.FleziMateChatbot.toggle = toggleChat;

})();
