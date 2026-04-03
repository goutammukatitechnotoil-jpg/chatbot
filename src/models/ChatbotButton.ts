import { ObjectId } from 'mongodb';

export interface ChatbotButton {
  _id?: ObjectId;
  id?: string;
  label: string;
  type: 'quick_reply' | 'cta' | 'menu';
  description?: string;
  location?: string;
}

export interface ButtonFormConnection {
  _id?: ObjectId;
  button_id: string;
  form_id: string;
}
