import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  Globe,
  Mail,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  AlertCircle,
  Shield,
  Clock,
  Download
} from 'lucide-react';
import { Tenant } from '../types/tenant';

interface TenantDetailsPageProps {
  tenantId: string;
  onBack: () => void;
}

interface TenantAnalytics {
  totalSessions: number;
  uniqueCustomers: number;
  totalMessages: number;
  userMessages: number;
  aiMessages: number;
  totalLeads: number;
  formSubmissions: number;
  avgSessionDuration: number;
  conversionRate: number;
  activeUsers: number;
  totalForms: number;
  totalWebhooks: number;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user?: string;
}

export function TenantDetailsPage({ tenantId, onBack }: TenantDetailsPageProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadTenantDetails();
    loadTenantAnalytics();
    loadActivityLogs();
  }, [tenantId, dateRange]);

  const loadTenantDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/tenants?tenantId=${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Find the specific tenant
      const tenantData = data.tenants?.find((t: Tenant) => t.id === tenantId);
      setTenant(tenantData || null);
    } catch (error: any) {
      console.error('Error loading tenant details:', error);
      setError('Failed to load tenant details');
    }
  };

  const loadTenantAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/analytics?days=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAnalytics(data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      // Set default analytics if fetch fails
      setAnalytics({
        totalSessions: 0,
        uniqueCustomers: 0,
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        totalLeads: 0,
        formSubmissions: 0,
        avgSessionDuration: 0,
        conversionRate: 0,
        activeUsers: 0,
        totalForms: 0,
        totalWebhooks: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    // Mock activity logs - replace with actual API call
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'login',
        description: 'Admin user logged in',
        timestamp: new Date().toISOString(),
        user: 'admin@tenant.com'
      },
      {
        id: '2',
        action: 'config_update',
        description: 'Updated chatbot appearance settings',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: 'admin@tenant.com'
      },
      {
        id: '3',
        action: 'form_created',
        description: 'Created new contact form',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: 'admin@tenant.com'
      }
    ];
    setActivityLogs(mockLogs);
  };

  const handleUpdateStatus = async (newStatus: Tenant['status']) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/tenants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId,
          status: newStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      await loadTenantDetails();
    } catch (error) {
      setError('Failed to update tenant status');
    }
  };

  const getStatusBadge = (status: Tenant['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      active: <CheckCircle className="w-4 h-4" />,
      suspended: <XCircle className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Tenant not found</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tenants
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Edit className="w-4 h-4" />
            Edit Tenant
          </button>
        </div>
      </div>

      {/* Tenant Header Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {tenant.subdomain}.chatbot.com
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(tenant.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                {getStatusBadge(tenant.status)}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} Plan
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-900">${tenant.billing.plan_price}</p>
            <p className="text-sm text-gray-500 mt-1">per month</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">Created By</p>
            <p className="font-medium text-gray-900">{tenant.created_by || 'System'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Subdomain</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="font-medium text-gray-900">{tenant.subdomain}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Database</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <p className="font-medium text-gray-900 truncate">{tenant.database_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'activity', label: 'Activity Log', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeSubTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-900">Total Sessions</p>
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{analytics?.totalSessions || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">Last {dateRange} days</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-900">Total Leads</p>
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">{analytics?.totalLeads || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Captured leads</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-900">Messages</p>
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{analytics?.totalMessages || 0}</p>
                  <p className="text-xs text-purple-600 mt-1">{analytics?.userMessages || 0} user / {analytics?.aiMessages || 0} AI</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-yellow-900">Conversion Rate</p>
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{(analytics?.conversionRate || 0).toFixed(1)}%</p>
                  <p className="text-xs text-yellow-600 mt-1">Session to lead</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Usage Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unique Customers</span>
                      <span className="font-semibold text-gray-900">{analytics?.uniqueCustomers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Session Duration</span>
                      <span className="font-semibold text-gray-900">{(analytics?.avgSessionDuration || 0).toFixed(1)} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Form Submissions</span>
                      <span className="font-semibold text-gray-900">{analytics?.formSubmissions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-semibold text-gray-900">{analytics?.activeUsers || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Forms</span>
                      <span className="font-semibold text-gray-900">{analytics?.totalForms || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Webhooks</span>
                      <span className="font-semibold text-gray-900">{analytics?.totalWebhooks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Team Members</span>
                      <span className="font-semibold text-gray-900">{tenant.settings?.max_users || 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage Used</span>
                      <span className="font-semibold text-gray-900">-</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-white border rounded-lg p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Billing Information
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                    <p className="font-semibold text-gray-900">{tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Price</p>
                    <p className="font-semibold text-gray-900">${tenant.billing.plan_price}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                    <p className="font-semibold text-gray-900">Monthly</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next Billing Date</p>
                    <p className="font-semibold text-gray-900">
                      {tenant.billing.next_billing_date 
                        ? new Date(tenant.billing.next_billing_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-6">
              {/* Date Range Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-5 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-2" />
                    <p>Sessions by Source Chart</p>
                    <p className="text-sm">(Coming Soon)</p>
                  </div>
                </div>
                <div className="bg-white border rounded-lg p-5 h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Messages Over Time Chart</p>
                    <p className="text-sm">(Coming Soon)</p>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics */}
              <div className="bg-white border rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-4">Detailed Metrics</h4>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average Response Time</p>
                    <p className="text-xl font-bold text-gray-900">2.3s</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Customer Satisfaction</p>
                    <p className="text-xl font-bold text-gray-900">4.5/5</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Return Rate</p>
                    <p className="text-xl font-bold text-gray-900">45%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeSubTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="bg-white border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{log.description}</p>
                          {log.user && (
                            <p className="text-sm text-gray-600 mt-1">by {log.user}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tenant Management</h3>
              
              {/* Status Management */}
              <div className="bg-white border rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-4">Status Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Status</span>
                    {getStatusBadge(tenant.status)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {tenant.status !== 'active' && (
                      <button
                        onClick={() => handleUpdateStatus('active')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Activate
                      </button>
                    )}
                    {tenant.status !== 'suspended' && (
                      <button
                        onClick={() => handleUpdateStatus('suspended')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Danger Zone
                </h4>
                <p className="text-sm text-red-700 mb-4">
                  Deleting a tenant is permanent and cannot be undone. All data will be lost.
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Tenant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}
    </div>
  );
}

export default TenantDetailsPage;
