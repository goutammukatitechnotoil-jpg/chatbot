import { useEffect, useState } from 'react';
import { Chatbot } from './components/Chatbot';
import { AdminPanel } from './components/AdminPanel';

import ForgotPasswordFlow from './components/ForgotPasswordFlow';
import MultiTenantLogin from './components/MultiTenantLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { ChatbotConfigProvider } from './contexts/ChatbotConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';

function AppContent() {
  const { user, tenant, isAuthenticated, isLoading, isSuperAdmin } = useTenant();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [appMode, setAppMode] = useState<'tenant' | 'super-admin'>('tenant');

  useEffect(() => {
    // Check if running in embedded mode
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const embedded = urlParams.get('embedded') === 'true';
      
      // Detect mode based on URL path
      const pathname = window.location.pathname;
      const mode = pathname.includes('/super-admin') ? 'super-admin' : 'tenant';
      
      setIsEmbedded(embedded);
      setAppMode(mode);
    }

    const handleShowForgotPassword = () => {
      setShowForgotPassword(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('showForgotPassword', handleShowForgotPassword);
      return () => {
        window.removeEventListener('showForgotPassword', handleShowForgotPassword);
      };
    }
  }, []);

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleLoginSuccess = () => {
    // Login successful - the context will handle state updates
    console.log('Login successful');
  };

  // If embedded mode, only show the chatbot
  if (isEmbedded) {
    return (
      <div className="fixed inset-0">
        <Chatbot />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show appropriate login
  if (!isAuthenticated || !user) {
    return (
      <div>
        {showForgotPassword ? (
          <ForgotPasswordFlow onBackToLogin={handleBackToLogin} />
        ) : (
          <MultiTenantLogin 
            mode={appMode}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    );
  }

  // Super admin users see the super admin dashboard
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // Tenant users must have a tenant to proceed
  if (!tenant && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load tenant information. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Regular tenant users see the admin panel
  return <AdminPanel />;
}

import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <LoadingProvider>
      <TenantProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TenantProvider>
    </LoadingProvider>
  );
}

export default App;
