import type {
  TeamMember,
  InviteMemberForm,
  UpdateMemberForm,
  TeamMemberFilters,
  PaginationParams,
  TeamMembersResponse,
} from '../types/team';

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

export async function inviteTeamMember(
  form: InviteMemberForm,
  createdBy: string
): Promise<{ data: TeamMember | null; error: Error | null }> {
  try {
    const response = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, createdBy }),
    });
    const result = await safeJsonParse(response);
    return result;
  } catch (error) {
    console.error('Error inviting team member:', error);
    return { data: null, error: error as Error };
  }
}

export async function getTeamMembers(
  filters: TeamMemberFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 10 }
): Promise<TeamMembersResponse> {
  try {
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
    });
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    
    const response = await fetch(`/api/team?${params}`);
    const result = await safeJsonParse(response);
    return result;
  } catch (error) {
    console.error('Error fetching team members:', error);
    return {
      data: [],
      total: 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: 0,
    };
  }
}

export async function updateTeamMember(
  id: string,
  updates: UpdateMemberForm
): Promise<{ data: TeamMember | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(`Update team member failed ${response.status}:`, text);
      if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
        return {
          data: null,
          error: new Error('Received HTML instead of JSON - likely a server error or routing issue'),
        };
      }

      try {
        const json = JSON.parse(text);
        return {
          data: null,
          error: new Error(json.error || `Update team member failed with status ${response.status}`),
        };
      } catch {
        return {
          data: null,
          error: new Error(`Update team member failed with status ${response.status}`),
        };
      }
    }

    const result = await safeJsonParse(response);
    return result;
  } catch (error) {
    console.error('Error updating team member:', error);
    return { data: null, error: error as Error };
  }
}

export async function deleteTeamMember(
  id: string
): Promise<{ error: Error | null }> {
  try {
    await fetch(`/api/team/${id}`, {
      method: 'DELETE',
    });
    return { error: null };
  } catch (error) {
    console.error('Error deleting team member:', error);
    return { error: error as Error };
  }
}

export async function getTeamMemberById(
  id: string
): Promise<{ data: TeamMember | null; error: Error | null }> {
  try {
    const response = await fetch(`/api/team/${id}`);
    if (!response.ok) {
      const text = await response.text();
      console.warn(`Team member endpoint returned ${response.status}:`, text);
      return { data: null, error: new Error(`Team member request failed (${response.status})`) };
    }

    const result = await safeJsonParse(response);
    if (!result || !('data' in result)) {
      return { data: null, error: new Error('Team member endpoint returned invalid JSON') };
    }

    return result;
  } catch (error) {
    console.error('Error fetching team member:', error);
    return { data: null, error: error as Error };
  }
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<{ data: TeamMember | null; error: Error | null }> {
  try {
    console.log('🔐 Validating credentials for email:', email);
    console.log('🔐 Password length:', password.length);
    
    const response = await fetch('/api/team/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('🔐 Response status:', response.status);
    console.log('🔐 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔐 API response error:', errorText);
      return { data: null, error: new Error(`API Error: ${response.status}`) };
    }

    const result = await safeJsonParse(response);
    console.log('🔐 API response success:', result);
    
    if (result.data) {
      console.log('🔐 Login successful for user:', result.data.email);
    } else {
      console.log('🔐 Login failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('🔐 Error validating credentials:', error);
    return { data: null, error: error as Error };
  }
}
