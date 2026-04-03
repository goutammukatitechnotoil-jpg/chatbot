import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface AdaptiveCardChoice {
  title: string;
  value: string;
}

interface AdaptiveCardInput {
  type: string;
  id: string;
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  errorMessage?: string;
  style?: string;
  regex?: string;
  isMultiline?: boolean;
  isMultiSelect?: boolean;
  choices?: AdaptiveCardChoice[];
}

interface AdaptiveCardTextBlock {
  type: 'TextBlock';
  text: string;
  size?: string;
  weight?: string;
}

interface AdaptiveCardContainer {
  type: 'Container';
  id?: string;
  items: (AdaptiveCardInput | AdaptiveCardTextBlock)[];
}

interface AdaptiveCardAction {
  type: string;
  title: string;
  data?: any;
  associatedInputs?: string;
}

interface AdaptiveCardContent {
  type: 'AdaptiveCard';
  version: string;
  body: AdaptiveCardContainer[];
  actions: AdaptiveCardAction[];
}

interface AdaptiveCardProps {
  content: AdaptiveCardContent;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
}

export function AdaptiveCard({ content, onSubmit, isLoading = false }: AdaptiveCardProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    content.body.forEach(container => {
      container.items.forEach(item => {
        if (item.type.startsWith('Input.') && 'isRequired' in item && item.isRequired) {
          const value = formData[item.id];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            newErrors[item.id] = item.errorMessage || `${item.label || item.id} is required`;
          } else if (item.type === 'Input.Text' && item.regex) {
            const regex = new RegExp(item.regex);
            if (!regex.test(value)) {
              newErrors[item.id] = item.errorMessage || 'Invalid format';
            }
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (action: AdaptiveCardAction) => {
    if (action.associatedInputs === 'none') {
      // Skip action - no validation needed
      onSubmit({ action: action.data?.action || 'skip', ...action.data });
    } else {
      // Submit action - validate form
      if (validateForm()) {
        onSubmit({ ...formData, ...action.data });
      }
    }
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderInput = (input: AdaptiveCardInput) => {
    switch (input.type) {
      case 'Input.Text':
        return (
          <div key={input.id} className="space-y-2">
            {input.label && (
              <label className="block text-sm font-semibold text-gray-700">
                {input.label}
                {input.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {input.isMultiline ? (
              <textarea
                id={input.id}
                placeholder={input.placeholder}
                value={formData[input.id] || ''}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow resize-none ${
                  errors[input.id] ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
              />
            ) : (
              <input
                type={input.style === 'email' ? 'email' : 'text'}
                id={input.id}
                placeholder={input.placeholder}
                value={formData[input.id] || ''}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow ${
                  errors[input.id] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {errors[input.id] && (
              <p className="text-red-500 text-xs">{errors[input.id]}</p>
            )}
          </div>
        );

      case 'Input.ChoiceSet':
        return (
          <div key={input.id} className="space-y-2">
            {input.label && (
              <label className="block text-sm font-semibold text-gray-700">
                {input.label}
                {input.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown(input.id)}
                className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow ${
                  errors[input.id] ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <span className={formData[input.id] ? 'text-gray-900' : 'text-gray-500'}>
                  {input.choices?.find(c => c.value === formData[input.id])?.title || formData[input.id] || `Select ${input.label?.toLowerCase() || 'option'}...`}
                </span>
                {openDropdowns[input.id] ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {openDropdowns[input.id] && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
                  {input.choices && input.choices.length > 5 && (
                    <div className="p-2 border-b border-gray-200 shrink-0 sticky top-0 bg-white z-20 rounded-t-lg">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        placeholder="Search..."
                        value={searchQueries[input.id] || ''}
                        onChange={(e) => setSearchQueries({...searchQueries, [input.id]: e.target.value})}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className="max-h-56 overflow-y-auto">
                    {input.choices?.filter(choice => 
                      !searchQueries[input.id] || 
                      choice.title.toLowerCase().includes(searchQueries[input.id].toLowerCase()) ||
                      choice.value.toLowerCase().includes(searchQueries[input.id].toLowerCase())
                    ).map((choice) => (
                      <button
                        key={choice.value}
                        type="button"
                        onClick={() => {
                          handleInputChange(input.id, choice.value);
                          toggleDropdown(input.id);
                          setSearchQueries({...searchQueries, [input.id]: ''});
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-orange-50 hover:text-orange-700 transition-colors text-sm"
                      >
                        {choice.title}
                      </button>
                    ))}
                    {input.choices?.filter(choice => 
                      !searchQueries[input.id] || 
                      choice.title.toLowerCase().includes(searchQueries[input.id].toLowerCase()) ||
                      choice.value.toLowerCase().includes(searchQueries[input.id].toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-4 text-sm text-center text-gray-500">No results found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors[input.id] && (
              <p className="text-red-500 text-xs">{errors[input.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderTextBlock = (textBlock: AdaptiveCardTextBlock) => {
    const sizeClass = textBlock.size === 'medium' ? 'text-lg' : 'text-sm';
    const weightClass = textBlock.weight === 'bolder' ? 'font-bold' : 'font-normal';
    
    return (
      <h3 key={Math.random()} className={`${sizeClass} ${weightClass} text-gray-900 mb-4`}>
        {textBlock.text}
      </h3>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 max-w-md">
      {content.body.map((container, containerIndex) => (
        <div key={containerIndex} className="space-y-4">
          {container.items.map((item) => {
            if (item.type === 'TextBlock') {
              return renderTextBlock(item as AdaptiveCardTextBlock);
            } else if (item.type.startsWith('Input.')) {
              return renderInput(item as AdaptiveCardInput);
            }
            return null;
          })}
        </div>
      ))}
      
      {content.actions && content.actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {content.actions.map((action, actionIndex) => {
            const isSubmitAction = action.data?.action !== 'skip';
            const isLoadingThis = isLoading && isSubmitAction;
            
            return (
              <button
                key={actionIndex}
                onClick={() => handleSubmit(action)}
                disabled={isLoadingThis}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  action.data?.action === 'skip'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    : `bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed ${
                        isLoadingThis ? 'from-orange-400 to-orange-500' : ''
                      }`
                }`}
              >
                {isLoadingThis && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isLoadingThis ? 'Submitting...' : action.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
