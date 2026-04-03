import { ObjectId } from 'mongodb';

export interface CustomForm {
  _id?: ObjectId;
  id?: string;
  form_name: string;
  form_title: string;
  form_description?: string;
  cta_button_text?: string;
  cta_button_color?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FormField {
  _id?: ObjectId;
  id?: string;
  form_id: string;
  field_name: string;
  field_type: string;
  placeholder?: string;
  placement?: string;
  is_required: boolean;
  order_index: number;
  options?: string[];
  created_at?: string;
  updated_at?: string;
}
