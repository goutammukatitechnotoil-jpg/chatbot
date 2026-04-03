import { CheckCircle, LogIn } from 'lucide-react';

interface PasswordResetSuccessProps {
  onBackToLogin: () => void;
}

export default function PasswordResetSuccess({ onBackToLogin }: PasswordResetSuccessProps) {
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
          
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Complete!</h1>
            <p className="text-gray-600">
              Your password has been successfully reset.<br />
              You can now sign in with your new password.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
              <p className="text-gray-600 text-sm">
                Your account is now secured with your new password.
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Continue to Login
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-800 text-center">
              <strong>Security Tip:</strong> Keep your password safe and don't share it with anyone
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
