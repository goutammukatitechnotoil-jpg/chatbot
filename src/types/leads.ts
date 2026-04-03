export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
  attachments?: Array<{
    contentType: string;
    content: any;
  }>;
}

export interface SessionInfo {
  device_type: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  operating_system: string;
  browser_type: string;
  browser_version: string;
  ip_address: string;
  network_type: 'Wi-Fi' | 'Mobile Data' | 'Unknown';
  timezone: string;
  country: string;
  user_agent: string;
  screen_resolution?: string;
  captured_at: string;
}

export interface LeadInteraction {
  id: string;
  session_id: string;
  date: string;
  chat_history: ChatMessage[];
  form_data?: {
    name?: string;
    email?: string;
    company?: string;
    country?: string;
    purpose?: string;
    details?: string;
    job_title?: string;
    phone?: string;
    [key: string]: any;
  };
  last_message?: string;
  session_info?: SessionInfo;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  hasChatHistory?: boolean;
  hasFormData?: boolean;
}
