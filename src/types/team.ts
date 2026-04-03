export type TeamRole = 'viewer' | 'editor' | 'admin';
export type TeamMemberStatus = 'active' | 'inactive' | 'pending';

export interface CloudinaryConfig {
  url?: string;
  cloud_name?: string;
  api_key?: string;
  api_secret?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  cloudinary?: CloudinaryConfig;
}

export interface InviteMemberForm {
  name: string;
  email: string;
  role: TeamRole;
  password: string;
}

export interface UpdateMemberForm {
  name?: string;
  email?: string;
  role?: TeamRole;
  status?: TeamMemberStatus;
  password?: string;
}

export interface TeamMemberFilters {
  search?: string;
  role?: TeamRole;
  status?: TeamMemberStatus;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface TeamMembersResponse {
  data: TeamMember[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const ROLE_PERMISSIONS = {
  viewer: {
    label: 'Viewer',
    description: 'Can view but cannot edit or modify any details. No access to Settings.',
    canView: true,
    canEdit: false,
    canDelete: false,
    canAccessSettings: false,
  },
  editor: {
    label: 'Editor',
    description: 'Can view, edit, configure, share, publish, or delete details. No access to Settings.',
    canView: true,
    canEdit: true,
    canDelete: true,
    canAccessSettings: false,
  },
  admin: {
    label: 'Admin',
    description: 'Full access: view, edit, configure, share, publish, delete, and access Settings.',
    canView: true,
    canEdit: true,
    canDelete: true,
    canAccessSettings: true,
  },


  
} as const;
