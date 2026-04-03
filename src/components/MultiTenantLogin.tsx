import { useState, useEffect } from 'react';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
// Login will use API calls instead of direct service imports

interface LoginProps {
  onLoginSuccess?: () => void;
  mode?: 'tenant' | 'super-admin';
}

export function MultiTenantLogin({ onLoginSuccess, mode = 'tenant' }: LoginProps) {
  const { setUser, setTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState<'tenant' | 'login'>('tenant');

  // Form states
  const [subdomain, setSubdomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [foundTenant, setFoundTenant] = useState<any>(null);

  // Get subdomain from URL on component mount
  useEffect(() => {
    if (mode === 'tenant' && typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // If we have a subdomain (e.g., company.example.com)
      if (parts.length > 2) {
        const potentialSubdomain = parts[0];
        setSubdomain(potentialSubdomain);
        handleTenantLookup(potentialSubdomain);
      }
    } else if (mode === 'super-admin') {
      setCurrentStep('login');
    }
  }, [mode]);

  const handleTenantLookup = async (subdomainValue?: string) => {
    const tenantSubdomain = subdomainValue || subdomain;
    if (!tenantSubdomain.trim()) {
      setError('Please enter your company subdomain');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tenant/lookup?subdomain=${tenantSubdomain.toLowerCase()}`);
      const data = await response.json();
      
      if (!response.ok || !data.tenant) {
        setError('Company not found. Please check your subdomain or contact support.');
        return;
      }

      const tenant = data.tenant;
      if (tenant.status !== 'active') {
        setError('This account is currently inactive. Please contact support.');
        return;
      }

      setFoundTenant(tenant);
      setTenant(tenant);
      setCurrentStep('login');
      setSuccess(`Welcome to ${tenant.name}`);

    } catch (error: any) {
      console.error('Tenant lookup error:', error);
      setError('Unable to find your company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginData = mode === 'super-admin' ? {
        email,
        password,
        type: 'super-admin'
      } : {
        email,
        password,
        subdomain: foundTenant?.subdomain,
        type: 'tenant'
      };

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }

      setUser(data.user);
      if (data.tenant) {
        setTenant(data.tenant);
      }

      setSuccess(mode === 'super-admin' ? 'Successfully logged in as Super Admin' : `Welcome back, ${data.user.name}!`);

      // Call success callback after a brief delay
      setTimeout(() => {
        onLoginSuccess?.();
      }, 1000);

    } catch (error: any) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('tenant');
    setFoundTenant(null);
    setTenant(null);
    setError('');
    setSuccess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentStep === 'tenant' && mode === 'tenant') {
        handleTenantLookup();
      } else {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              {mode === 'super-admin' ? (
                <Shield className="w-12 h-12 text-white" />
              ) : (
                <Building2 className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === 'super-admin' ? 'Super Admin Login' : 'Chatbot Platform'}
            </h1>
            <p className="text-blue-100 mt-2">
              {mode === 'super-admin' 
                ? 'System Administration Portal' 
                : currentStep === 'tenant' 
                  ? 'Enter your company subdomain to continue'
                  : `Sign in to ${foundTenant?.name || 'your account'}`
              }
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Success Message */}
            {success && (
              <div className="mb-6 flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Tenant Step */}
            {currentStep === 'tenant' && mode === 'tenant' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Subdomain
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your-company"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                      .chatbot.com
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the subdomain provided by your administrator
                  </p>
                </div>

                <button
                  onClick={() => handleTenantLookup()}
                  disabled={isLoading || !subdomain.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Login Step */}
            {(currentStep === 'login' || mode === 'super-admin') && (
              <div className="space-y-6">
                {/* Back button for tenant mode */}
                {mode === 'tenant' && (
                  <button
                    onClick={handleBack}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    ← Back to company lookup
                  </button>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={isLoading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 text-center text-sm text-gray-600">
            {mode === 'tenant' ? (
              <>
                Need help? Contact your administrator or{' '}
                <a href="#" className="text-blue-600 hover:underline">support</a>
              </>
            ) : (
              'Chatbot Platform - Super Admin Portal'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultiTenantLogin;
