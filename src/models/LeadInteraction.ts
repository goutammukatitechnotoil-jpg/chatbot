import { ObjectId } from 'mongodb';
import { ChatMessage } from '../types/leads';

export interface LeadInteraction {
  _id?: ObjectId;
  session_id: string;
  date: string;
  chat_history: ChatMessage[];
  form_data: Record<string, any>;
  last_message: string;
  created_at: string;
  updated_at: string;
}
