import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  Users,
  Building2,
  TrendingUp,
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity,
  Calendar,
  Globe,
  Mail,
  UserPlus
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import TenantDetailsPage from './TenantDetailsPage';
import SuperAdminService, { CreateSuperAdminRequest, UpdateSuperAdminRequest } from '../services/superAdminService';
// Using API calls instead of direct service imports
import { Tenant, CreateTenantRequest, SuperAdmin } from '../types/tenant';

export function SuperAdminDashboard() {
  const { user, logout } = useTenant();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [superAdmins, setSuperAdmins] = useState<Omit<SuperAdmin, 'password_hash'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Omit<SuperAdmin, 'password_hash'> | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTenants, setTotalTenants] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load initial data and reload when filters change
  useEffect(() => {
    if (activeTab === 'tenants') {
      loadTenants();
    } else if (activeTab === 'users') {
      loadSuperAdmins();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchTerm, statusFilter, activeTab, pageSize]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Load stats once on mount
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuperAdmins = async () => {
    try {
      setIsLoading(true);
      const admins = await SuperAdminService.getSuperAdmins();
      setSuperAdmins(admins);
      setError(''); // Clear any previous errors
    } catch (error: any) {
      console.error('Error loading super admins:', error);
      setError('Failed to load super admins');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/admin/tenants?page=${currentPage}&pageSize=${pageSize}&status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      let filteredTenants = data.tenants || [];
      const pagination = data.pagination || { page: currentPage, pageSize, total: filteredTenants.length, totalPages: 1 };
      setTotalTenants(pagination.total || filteredTenants.length);
      setTotalPages(pagination.totalPages || 1);
      
      // Apply search filter (using debounced search term)
      if (debouncedSearchTerm) {
        filteredTenants = filteredTenants.filter((tenant: any) =>
          tenant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          tenant.subdomain.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      setTenants(filteredTenants);
      setError(''); // Clear any previous errors
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/tenants?page=1&pageSize=1000', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.tenants) {
        const allTenants = data.tenants;
        const activeTenants = allTenants.filter((t: any) => t.status === 'active');
        
        setStats({
          totalTenants: allTenants.length,
          activeTenants: activeTenants.length,
          totalUsers: 0, // TODO: Implement user counting
          totalRevenue: activeTenants.reduce((sum: number, t: any) => sum + (t.billing?.plan_price || 0), 0)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateTenant = async (tenantData: CreateTenantRequest) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tenantData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess('Tenant created successfully');
      setShowCreateModal(false);
      loadTenants();
      loadStats();
    } catch (error: any) {
      setError(error.message || 'Failed to create tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuperAdmin = async (adminData: CreateSuperAdminRequest) => {
    try {
      setIsLoading(true);
      setError('');
      await SuperAdminService.createSuperAdmin(adminData);
      setSuccess('Super Admin created successfully');
      setShowCreateAdminModal(false);
      loadSuperAdmins();
    } catch (error: any) {
      setError(error.message || 'Failed to create super admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuperAdmin = async (adminData: UpdateSuperAdminRequest) => {
    try {
      setIsLoading(true);
      setError('');
      await SuperAdminService.updateSuperAdmin(adminData);
      setSuccess('Super Admin updated successfully');
      setShowEditAdminModal(false);
      setSelectedAdmin(null);
      loadSuperAdmins();
    } catch (error: any) {
      setError(error.message || 'Failed to update super admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (superAdmins.length === 1) {
      setError('Cannot delete the last super admin');
      return;
    }

    Swal.fire({
      title: 'Delete Super Admin?',
      text: 'Are you sure you want to delete this super admin? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f37021',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          setError('');
          await SuperAdminService.deleteSuperAdmin(adminId);
          Swal.fire({
            title: 'Deleted!',
            text: 'Super Admin has been deleted.',
            icon: 'success',
            confirmButtonColor: '#f37021',
          });
          loadSuperAdmins();
        } catch (error: any) {
          setError(error.message || 'Failed to delete super admin');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleEditTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowEditTenantModal(true);
  };

  const handleUpdateTenant = async (updateData: Partial<Tenant>) => {
    if (!selectedTenant) return;

    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/admin/tenants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId: selectedTenant.id,
          ...updateData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess('Tenant updated successfully');
      setShowEditTenantModal(false);
      setSelectedTenant(null);
      loadTenants();
      loadStats();
    } catch (error: any) {
      setError(error.message || 'Failed to update tenant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    Swal.fire({
      title: 'Delete Tenant?',
      text: 'Are you sure you want to delete this tenant? This will mark it as cancelled. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f37021',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true);
          setError('');
          const token = localStorage.getItem('authToken');

          const response = await fetch(`/api/admin/tenants?tenantId=${tenantId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error);
          }

          Swal.fire({
            title: 'Deleted!',
            text: 'Tenant has been marked as cancelled.',
            icon: 'success',
            confirmButtonColor: '#f37021',
          });
          loadTenants();
          loadStats();
        } catch (error: any) {
          setError(error.message || 'Failed to delete tenant');
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Pagination helpers
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10) || 10;
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Tenant['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPlanBadge = (plan: Tenant['plan']) => {
    const styles = {
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-gold-100 text-gold-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[plan] || 'bg-gray-100 text-gray-800'}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Tenant Details if selected */}
      {selectedTenantId ? (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                    <p className="text-sm text-gray-600">Tenant Details</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <TenantDetailsPage
              tenantId={selectedTenantId}
              onBack={() => setSelectedTenantId(null)}
            />
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <Shield className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'tenants', label: 'Tenants', icon: Building2 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'settings', label: 'Settings', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
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
      </div>

      {/* Messages */}
      {success && (
        <div className="mx-6 mt-4 flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Tenants', icon: Building2, value: stats.totalTenants, color: 'text-blue-600' },
                { label: 'Active Tenants', icon: Activity, value: stats.activeTenants, color: 'text-green-600' },
                { label: 'Total Users', icon: Users, value: stats.totalUsers, color: 'text-purple-600' },
                { label: 'Monthly Revenue', icon: DollarSign, value: `$${stats.totalRevenue}`, color: 'text-yellow-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    {isLoading ? (
                      <div className="flex-1 animate-pulse">
                        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                        <div className="h-8 w-16 bg-gray-200 rounded" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    )}
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-6 h-6 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-blue-900">Create Tenant</p>
                    <p className="text-sm text-blue-600">Add a new company</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('tenants')}
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Building2 className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-900">Manage Tenants</p>
                    <p className="text-sm text-green-600">View all companies</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Users className="w-6 h-6 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium text-purple-900">Manage Users</p>
                    <p className="text-sm text-purple-600">User administration</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Tenant Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create Tenant
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-5 w-20 bg-gray-200 rounded ml-auto" /></td>
                    </tr>
                  ))}

                  {!isLoading && tenants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No tenants found
                      </td>
                    </tr>
                  )}

                  {!isLoading && tenants.length > 0 && tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {tenant.subdomain}.chatbot.com
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPlanBadge(tenant.plan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tenant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${tenant.billing.plan_price}/month
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedTenantId(tenant.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditTenant(tenant)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTenant(tenant.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalTenants || 0)}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, totalTenants || 0)}</span> of <span className="font-medium">{totalTenants}</span>
              </div>

              <div className="flex items-center gap-3">
                <select value={pageSize} onChange={handlePageSizeChange} className="px-2 py-1 border rounded-md text-sm">
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <div className="flex items-center gap-2">
                  <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded-md text-sm disabled:opacity-50">Prev</button>
                  <span className="text-sm text-gray-700">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span></span>
                  <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border rounded-md text-sm disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab - Super Admin Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Super Admin Management</h2>
              <button
                onClick={() => setShowCreateAdminModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                <UserPlus className="w-4 h-4" />
                Add Super Admin
              </button>
            </div>

            {/* Super Admins Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading && [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-40 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-5 w-20 bg-gray-200 rounded ml-auto" /></td>
                    </tr>
                  ))}

                  {!isLoading && superAdmins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No super admins found
                      </td>
                    </tr>
                  )}

                  {!isLoading && superAdmins.length > 0 && superAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Support'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {admin.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(admin.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowEditAdminModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            disabled={superAdmins.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
            <p className="text-gray-600 mt-2">System settings functionality coming soon...</p>
          </div>
        )}
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTenant}
        />
      )}

      {/* Create Super Admin Modal */}
      {showCreateAdminModal && (
        <CreateSuperAdminModal
          onClose={() => setShowCreateAdminModal(false)}
          onCreate={handleCreateSuperAdmin}
        />
      )}

      {/* Edit Super Admin Modal */}
      {showEditAdminModal && selectedAdmin && (
        <EditSuperAdminModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditAdminModal(false);
            setSelectedAdmin(null);
          }}
          onUpdate={handleUpdateSuperAdmin}
        />
      )}

      {/* Edit Tenant Modal */}
      {showEditTenantModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => {
            setShowEditTenantModal(false);
            setSelectedTenant(null);
          }}
          onUpdate={handleUpdateTenant}
        />
      )}
        </>
      )}
    </div>
  );
}

// Create Tenant Modal Component
function CreateTenantModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (data: CreateTenantRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateTenantRequest>({
    name: '',
    subdomain: '',
    plan: 'starter',
    owner_name: '',
    owner_email: '',
    owner_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onCreate(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Tenant</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <input
              type="text"
              required
              value={formData.subdomain}
              onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="starter">Starter ($29/month)</option>
              <option value="professional">Professional ($99/month)</option>
              <option value="enterprise">Enterprise ($299/month)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input
              type="text"
              required
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
            <input
              type="email"
              required
              value={formData.owner_email}
              onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Password</label>
            <input
              type="password"
              required
              value={formData.owner_password}
              onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Super Admin Modal Component
function CreateSuperAdminModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (data: CreateSuperAdminRequest) => void;
}) {
  const [formData, setFormData] = useState<CreateSuperAdminRequest>({
    name: '',
    email: '',
    password: '',
    role: 'super_admin'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await onCreate(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to create super admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Add Super Admin</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'super_admin' | 'support' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="support">Support (Limited Access)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Super Admin Modal Component
function EditSuperAdminModal({
  admin,
  onClose,
  onUpdate
}: {
  admin: Omit<SuperAdmin, 'password_hash'>;
  onClose: () => void;
  onUpdate: (data: UpdateSuperAdminRequest) => void;
}) {
  const [formData, setFormData] = useState<UpdateSuperAdminRequest>({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Only send password if it's been changed
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await onUpdate(updateData);
    } catch (err: any) {
      setError(err.message || 'Failed to update super admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Edit className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Edit Super Admin</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-gray-500 text-xs">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'super_admin' | 'support' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="support">Support (Limited Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300"
            >
              {isLoading ? 'Updating...' : 'Update Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Tenant Modal Component
function EditTenantModal({
  tenant,
  onClose,
  onUpdate
}: {
  tenant: Tenant;
  onClose: () => void;
  onUpdate: (data: Partial<Tenant>) => void;
}) {
  const [formData, setFormData] = useState({
    name: tenant.name,
    plan: tenant.plan,
    status: tenant.status,
    subdomain: tenant.subdomain,
    domain: tenant.domain || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // Only send changed fields
      const updates: Partial<Tenant> = {};
      if (formData.name !== tenant.name) updates.name = formData.name;
      if (formData.plan !== tenant.plan) updates.plan = formData.plan;
      if (formData.status !== tenant.status) updates.status = formData.status;
      if (formData.subdomain !== tenant.subdomain) updates.subdomain = formData.subdomain;
      if (formData.domain !== (tenant.domain || '')) updates.domain = formData.domain;
      
      await onUpdate(updates);
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Edit Tenant</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">.chatbot.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Warning: Changing the subdomain may affect existing users</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain (Optional)</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as Tenant['plan'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="starter">Starter ($29/month)</option>
              <option value="professional">Professional ($99/month)</option>
              <option value="enterprise">Enterprise ($299/month)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Tenant['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Current Plan: {tenant.plan}</p>
                <p className="text-xs mt-1">Created: {new Date(tenant.created_at).toLocaleDateString()}</p>
                <p className="text-xs">ID: {tenant.id}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                'Update Tenant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
