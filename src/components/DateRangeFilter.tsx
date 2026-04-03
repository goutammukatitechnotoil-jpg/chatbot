import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { DateRangePreset, DateRange, analyticsService } from '../services/analyticsService';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

interface PresetOption {
  value: DateRangePreset;
  label: string;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const presets: PresetOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'pastYear', label: 'Past Year' },
    { value: 'tillDate', label: 'Till Date' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomCalendar(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelect = (preset: DateRangePreset) => {
    const dateRange = analyticsService.getDateRange(preset);
    onChange(dateRange);
    setIsOpen(false);
    setShowCustomCalendar(false);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);

      if (startDate <= endDate) {
        const dateRange = analyticsService.getDateRange('custom', startDate, endDate);
        onChange(dateRange);
        setIsOpen(false);
        setShowCustomCalendar(false);
      }
    }
  };

  const displayValue = analyticsService.formatDateRange(value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg hover:border-[#f37021] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
      >
        <Calendar className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">{displayValue}</span>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {!showCustomCalendar ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Quick Select
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetSelect(preset.value)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                    value.preset === preset.value ? 'bg-[#f37021]/5 text-[#f37021] font-medium' : 'text-gray-700'
                  }`}
                >
                  {preset.label}
                  {value.preset === preset.value && (
                    <span className="float-right">✓</span>
                  )}
                </button>
              ))}

              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={() => setShowCustomCalendar(true)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Custom Range
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Custom Date Range</h3>
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowCustomCalendar(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomDateApply}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 px-4 py-2 bg-[#f37021] text-white rounded-lg hover:bg-[#d85a0a] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
