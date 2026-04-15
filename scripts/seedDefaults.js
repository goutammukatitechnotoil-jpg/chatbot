const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fpt_chatbot';

const DEFAULT_CONFIG = {
  config_id: 'main_config',
  colorTheme: '#f37021',
  headerColorTheme: '#f37021',
  logoUrl: '/FPTSoftware.png',
  iconType: 'default',
  chatbotName: 'AI Assistant',
  triggerMessage: 'Hi there! How can I help you today?',
  botGreetingMessage: 'Hello! I\'m your AI assistant. How can I help you today?',
  popupTitle: 'Need help? 👋🏻',
  popupDescription: 'I\'ve got you covered!',
  locale: 'en-US',
  autoDetectLocale: true,
  autoTriggerEnabled: true,
  autoTriggerCount: 3,
  autoTriggerDelay: 5000,
  tokenEndpoint: 'https://796c75839a51e7df8f6f5151db27b9.90.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr7ac_agent_eP6wtl/directline/token?api-version=2022-03-01-preview',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_CONTENT = {
  content_id: 'main_content',
  slider_images: [
    {
      image_url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: 'https://fpt.com/promo1',
      title: 'Promo 1',
      description: 'First promotional content'
    },
    {
      image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: 'https://fpt.com/promo2',
      title: 'Promo 2', 
      description: 'Second promotional content'
    },
    {
      image_url: 'https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: 'https://fpt.com/promo3',
      title: 'Promo 3',
      description: 'Third promotional content'
    }
  ],
  predefined_sentences: [
    'What services do you offer?',
    'How can I get started?',
    'Tell me about your pricing',
    'I need technical support',
    'How can I contact support?',
    'What are your business hours?'
  ],
  welcome_messages: [
    'Welcome! How can I assist you today?',
    'Hello! I\'m here to help you.',
    'Hi there! What can I do for you?'
  ],
  error_messages: {
    connection_error: 'Unable to connect to the chat service. Please try again later.',
    timeout_error: 'Request timeout. Please try again.',
    general_error: 'Something went wrong. Please try again.'
  },
  button_labels: {
    send: 'Send',
    close: 'Close',
    minimize: 'Minimize',
    restart: 'Restart Chat'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_SYSTEM_SETTINGS = {
  settings_id: 'main_settings',
  direct_line: {
    base_url: 'https://directline.botframework.com/v3/directline',
    token_endpoint: 'https://directline.botframework.com/v3/directline/tokens/generate',
    locale: 'en-US',
    timeout: 30000
  },
  api_settings: {
    default_headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
    retry_attempts: 3
  },
  file_upload: {
    max_size: 10485760, // 10MB
    allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    storage_path: '/uploads'
  },
  cloudinary: {
    url: '',
    cloud_name: '',
    api_key: '',
    api_secret: ''
  },
  analytics: {
    date_format: {
      locale: 'en-US',
      options: {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    },
    default_presets: ['today', 'yesterday', 'last7days', 'last30days']
  },
  security: {
    password_min_length: 8,
    session_timeout: 3600000, // 1 hour
    max_login_attempts: 5
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_BUTTONS = [
  {
    id: 'btn_talk_to_human',
    label: 'Speak to Expert',
    type: 'cta',
    description: 'Connect users with human support agents',
    location: 'welcome_screen',
    action_type: 'expert_support',
    is_system_button: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'btn_continue_ai',
    label: 'Continue with AI',
    type: 'cta', 
    description: 'Start conversation with AI chatbot',
    location: 'welcome_screen',
    action_type: 'start_chat',
    is_system_button: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const DEFAULT_USER_TEMPLATE = {
  defaults_id: 'main_defaults',
  default_admin: {
    name: 'Admin User',
    email: 'mithunpj@fpt.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    created_by: 'system',
    permissions: {
      manage_users: true,
      manage_forms: true,
      manage_buttons: true,
      view_analytics: true,
      manage_settings: true,
      export_data: true
    }
  },
  user_roles: {
    admin: {
      name: 'Administrator',
      permissions: ['all']
    },
    manager: {
      name: 'Manager',
      permissions: ['manage_forms', 'manage_buttons', 'view_analytics']
    },
    viewer: {
      name: 'Viewer',
      permissions: ['view_analytics']
    }
  },
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: false,
    expiry_days: 90
  },
  session_settings: {
    timeout_minutes: 60,
    max_concurrent_sessions: 3,
    remember_me_days: 30
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function seedDefaults() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Seed chatbot config
    console.log('Seeding chatbot config...');
    await db.collection('chatbot_config').updateOne(
      { config_id: 'main_config' },
      { $set: DEFAULT_CONFIG },
      { upsert: true }
    );
    
    // Seed chatbot content
    console.log('Seeding chatbot content...');
    await db.collection('chatbot_content').updateOne(
      { content_id: 'main_content' },
      { $set: DEFAULT_CONTENT },
      { upsert: true }
    );
    
    // Seed system settings
    console.log('Seeding system settings...');
    await db.collection('system_settings').updateOne(
      { settings_id: 'main_settings' },
      { $set: DEFAULT_SYSTEM_SETTINGS },
      { upsert: true }
    );
    
    // Seed user defaults
    console.log('Seeding user defaults...');
    await db.collection('user_defaults').updateOne(
      { defaults_id: 'main_defaults' },
      { $set: DEFAULT_USER_TEMPLATE },
      { upsert: true }
    );
    
    // Seed default buttons
    console.log('Seeding default buttons...');
    for (const button of DEFAULT_BUTTONS) {
      await db.collection('chatbot_buttons').updateOne(
        { id: button.id },
        { $set: button },
        { upsert: true }
      );
    }
    
    console.log('✅ All defaults seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding defaults:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seedDefaults();
}

module.exports = { seedDefaults };
