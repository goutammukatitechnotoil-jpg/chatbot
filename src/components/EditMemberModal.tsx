import React, { useState, useEffect } from 'react';
import { X, UserCog, Info } from 'lucide-react';
import type { TeamMember, UpdateMemberForm, TeamRole, TeamMemberStatus } from '../types/team';
import { ROLE_PERMISSIONS } from '../types/team';

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSubmit: (id: string, form: UpdateMemberForm) => Promise<void>;
  isLoading?: boolean;
  currentUserRole?: TeamRole;
}

export default function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSubmit,
  isLoading = false,
  currentUserRole,
}: EditMemberModalProps) {
  const [form, setForm] = useState<UpdateMemberForm>({
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateMemberForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const canEdit = currentUserRole ? ROLE_PERMISSIONS[currentUserRole]?.canEdit : true;

  useEffect(() => {
    if (member && isOpen) {
      setForm({
        name: member.name,
        email: member.email,
        role: member.role,
        status: member.status,
        password: '',
      });
      setChangePassword(false);
      setShowPassword(false);
    }
  }, [member, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateMemberForm, string>> = {};

    if (!form.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (changePassword && form.password) {
      if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member || !validateForm()) {
      return;
    }

    const updates: UpdateMemberForm = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    };

    if (changePassword && form.password) {
      updates.password = form.password;
    }

    await onSubmit(member.id, updates);
    handleClose();
  };

  const handleClose = () => {
    setForm({
      name: '',
      email: '',
      role: 'viewer',
      status: 'active',
      password: '',
    });
    setErrors({});
    setShowPassword(false);
    setChangePassword(false);
    onClose();
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Team Member</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!canEdit && (
            <div className="rounded-md bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-700">
              You don't have permission to modify team members.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
              disabled={isLoading || !canEdit}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
              disabled={isLoading || !canEdit}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading || !canEdit}
              />
              <span className="text-sm font-medium text-gray-700">Change Password</span>
            </label>

            {changePassword && (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password"
                  disabled={isLoading || !canEdit}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as TeamMemberStatus })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || !canEdit}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {(Object.keys(ROLE_PERMISSIONS) as TeamRole[]).map((role) => {
                const roleInfo = ROLE_PERMISSIONS[role];
                return (
                  <label
                    key={role}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      form.role === role
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as TeamRole })}
                      className="mt-1"
                      disabled={isLoading || !canEdit}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{roleInfo.label}</span>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-gray-400" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2 z-10">
                            {roleInfo.description}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{roleInfo.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !canEdit}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
