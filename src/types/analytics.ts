export interface FunnelMetrics {
  sessions: number;
  uniqueCustomers: number;
  userMessages: number;
  aiResponses: number;
  leadsCaptured: number;
}

export interface AnalyticsMetrics {
  totalSessions: number;
  uniqueCustomers: number;
  avgSessionTime: number;
  totalUserMessages: number;
  totalAiResponses: number;
  totalLeads: number;
  funnel: FunnelMetrics;
}

export interface FunnelStage {
  name: string;
  value: number;
  description: string;
  percentage?: number;
  color: string;
}
