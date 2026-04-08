import { useState, useEffect } from 'react';
import { Plus, Save, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { CustomForm, FormField, ChatbotButton } from '../types/forms';
import { formService } from '../services/formService';
import { buttonService } from '../services/buttonService';
import { FormFieldEditor } from './FormFieldEditor';
import { COUNTRIES } from '../constants/countries';
import { ConfigService } from '../services/configService';

interface FormBuilderProps {
  formId?: string;
  onSave?: (form: CustomForm) => void;
}

import { useLoading } from '../contexts/LoadingContext';

export function FormBuilder({ formId, onSave }: FormBuilderProps) {
  const { setIsLoading } = useLoading();
  const [form, setForm] = useState<CustomForm>({
    form_name: '',
    form_title: '',
    form_description: '',
    thank_you_title: '',
    thank_you_message: '',
    cta_button_text: 'Submit',
    cta_button_color: '#f37021',
    is_active: true,
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [availableButtons, setAvailableButtons] = useState<ChatbotButton[]>([]);
  const [showButtonSelector, setShowButtonSelector] = useState(false);

  const prefilledFields = [
    { name: 'Date', type: 'date' as const },
    { name: 'Session ID', type: 'text' as const },
    { name: 'Last Message', type: 'text' as const },
    { name: 'Name', type: 'text' as const },
    { name: 'Email', type: 'email' as const },
    { name: 'Company', type: 'text' as const },
    { name: 'Country', type: 'select' as const, options: COUNTRIES },
    { name: 'Purpose', type: 'select' as const, options: [
      { label: 'General Inquiry', id: 'general_inquiry' },
      { label: 'Sales', id: 'sales' },
      { label: 'Support', id: 'support' },
      { label: 'Partnership', id: 'partnership' },
      { label: 'Demo Request', id: 'demo_request' },
      { label: 'Other', id: 'other' }
    ]},
    { name: 'Details', type: 'textarea' as const },
    { name: 'Job Title', type: 'text' as const },
    { name: 'Phone', type: 'tel' as const },
  ];

  useEffect(() => {
    loadButtons();
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadButtons = async () => {
    const buttons = await buttonService.getAllButtons();
    setAvailableButtons(buttons);
  };

  const loadForm = async () => {
    if (!formId) return;
    setLoading(true);
    setIsLoading(true, 'Loading form details...');
    try {
      const formData = await formService.getFormById(formId);
      if (!formData) {
        console.warn(`Form not found: ${formId}`);
        return;
      }
      const formFields = await formService.getFormFields(formId);
      setForm(formData);
      // If tenant config has defaults for terms/privacy, use them when the form doesn't provide values
      try {
        const cfg = await ConfigService.getConfig();
        if (formData) {
          setForm(prev => ({
            ...prev,
            terms_message: (prev as any).terms_message || (cfg as any).termsMessage || '',
            terms_url: (prev as any).terms_url || (cfg as any).termsUrl || '',
            privacy_url: (prev as any).privacy_url || (cfg as any).privacyUrl || '',
          }));
        }
      } catch (e) {
        // ignore config errors — not fatal for form editing
        console.debug('No tenant config available for form defaults', e);
      }
      
      // Migrate old string array options to new SelectOption format
      const migratedFields = formFields.map(field => {
        if (field.options && Array.isArray(field.options) && field.options.length > 0) {
          // Check if options are strings (old format)
          if (typeof field.options[0] === 'string') {
            return {
              ...field,
              options: (field.options as any).map((opt: string) => ({
                label: opt,
                id: opt
              }))
            };
          }
        }
        return field;
      });
      
      setFields(migratedFields);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      field_name: 'New Field',
      field_type: 'text',
      placeholder: '',
      placement: 'full',
      is_required: false,
      order_index: fields.length + 1,
    };
    setFields([...fields, newField]);
  };

  const handleAddPrefilledField = (prefilledField: typeof prefilledFields[0]) => {
    const newField: FormField = {
      field_id: prefilledField.name,
      field_name: prefilledField.name,
      field_type: prefilledField.type,
      placeholder: `Enter ${prefilledField.name.toLowerCase()}`,
      placement: 'full',
      is_required: false,
      order_index: fields.length + 1,
      options: prefilledField.options,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updatedField: FormField) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    if (draggedIndex === null || dragOverIndex === null) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];

    newFields.splice(draggedIndex, 1);
    newFields.splice(dragOverIndex, 0, draggedField);

    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order_index: index + 1,
    }));

    setFields(reorderedFields);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveForm = async () => {
    setLoading(true);
    setIsLoading(true, formId ? 'Updating form...' : 'Creating new form...');
    try {
      let savedForm: CustomForm;
      if (formId) {
        savedForm = await formService.updateForm(formId, form);
      } else {
        savedForm = await formService.createForm(form);
      }

      for (const field of fields) {
        if (field.id) {
          await formService.updateField(field.id, field);
        } else {
          await formService.createField({ ...field, form_id: savedForm.id });
        }
      }

      if (form.connected_button_id && savedForm.id) {
        await buttonService.connectButtonToForm(form.connected_button_id, savedForm.id);
      }

      onSave?.(savedForm);
      Swal.fire({
        title: 'Success!',
        text: 'Form saved successfully!',
        icon: 'success',
        confirmButtonColor: '#f37021',
      });
    } catch (error) {
      console.error('Failed to save form:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save form',
        icon: 'error',
        confirmButtonColor: '#f37021',
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // Rendered terms message for preview (replace tokens with anchors)
  const getRenderedTermsMessage = () => {
    const rawMsg = (form as any).terms_message || 'I agree to the {terms} and the {privacy}.';
    const termsUrl = (form as any).terms_url || '';
    const privacyUrl = (form as any).privacy_url || '';
    const color = form.cta_button_color || '#1e3a8a';
    const termAnchor = `<a href="${termsUrl || '#'}" target="_blank" rel="noopener noreferrer" style="color:${color};text-decoration:underline;">Terms &amp; Conditions</a>`;
    const privacyAnchor = `<a href="${privacyUrl || '#'}" target="_blank" rel="noopener noreferrer" style="color:${color};text-decoration:underline;">Privacy Policy</a>`;
    return rawMsg.replace(/\{\{?terms\}?\}/gi, termAnchor).replace(/\{\{?privacy\}?\}/gi, privacyAnchor);
  };

  if (loading && formId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Form Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Name (Internal) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.form_name}
              onChange={(e) => setForm({ ...form, form_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              placeholder="e.g., Contact Form"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Title (Display) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.form_title}
              onChange={(e) => setForm({ ...form, form_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              placeholder="e.g., Get in Touch"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Description
            </label>
            <textarea
              value={form.form_description}
              onChange={(e) => setForm({ ...form, form_description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              rows={2}
              placeholder="Optional description shown above the form"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thank You Title
            </label>
            <input
              type="text"
              value={form.thank_you_title}
              onChange={(e) => setForm({ ...form, thank_you_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              placeholder="e.g., Thank You!"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thank You Message
            </label>
            <textarea
              value={form.thank_you_message}
              onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              rows={2}
              placeholder="Message shown to users after they submit the form (e.g., 'We'll be in touch soon.')"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms Message (optional)</label>
            <input
              type="text"
              value={(form as any).terms_message || ''}
              onChange={(e) => setForm({ ...form, terms_message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              placeholder="e.g., I agree to the terms and privacy policy"
            />
            <p className="text-xs text-gray-500 mt-2">Use <strong>{'{terms}'}</strong> and <strong>{'{privacy}'}</strong> to insert the configured links. Example: <em>I agree to the {'{terms}'} and the {'{privacy}'}</em>.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms &amp; Conditions URL</label>
                <input
                  type="text"
                  value={(form as any).terms_url || ''}
                  onChange={(e) => setForm({ ...form, terms_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                  placeholder="https://example.com/terms"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy URL</label>
                <input
                  type="text"
                  value={(form as any).privacy_url || ''}
                  onChange={(e) => setForm({ ...form, privacy_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                  placeholder="https://example.com/privacy"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Country (prefill for 'Country' field)
            </label>
            <select
              value={(form as any).defaultCountryName || ''}
              onChange={(e) => setForm({ ...form, defaultCountryName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
            >
              <option value="">No default</option>
              {COUNTRIES.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTA Button Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.cta_button_text}
              onChange={(e) => setForm({ ...form, cta_button_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              placeholder="e.g., Submit, Send Message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Button Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.cta_button_color}
                onChange={(e) => setForm({ ...form, cta_button_color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={form.cta_button_color}
                onChange={(e) => setForm({ ...form, cta_button_color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                placeholder="#f37021"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-[#f37021] border-gray-300 rounded focus:ring-[#f37021]"
              />
              <span className="text-sm font-medium text-gray-700">Form is Active</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Connect to Chatbot Button</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select which chatbot button should trigger this form. When users click the selected button, this form will be displayed.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Button
            </label>
            {form.connected_button_id ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">
                        {availableButtons.find(btn => btn.id === form.connected_button_id)?.label || 'Unknown Button'}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {availableButtons.find(btn => btn.id === form.connected_button_id)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setForm({ ...form, connected_button_id: undefined })}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowButtonSelector(!showButtonSelector)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#f37021] hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-[#f37021]"
              >
                <LinkIcon className="w-5 h-5" />
                Select Button to Connect
              </button>
            )}
          </div>

          {showButtonSelector && !form.connected_button_id && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Buttons</h4>
              {availableButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => {
                    setForm({ ...form, connected_button_id: button.id });
                    setShowButtonSelector(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#f37021] hover:text-white rounded-lg transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{button.label}</p>
                      <p className="text-sm opacity-75 mt-1">{button.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-white bg-opacity-20 rounded">
                          {button.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs opacity-75">{button.location}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Form Fields</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Add Prefilled Fields:</h4>
          <div className="flex flex-wrap gap-2">
            {prefilledFields.map((prefilledField, index) => (
              <button
                key={index}
                onClick={() => handleAddPrefilledField(prefilledField)}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                + {prefilledField.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <FormFieldEditor
              key={index}
              index={index}
              field={field}
              onUpdate={(updatedField) => handleUpdateField(index, updatedField)}
              onDelete={() => handleDeleteField(index)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
            />
          ))}
          {fields.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No fields added yet. Click "Add Field" or use prefilled fields to get started.
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Form Preview</h3>
          <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.form_title || 'Form Title'}</h2>
            {form.form_description && (
              <p className="text-gray-600 mb-6">{form.form_description}</p>
            )}
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className={`${
                    field.placement === 'full' ? 'col-span-2' : ''
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.field_name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.field_type === 'textarea' ? (
                    <textarea
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  ) : field.field_type === 'select' ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((option, i) => {
                        const optionValue = typeof option === 'string' ? option : option.id;
                        const optionLabel = typeof option === 'string' ? option : option.label;
                        return (
                          <option key={i} value={optionValue}>{optionLabel}</option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type={field.field_type}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Terms checkbox preview (renders admin message with links) */}
            {((form as any).terms_message || (form as any).terms_url || (form as any).privacy_url) && (
              <div className="mt-4">
                <label className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1" />
                  <span className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: getRenderedTermsMessage() }} />
                </label>
              </div>
            )}

            <button
              style={{ backgroundColor: form.cta_button_color }}
              className="w-full mt-6 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              {form.cta_button_text}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSaveForm}
          disabled={loading || !form.form_name || !form.form_title}
          className="px-6 py-3 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Form'}
        </button>
      </div>
    </div>
  );
}
