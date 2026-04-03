import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import type { TeamMember, TeamRole, TeamMemberStatus } from '../types/team';
import { ROLE_PERMISSIONS } from '../types/team';

interface TeamTableProps {
  members: TeamMember[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  currentUserRole: TeamRole;
}

export default function TeamTable({
  members,
  total,
  page,
  pageSize,
  totalPages,
  onEdit,
  onDelete,
  onSearch,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  currentUserRole,
}: TeamTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleDelete = (member: TeamMember) => {
    if (deleteConfirm === member.id) {
      onDelete(member);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(member.id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getStatusBadge = (status: TeamMemberStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: TeamRole) => {
    const styles = {
      viewer: 'bg-blue-100 text-blue-700',
      editor: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {ROLE_PERMISSIONS[role].label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentPermissions = ROLE_PERMISSIONS[currentUserRole];
  const canEdit = currentPermissions?.canEdit;
  const canDelete = currentPermissions?.canDelete;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 border-b border-gray-100 mx-6" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No team members found</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(member)}
                            disabled={!canEdit}
                            className={`text-blue-600 p-2 rounded-lg transition-colors ${
                              canEdit ? 'hover:text-blue-800 hover:bg-blue-50' : 'opacity-50 cursor-not-allowed'
                            }`}
                            title={canEdit ? 'Edit member' : 'No permission to edit'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            disabled={!canDelete}
                            className={`p-2 rounded-lg transition-all ${
                              !canDelete
                                ? 'opacity-50 cursor-not-allowed text-gray-400'
                                : deleteConfirm === member.id
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            }`}
                            title={!canDelete ? 'No permission to delete' : deleteConfirm === member.id ? 'Click again to confirm' : 'Delete member'}
                          >
                            {deleteConfirm === member.id && canDelete ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
