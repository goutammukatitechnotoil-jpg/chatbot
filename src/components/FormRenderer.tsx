import { useState } from 'react';
import { Send, X, Loader2, CheckCircle } from 'lucide-react';
import { CustomForm, FormField } from '../types/forms';

interface FormRendererProps {
  form: CustomForm;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function FormRenderer({ form, fields, onSubmit, onClose, isLoading = false, isSuccess = false }: FormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.is_required && !formData[field.field_name]) {
        newErrors[field.field_name] = `${field.field_name} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.field_name];

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{field.placeholder || `Select ${field.field_name}`}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(formData[field.field_name] || []).includes(option)}
                  onChange={(e) => {
                    const current = formData[field.field_name] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    handleFieldChange(field.field_name, updated);
                  }}
                  className="w-4 h-4 text-[#f37021] border-gray-300 rounded focus:ring-[#f37021]"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.field_name}
                  checked={formData[field.field_name] === option}
                  onChange={() => handleFieldChange(field.field_name, option)}
                  className="w-4 h-4 text-[#f37021] border-gray-300 focus:ring-[#f37021]"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.field_type}
            value={formData[field.field_name] || ''}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  const leftFields = fields.filter(f => f.placement === 'left');
  const rightFields = fields.filter(f => f.placement === 'right');
  const fullFields = fields.filter(f => f.placement === 'full');

  // Show success confirmation screen
  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Your form has been submitted successfully. We'll get back to you as soon as possible.
          </p>
          <button
            onClick={onClose}
            style={{ backgroundColor: form.cta_button_color || '#f37021' }}
            className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{form.form_title}</h2>
          {form.form_description && (
            <p className="text-gray-600 mt-2">{form.form_description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fullFields.map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.field_name}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.field_name] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.field_name]}</p>
            )}
          </div>
        ))}

        {(leftFields.length > 0 || rightFields.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {leftFields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.field_name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.field_name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.field_name]}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {rightFields.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.field_name}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.field_name] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field.field_name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{ backgroundColor: form.cta_button_color }}
          className="w-full px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isLoading ? 'Submitting...' : form.cta_button_text}
        </button>
      </form>
    </div>
  );
}
