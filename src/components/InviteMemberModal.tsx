import React, { useState } from 'react';
import { X, UserPlus, Info } from 'lucide-react';
import type { InviteMemberForm, TeamRole } from '../types/team';
import { ROLE_PERMISSIONS } from '../types/team';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: InviteMemberForm) => Promise<void>;
  isLoading?: boolean;
  currentUserRole?: TeamRole;
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  currentUserRole,
}: InviteMemberModalProps) {
  const [form, setForm] = useState<InviteMemberForm>({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InviteMemberForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const canInvite = currentUserRole ? ROLE_PERMISSIONS[currentUserRole]?.canEdit : true;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InviteMemberForm, string>> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    if (!canInvite) {
      return;
    }
    console.log('Submitting invite member form:', form);

    await onSubmit(form);
    handleClose();
  };

  const handleClose = () => {
    setForm({
      name: '',
      email: '',
      role: 'viewer',
      password: '',
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Team Member</h2>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter default password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              User will be able to change this password after first login
            </p>
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
                      disabled={isLoading || !canInvite}
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
                      <div className="mt-2 flex flex-wrap gap-2">
                        {roleInfo.canView && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            View
                          </span>
                        )}
                        {roleInfo.canEdit && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            Edit
                          </span>
                        )}
                        {roleInfo.canDelete && (
                          <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                            Delete
                          </span>
                        )}
                        {roleInfo.canAccessSettings && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            Settings
                          </span>
                        )}
                      </div>
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
              disabled={isLoading || !canInvite}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !canInvite}
            >
              {isLoading ? 'Inviting...' : 'Invite Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
