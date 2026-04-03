import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface OtpVerificationProps {
  email: string;
  originalOtp: string;
  onBackToForgot: () => void;
  onOtpVerified: () => void;
}

export default function OtpVerification({ email, originalOtp, onBackToForgot, onOtpVerified }: OtpVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pasteData.length && i < 6; i++) {
      newOtp[i] = pasteData[i];
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or next empty one
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (enteredOtp === originalOtp) {
        onOtpVerified();
      } else {
        setError('Invalid verification code. Please check and try again.');
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    // Reset timer and show success message
    setTimeLeft(300);
    setError('');
    Swal.fire({
      title: 'OTP Sent!',
      text: `New OTP sent! Your verification code is: ${originalOtp}`,
      icon: 'success',
      confirmButtonColor: '#f97316',
    });
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to<br />
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

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 text-center">
                Verification Code
              </label>
              
              <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    disabled={isLoading || timeLeft === 0}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Time remaining: <span className="font-mono font-semibold text-orange-600">{formatTime(timeLeft)}</span>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft === 0 || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify Code
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={timeLeft > 0 || isLoading}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Code
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={onBackToForgot}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Email
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              Please check your email inbox and spam folder for the verification code
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
