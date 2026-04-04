import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Calendar,
  MessageSquare,
  User,
  Mail,
  Building2,
  Phone,
  Briefcase,
  MapPin,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Wifi,
  Clock,
  Network,
} from 'lucide-react';
import { LeadInteraction } from '../types/leads';
import { leadService } from '../services/leadService';

// Helper functions to handle multiple field name variations
const getFieldValue = (formData: any, ...fieldNames: string[]) => {
  for (const fieldName of fieldNames) {
    if (formData?.[fieldName]) {
      return formData[fieldName];
    }
  }
  return '';
};

const hasAnyField = (formData: any, ...fieldNames: string[]) => {
  console.log('Checking fields:', fieldNames, 'in formData:', formData);
  return fieldNames.some(fieldName => formData?.[fieldName]);
};

import { useLoading } from '../contexts/LoadingContext';

export function LeadList({ canView }: { canView?: boolean }) {
  const { setIsLoading: setGlobalLoading } = useLoading();
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">You do not have permission to view leads.</div>
      </div>
    );
  }
  const [leads, setLeads] = useState<LeadInteraction[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadInteraction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadInteraction | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, leads]);

  const loadLeads = async () => {
    setLoading(true);
    setGlobalLoading(true, 'Refreshing leads...');
    try {
      console.log('[LeadList] Loading leads...', new Date().toISOString());
      const data = await leadService.getLeads();
      console.log('[LeadList] Loaded', data.length, 'leads');
      
      // Force a new array reference to trigger React re-render
      const freshData = [...data];
      setLeads(freshData);
      
      // If no search query, also update filtered leads immediately
      if (!searchQuery.trim()) {
        setFilteredLeads(freshData);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const filterLeads = () => {
    if (!searchQuery.trim()) {
      setFilteredLeads(leads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = leads.filter(
      (lead) =>
        lead.session_id.toLowerCase().includes(query) ||
        getFieldValue(lead.form_data, 'name', 'Name', 'fullName')?.toLowerCase().includes(query) ||
        getFieldValue(lead.form_data, 'email', 'Email', 'emailAddress')?.toLowerCase().includes(query) ||
        getFieldValue(lead.form_data, 'company', 'Company', 'companyName')?.toLowerCase().includes(query) ||
        getFieldValue(lead.form_data, 'phone', 'Phone', 'phoneNumber')?.toLowerCase().includes(query) ||
        getFieldValue(lead.form_data, 'job_title', 'jobtitle', 'jobTitle', 'Job Title', 'position')?.toLowerCase().includes(query)
    );
    setFilteredLeads(filtered);
  };

  const handleExport = async () => {
    setGlobalLoading(true, 'Preparing CSV export...');
    try {
      const csv = await leadService.exportLeads();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export leads:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  // Pagination calculations
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const toggleRowExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedRows(newExpanded);
  };

  const openChatHistory = (lead: LeadInteraction) => {
    setSelectedLead(lead);
    setShowChatModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-gray-100 mx-6" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by session ID, name, email, company..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadLeads}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh lead list"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#f37021] text-white px-4 py-2.5 rounded-lg hover:bg-[#d85a0a] transition-colors font-medium shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLeads.map((lead) => {
                const isExpanded = expandedRows.has(lead.session_id);
                return (
                  <>
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{lead.session_id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {hasAnyField(lead.form_data, 'name', 'Name', 'fullName') ? (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {getFieldValue(lead.form_data, 'name', 'Name', 'fullName')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              Chat Only
                            </div>
                          )}
                          {hasAnyField(lead.form_data, 'email', 'Email', 'emailAddress') && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {getFieldValue(lead.form_data, 'email', 'Email', 'emailAddress')}
                            </div>
                          )}
                          {hasAnyField(lead.form_data, 'phone', 'Phone', 'phoneNumber') && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {getFieldValue(lead.form_data, 'phone', 'Phone', 'phoneNumber')}
                            </div>
                          )}
                          {hasAnyField(lead.form_data, 'job_title', 'jobtitle', 'jobTitle', 'Job Title', 'position') && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                              {getFieldValue(lead.form_data, 'job_title', 'jobtitle', 'jobTitle', 'Job Title', 'position')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasAnyField(lead.form_data, 'company', 'Company Name','Company') && (
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {getFieldValue(lead.form_data, 'company', 'Company Name','Company')}
                          </div>
                        )}
                         {hasAnyField(lead.form_data, 'country', 'Country') && (

                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {getFieldValue(lead.form_data, 'country', 'Country')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const isChatOnly = (lead.form_data?.Purpose === 'Chat Only' ||
                                              lead.form_data?.purpose === 'Chat Only' || 
                                             lead.form_data?.Purpose === 'Chat Session') && 
                                             lead.form_data?.name === 'Anonymous User' &&
                                             !lead.form_data?.email && 
                                             !lead.form_data?.phone &&
                                             !lead.form_data?.company;
                          
                          if (isChatOnly) {
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Chat Only
                              </span>
                            );
                          } else if (lead.form_data?.Purpose) {
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {lead.form_data.Purpose}
                              </span>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Form Submission
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openChatHistory(lead)}
                            className="p-2 text-[#f37021] hover:bg-orange-50 rounded-lg transition-colors"
                            title="View Chat History"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleRowExpansion(lead.session_id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          {/* Session Information Section */}
                          {lead.session_info && (
                            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Session Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                {/* Device Type */}
                                <div className="flex items-center gap-2">
                                  {lead.session_info.device_type === 'Desktop' && <Monitor className="w-4 h-4 text-blue-500" />}
                                  {lead.session_info.device_type === 'Mobile' && <Smartphone className="w-4 h-4 text-green-500" />}
                                  {lead.session_info.device_type === 'Tablet' && <Tablet className="w-4 h-4 text-purple-500" />}
                                  {lead.session_info.device_type === 'Unknown' && <Monitor className="w-4 h-4 text-gray-500" />}
                                  <span className="text-gray-600">Device:</span>
                                  <span className="font-medium">{lead.session_info.device_type}</span>
                                </div>

                                {/* Operating System */}
                                <div className="flex items-center gap-2">
                                  <Monitor className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">OS:</span>
                                  <span className="font-medium">{lead.session_info.operating_system}</span>
                                </div>

                                {/* Browser */}
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">Browser:</span>
                                  <span className="font-medium">{lead.session_info.browser_type} {lead.session_info.browser_version}</span>
                                </div>

                                {/* IP Address */}
                                <div className="flex items-center gap-2">
                                  <Network className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">IP:</span>
                                  <span className="font-medium font-mono text-sm">{lead.session_info.ip_address}</span>
                                </div>

                                {/* Network Type */}
                                <div className="flex items-center gap-2">
                                  {lead.session_info.network_type === 'Wi-Fi' ? (
                                    <Wifi className="w-4 h-4 text-blue-500" />
                                  ) : lead.session_info.network_type === 'Mobile Data' ? (
                                    <Smartphone className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Network className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className="text-gray-600">Network:</span>
                                  <span className="font-medium">{lead.session_info.network_type}</span>
                                </div>

                                {/* Country */}
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-red-500" />
                                  <span className="text-gray-600">Country:</span>
                                  <span className="font-medium">{lead.session_info.country}</span>
                                </div>

                                {/* Timezone */}
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  <span className="text-gray-600">Timezone:</span>
                                  <span className="font-medium">{lead.session_info.timezone}</span>
                                </div>

                                {/* Screen Resolution */}
                                {lead.session_info.screen_resolution && (
                                  <div className="flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Screen:</span>
                                    <span className="font-medium">{lead.session_info.screen_resolution}</span>
                                  </div>
                                )}

                                {/* Session Captured Time */}
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-600">Captured:</span>
                                  <span className="font-medium">{new Date(lead.session_info.captured_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hasAnyField(lead.form_data, 'job_title', 'jobtitle', 'jobTitle', 'Job Title', 'position') && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Job Title:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {getFieldValue(lead.form_data, 'job_title', 'jobtitle', 'jobTitle', 'Job Title', 'position')}
                                </span>
                              </div>
                            )}
                            {lead.form_data?.details && (
                              <div className="flex items-start gap-2 md:col-span-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <span className="text-sm text-gray-600">Details: </span>
                                  <span className="text-sm text-gray-900">{lead.form_data.details}</span>
                                </div>
                              </div>
                            )}
                            {lead.chat_history && lead.chat_history.length > 0 && (
                              <div className="flex items-start gap-2 md:col-span-2">
                                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm text-gray-600 font-medium mb-2 block">Conversation:</span>
                                  <div className="space-y-2 bg-white rounded-lg p-3 border border-gray-200">
                                    {lead.chat_history.map((message, index) => (
                                      <div key={message.id} className="text-sm">
                                        <span className={`font-semibold ${message.sender === 'user' ? 'text-[#f37021]' : 'text-gray-700'}`}>
                                          {message.sender === 'user' ? 'User' : 'Bot'}:
                                        </span>
                                        <span className="text-gray-900 ml-2">{message.message}</span>
                                        
                                        {/* Display sources if they exist */}
                                        {message.sources && message.sources.length > 0 && (
                                          <div className="mt-2 ml-6">
                                            <div className="text-xs text-gray-500 font-medium mb-1">Sources:</div>
                                            <div className="space-y-1">
                                              {message.sources.map((source: any, sourceIndex: number) => (
                                                <div key={sourceIndex} className="text-xs text-blue-600">
                                                  {source.url ? (
                                                    <a 
                                                      href={source.url} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer"
                                                      className="hover:underline"
                                                    >
                                                      {source.title}
                                                    </a>
                                                  ) : (
                                                    <span>{source.title}</span>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {index < lead.chat_history.length - 1 && <div className="border-t border-gray-100 my-2" />}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No leads found matching your search' : 'No leads yet'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f37021] focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show page numbers with ellipsis logic
                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-[#f37021] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else {
                  // Show ellipsis for large page counts
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-[#f37021] text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              })}
            </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {showChatModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chat History</h3>
                <p className="text-sm text-gray-500 mt-1">Session: {selectedLead.session_id}</p>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedLead.chat_history && selectedLead.chat_history.length > 0 ? (
                selectedLead.chat_history.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.sender === 'user'
                          ? 'bg-[#f37021] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-75">
                          {message.sender === 'user' ? 'User' : 'Bot'}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      
                      {/* Display sources in modal */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200 border-opacity-50">
                          <div className="text-xs font-medium opacity-75 mb-2">Sources:</div>
                          <div className="space-y-1">
                            {message.sources.map((source, sourceIndex) => (
                              <div key={sourceIndex} className="text-xs">
                                {source.url ? (
                                  <a 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`hover:underline ${
                                      message.sender === 'user' 
                                        ? 'text-orange-100 hover:text-white' 
                                        : 'text-blue-600 hover:text-blue-800'
                                    }`}
                                  >
                                    {source.title}
                                  </a>
                                ) : (
                                  <span className="opacity-90">{source.title}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No conversation history available</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{selectedLead.chat_history?.length || 0} messages</span>
                <span>
                  {new Date(selectedLead.created_at).toLocaleString()} -{' '}
                  {new Date(selectedLead.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
