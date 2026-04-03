export type FieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'date'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio';

export type FieldPlacement = 'left' | 'right' | 'full';

export interface SelectOption {
  label: string;
  id: string;
}

export interface FormField {
  id?: string;
  field_id?: string;
  form_id?: string;
  field_name: string;
  field_type: FieldType;
  placeholder: string;
  placement: FieldPlacement;
  is_required: boolean;
  order_index: number;
  options?: string[] | SelectOption[];
  default_value?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomForm {
  id?: string;
  form_name: string;
  form_title: string;
  form_description?: string;
  /** Optional default country name used to pre-select Country fields */
  defaultCountryName?: string;
  thank_you_title?: string;
  thank_you_message?: string;
  // Optional message and links to show near the form (Terms & Privacy)
  terms_message?: string;
  terms_url?: string;
  privacy_url?: string;
  cta_button_text: string;
  cta_button_color: string;
  is_active: boolean;
  connected_button_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatbotButton {
  id: string;
  label: string;
  type: 'quick_reply' | 'cta' | 'menu';
  description?: string;
  location: string;
}

export interface ButtonFormConnection {
  button_id: string;
  form_id: string;
}

export interface FormSubmission {
  id?: string;
  form_id: string;
  session_id: string;
  last_message?: string;
  name?: string;
  email?: string;
  company?: string;
  country?: string;
  purpose?: string;
  details?: string;
  job_title?: string;
  phone?: string;
  custom_data?: Record<string, any>;
  submitted_at?: string;
}
