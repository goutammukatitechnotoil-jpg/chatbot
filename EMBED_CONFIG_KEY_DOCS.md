# Chatbot Configuration Key & Embed System

## Overview

The FleziMate Chatbot now uses a secure configuration key system for embedding chatbots on external websites. This approach provides better security and easier configuration management.

## How It Works

### 1. Configuration Key Generation
- Admin users can generate unique configuration keys in the Settings panel
- Each key is tied to the current chatbot configuration
- Keys are stored securely in the database
- Generating a new key invalidates the previous one

### 2. Embed Code Structure
The new embed code is much simpler and more secure:

```html
<!-- FleziMate Chatbot Embed Code -->
<script>
  (function() {
    var chatbotConfig = {
      configKey: 'cbk_xxxxxxxxxxxxxxxxxx',
      apiUrl: 'https://your-domain.com'
    };

    var script = document.createElement('script');
    script.src = 'https://your-domain.com/chatbot-loader.js';
    script.async = true;
    script.onload = function() {
      if (window.FleziMateChatbot) {
        window.FleziMateChatbot.init(chatbotConfig);
      }
    };
    document.head.appendChild(script);
  })();
</script>
```

### 3. Configuration Loading Process
1. The chatbot-loader.js script loads on the external website
2. It makes an API call to `/api/config/public?key=YOUR_CONFIG_KEY`
3. The server validates the key and returns the configuration data
4. The chatbot is initialized with the fetched configuration

## API Endpoints

### `/api/config/key` 
- **GET**: Retrieve current configuration key
- **POST**: Generate a new configuration key

### `/api/config/public`
- **GET**: Fetch configuration using config key (public endpoint)
- Query parameter: `key` - The configuration key

## Security Features

1. **Key Validation**: Only valid keys can fetch configuration
2. **Public API**: The public endpoint only returns necessary configuration data
3. **No Sensitive Data**: Sensitive information is not included in the public response
4. **Key Rotation**: New keys can be generated to invalidate old ones

## Usage Instructions

### For Administrators:
1. Log into the admin panel
2. Go to Settings
3. Generate a configuration key
4. Copy the provided embed code
5. Share the embed code with website owners

### For Website Owners:
1. Receive the embed code from the administrator
2. Paste the code before the closing `</body>` tag in your HTML
3. The chatbot will appear as a floating icon
4. All configuration is managed centrally by the administrator

## Benefits

1. **Centralized Configuration**: All chatbot settings managed in one place
2. **Easy Updates**: Configuration changes apply to all embedded instances
3. **Better Security**: No sensitive data in embed code
4. **Simple Integration**: Minimal code required for embedding
5. **Key Rotation**: Enhanced security through key regeneration

## Fallback Handling

- If the database is unavailable, the system provides default configuration
- Error handling ensures the website doesn't break if the chatbot fails to load
- Graceful degradation maintains website functionality

## Testing

Use the provided test file at `/test-embedded-chatbot.html` to verify the embed functionality works correctly.
