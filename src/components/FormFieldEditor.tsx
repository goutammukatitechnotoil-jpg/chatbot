import { useState, useEffect } from 'react';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { FormField, FieldType, FieldPlacement, SelectOption } from '../types/forms';
import { COUNTRIES } from '../constants/countries';

interface FormFieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  isDragging: boolean;
}

export function FormFieldEditor({
  field,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: FormFieldEditorProps) {
  const [options, setOptions] = useState<(string | SelectOption)[]>(field.options || []);
  const [newOption, setNewOption] = useState('');
  const [newOptionId, setNewOptionId] = useState('');

  const useStructuredOptions = field.field_type === 'select';

  useEffect(() => {
    if (field.field_name.toLowerCase() === 'country' && field.field_type !== 'select') {
      onUpdate({ ...field, field_type: 'select', options: COUNTRIES });
      setOptions(COUNTRIES);
    }
  }, [field.field_name]);

  const fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio' },
  ];

  const placements: { value: FieldPlacement; label: string }[] = [
    { value: 'left', label: 'Left Half' },
    { value: 'right', label: 'Right Half' },
    { value: 'full', label: 'Full Width' },
  ];

  const handleAddOption = () => {
    if (newOption.trim()) {
      let newEntry: string | SelectOption;
      if (useStructuredOptions) {
        if (!newOptionId.trim()) {
          Swal.fire({
            title: 'Missing Information',
            text: 'Please provide both label and ID',
            icon: 'warning',
            confirmButtonColor: '#f37021',
          });
          return;
        }
        newEntry = { label: newOption.trim(), id: newOptionId.trim() };
      } else {
        newEntry = newOption.trim();
      }
      const updatedOptions = [...options, newEntry];
      setOptions(updatedOptions);
      onUpdate({ ...field, options: updatedOptions });
      setNewOption('');
      setNewOptionId('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    onUpdate({ ...field, options: updatedOptions });
  };

  const needsOptions = ['select', 'checkbox', 'radio'].includes(field.field_type);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={onDrop}
      className={`bg-white border-2 rounded-lg p-4 transition-all ${
        isDragging
          ? 'border-[#f37021] opacity-50 scale-95'
          : 'border-gray-200 hover:border-[#f37021]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="cursor-move mt-2" onMouseDown={(e) => e.stopPropagation()}>
          <GripVertical className="w-5 h-5 text-gray-400 hover:text-[#f37021]" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={field.field_name}
                onChange={(e) => onUpdate({ ...field, field_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                placeholder="e.g., Full Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type <span className="text-red-500">*</span>
              </label>
              <select
                value={field.field_type}
                onChange={(e) => onUpdate({ ...field, field_type: e.target.value as FieldType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                placeholder="Enter placeholder text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placement
              </label>
              <select
                value={field.placement}
                onChange={(e) => onUpdate({ ...field, placement: e.target.value as FieldPlacement })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
              >
                {placements.map((placement) => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options {useStructuredOptions && <span className="text-xs text-gray-500">(ID & Label)</span>}
                  </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {useStructuredOptions && typeof option === 'object' && 'label' in option ? (
                      <>
                        <input
                          type="text"
                          value={option.id}
                          onChange={(e) => {
                            const updatedOptions = [...options];
                            updatedOptions[index] = { ...(option as SelectOption), id: e.target.value };
                            setOptions(updatedOptions);
                            onUpdate({ ...field, options: updatedOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                          placeholder="ID"
                        />
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => {
                            const updatedOptions = [...options];
                            updatedOptions[index] = { ...(option as SelectOption), label: e.target.value };
                            setOptions(updatedOptions);
                            onUpdate({ ...field, options: updatedOptions });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                          placeholder="Label"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={typeof option === 'string' ? option : option.label}
                        onChange={(e) => {
                          const updatedOptions = [...options];
                          updatedOptions[index] = e.target.value;
                          setOptions(updatedOptions);
                          onUpdate({ ...field, options: updatedOptions });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  {useStructuredOptions ? (
                    <>
                      <input
                        type="text"
                        value={newOptionId}
                        onChange={(e) => setNewOptionId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && newOptionId && newOption && handleAddOption()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                        placeholder="ID"
                      />
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && newOptionId && newOption && handleAddOption()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                        placeholder="Label"
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
                      placeholder="Add new option"
                    />
                  )}
                  <button
                    onClick={handleAddOption}
                    className="px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.is_required}
                onChange={(e) => onUpdate({ ...field, is_required: e.target.checked })}
                className="w-4 h-4 text-[#f37021] border-gray-300 rounded focus:ring-[#f37021]"
              />
              <span className="text-sm font-medium text-gray-700">Required Field</span>
            </label>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
