import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  email: string;
  onBackToLogin: () => void;
  onPasswordReset: () => void;
}

export default function ResetPassword({ email, onBackToLogin, onPasswordReset }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character');
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain ${passwordErrors.join(', ')}.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call the API to reset the password
      console.log('Password reset for:', email);
      
      onPasswordReset();
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordErrors = validatePassword(password);
  const isPasswordValid = password.length > 0 && passwordErrors.length === 0;
  const isFormValid = isPasswordValid && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-xl mb-4 p-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="4" fill="#8B5CF6">
                <animate attributeName="r" values="4;10;4" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="50" r="4" fill="#EC4899">
                <animate attributeName="r" values="4;8;4" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="70" cy="50" r="4" fill="#06B6D4">
                <animate attributeName="r" values="4;8;4" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="20" cy="50" r="3" fill="#F59E0B">
                <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="50" r="3" fill="#10B981">
                <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">
            Create a secure password for<br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="Enter new password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Password Requirements:</p>
              <ul className="space-y-1 text-sm">
                <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${password.length >= 8 ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {password.length >= 8 && <CheckCircle className="w-3 h-3" />}
                  </div>
                  At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[A-Z]/.test(password) ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {/[A-Z]/.test(password) && <CheckCircle className="w-3 h-3" />}
                  </div>
                  One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[a-z]/.test(password) ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {/[a-z]/.test(password) && <CheckCircle className="w-3 h-3" />}
                  </div>
                  One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/\d/.test(password) ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {/\d/.test(password) && <CheckCircle className="w-3 h-3" />}
                  </div>
                  One number
                </li>
                <li className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) && <CheckCircle className="w-3 h-3" />}
                  </div>
                  One special character
                </li>
                <li className={`flex items-center gap-2 ${password === confirmPassword && password.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${password === confirmPassword && password.length > 0 ? 'bg-green-100 border-green-500' : 'border-gray-300'}`}>
                    {password === confirmPassword && password.length > 0 && <CheckCircle className="w-3 h-3" />}
                  </div>
                  Passwords match
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={onBackToLogin}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Your new password will be encrypted and stored securely
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Chatbot Admin Panel v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
