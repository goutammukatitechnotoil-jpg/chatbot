import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types/tenant';
import { AuthUser } from '../services/authService';

interface TenantContextType {
  tenant: Tenant | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  setTenant: (tenant: Tenant | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load tenant info from localStorage or URL
      const storedTenant = localStorage.getItem('currentTenant');
      const storedUser = localStorage.getItem('currentUser');
      
      try {
        if (storedTenant) {
          setTenant(JSON.parse(storedTenant));
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse stored data:', error);
        localStorage.removeItem('currentTenant');
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (typeof window !== 'undefined') {
      if (newTenant) {
        localStorage.setItem('currentTenant', JSON.stringify(newTenant));
      } else {
        localStorage.removeItem('currentTenant');
      }
    }
  };

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem('currentUser', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  };

  const logout = async () => {
    try {
      // Call server logout endpoint to clear HTTP-only cookie
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local state and storage
    setUser(null);
    setTenant(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentTenant');
      localStorage.removeItem('authToken');
    }
  };

  const value: TenantContextType = {
    tenant,
    user,
    isAuthenticated: !!user,
    isLoading,
    isSuperAdmin: !!user?.isSuperAdmin,
    setTenant: handleSetTenant,
    setUser: handleSetUser,
    logout,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// Helper hooks for common use cases
export function useCurrentTenant(): Tenant | null {
  const { tenant } = useTenant();
  return tenant;
}

export function useCurrentUser(): AuthUser | null {
  const { user } = useTenant();
  return user;
}

export function usePermissions(): {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  isSuperAdmin: boolean;
} {
  const { user, isSuperAdmin } = useTenant();
  
  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (isSuperAdmin) return true;
    return permissions.some(permission => user?.permissions?.includes(permission)) || false;
  };

  return {
    hasPermission,
    hasAnyPermission,
    isSuperAdmin
  };
}

export default TenantProvider;
