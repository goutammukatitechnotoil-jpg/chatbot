import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import InviteMemberModal from './InviteMemberModal';
import { ROLE_PERMISSIONS } from '../types/team';
import EditMemberModal from './EditMemberModal';
import TeamTable from './TeamTable';
import {
  inviteTeamMember,
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember,
} from '../services/teamService';
import type {
  TeamMember,
  InviteMemberForm,
  UpdateMemberForm,
  TeamMemberFilters,
  TeamRole,
} from '../types/team';

import { useLoading } from '../contexts/LoadingContext';

export default function TeamManagement() {
  const { user } = useTenant();
  const { setIsLoading: setGlobalLoading } = useLoading();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<TeamMemberFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTeamMembers(filters, { page, pageSize });
      setMembers(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading team members:', error);
      showNotification('error', 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async (form: InviteMemberForm) => {
    if (!user?.id) {
      showNotification('error', 'User session not found');
      return;
    }

    setIsSubmitting(true);
    setGlobalLoading(true, 'Inviting team member...');
    try {
      console.log('Inviting member with form data:', form);
      const { error } = await inviteTeamMember(form, user.id);

      if (error) {
        showNotification('error', `Failed to invite member: ${error.message}`);
        return;
      }

      showNotification('success', `Successfully invited ${form.name}`);
      setIsInviteModalOpen(false);
      loadMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (id: string, updates: UpdateMemberForm) => {
    setIsSubmitting(true);
    setGlobalLoading(true, 'Updating member roles...');
    try {
      const { error } = await updateTeamMember(id, updates);

      if (error) {
        showNotification('error', `Failed to update member: ${error.message}`);
        return;
      }

      showNotification('success', 'Member updated successfully');
      setIsEditModalOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setGlobalLoading(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    setGlobalLoading(true, `Removing ${member.name}...`);
    try {
      const { error } = await deleteTeamMember(member.id);

      if (error) {
        showNotification('error', `Failed to delete member: ${error.message}`);
        return;
      }

      showNotification('success', `Successfully removed ${member.name}`);
      loadMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      showNotification('error', 'An unexpected error occurred');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const mapRoleToTeamRole = (role?: string | null): TeamRole => {
    if (!role) return 'viewer';
    if (role === 'owner' || role === 'admin') return 'admin';
    if (role === 'editor') return 'editor';
    return 'viewer';
  };

  const currentUserRole: TeamRole = mapRoleToTeamRole(user?.role as string | undefined);
  const currentPermissions = ROLE_PERMISSIONS[currentUserRole];
  const canInvite = currentPermissions?.canEdit;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage team members and their access permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl font-medium ${
                !canInvite ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canInvite}
              title={!canInvite ? 'You do not have permission to invite members' : 'Invite Member'}
            >
              <UserPlus className="w-5 h-5" />
              Invite Member
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Members</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{total}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {members.filter((m) => m.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400 opacity-50" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Pending</p>
                    <p className="text-3xl font-bold text-yellow-900 mt-1">
                      {members.filter((m) => m.status === 'pending').length}
                    </p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-yellow-400 opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`mb-6 px-6 py-4 rounded-lg border-l-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TeamTable
            members={members}
            total={total}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
            currentUserRole={currentUserRole}
          />
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInvite}
        isLoading={isSubmitting}
        currentUserRole={currentUserRole}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        member={selectedMember}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        onSubmit={handleUpdate}
        isLoading={isSubmitting}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
