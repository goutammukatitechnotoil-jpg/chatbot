import { AnalyticsMetrics } from '../types/analytics';

// Safe JSON parsing helper
async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse JSON response:', text);
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error('Received HTML instead of JSON - likely a server error or routing issue');
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
  }
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'last3months'
  | 'thisYear'
  | 'pastYear'
  | 'tillDate'
  | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset: DateRangePreset;
}

export const analyticsService = {
  getDateRange(preset: DateRangePreset, customStart?: Date, customEnd?: Date): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let endDate: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

    switch (preset) {
      case 'today':
        startDate = today;
        break;

      case 'yesterday':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() - 1);
        break;

      case 'last7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;

      case 'last30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;

      case 'last3months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;

      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;

      case 'pastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;

      case 'tillDate':
        startDate = new Date(2020, 0, 1);
        break;

      case 'custom':
        startDate = customStart || today;
        endDate = customEnd || endDate;
        break;

      default:
        startDate = today;
    }

    return { startDate, endDate, preset };
  },

  async getMetrics(dateRange: DateRange): Promise<AnalyticsMetrics> {
    try {
      const start = dateRange.startDate.toISOString();
      const end = dateRange.endDate.toISOString();
      
      const response = await fetch(`/api/analytics?startDate=${start}&endDate=${end}`);
      const result = await safeJsonParse(response);
      return result;
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      return {
        totalSessions: 0,
        uniqueCustomers: 0,
        avgSessionTime: 0,
        totalUserMessages: 0,
        totalAiResponses: 0,
        totalLeads: 0,
        funnel: {
          sessions: 0,
          uniqueCustomers: 0,
          userMessages: 0,
          aiResponses: 0,
          leadsCaptured: 0
        }
      };
    }
  },

  calculateConversionRate(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  },

  calculatePercentage(part: number, whole: number): number {
    if (whole === 0) return 0;
    return Math.round((part / whole) * 100);
  },

  formatDateRange(dateRange: DateRange): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (dateRange.preset === 'today') return 'Today';
    if (dateRange.preset === 'yesterday') return 'Yesterday';

    return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
  },

  async getWordCloudData(dateRange: DateRange, maxWords: number = 50) {
    try {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate.toISOString());
      params.append('endDate', dateRange.endDate.toISOString());
      params.append('maxWords', maxWords.toString());

      const response = await fetch(`/api/analytics/wordcloud?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await safeJsonParse(response);
    } catch (error) {
      console.error('Error fetching word cloud data:', error);
      throw error;
    }
  },
};
