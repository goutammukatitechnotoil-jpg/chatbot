import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onOtpSent: (email: string, otp: string) => void;
}

export default function ForgotPassword({ onBackToLogin, onOtpSent }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Simulate API call for sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const otp = generateOTP();
      
      // For now, show OTP in success message (as requested)
      setSuccess(`OTP sent successfully! Your verification code is: ${otp}`);
      
      // After showing success, proceed to OTP verification
      setTimeout(() => {
        onOtpSent(email, otp);
      }, 3000);
      
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your email address and we'll send you a verification code</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  disabled={isLoading || !!success}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!success}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  OTP Sent Successfully!
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Send Verification Code
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
              We'll send a 6-digit verification code to your registered email address
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
