import { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import OtpVerification from './OtpVerification';
import ResetPassword from './ResetPassword';
import PasswordResetSuccess from './PasswordResetSuccess';

export type ForgotPasswordStep = 'forgot' | 'otp' | 'reset' | 'success';

interface ForgotPasswordFlowProps {
  onBackToLogin: () => void;
}

export default function ForgotPasswordFlow({ onBackToLogin }: ForgotPasswordFlowProps) {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('forgot');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleOtpSent = (userEmail: string, generatedOtp: string) => {
    setEmail(userEmail);
    setOtp(generatedOtp);
    setCurrentStep('otp');
  };

  const handleOtpVerified = () => {
    setCurrentStep('reset');
  };

  const handlePasswordReset = () => {
    setCurrentStep('success');
  };

  const handleBackToForgot = () => {
    setCurrentStep('forgot');
  };

  switch (currentStep) {
    case 'forgot':
      return (
        <ForgotPassword
          onBackToLogin={onBackToLogin}
          onOtpSent={handleOtpSent}
        />
      );

    case 'otp':
      return (
        <OtpVerification
          email={email}
          originalOtp={otp}
          onBackToForgot={handleBackToForgot}
          onOtpVerified={handleOtpVerified}
        />
      );

    case 'reset':
      return (
        <ResetPassword
          email={email}
          onBackToLogin={onBackToLogin}
          onPasswordReset={handlePasswordReset}
        />
      );

    case 'success':
      return (
        <PasswordResetSuccess
          onBackToLogin={onBackToLogin}
        />
      );

    default:
      return (
        <ForgotPassword
          onBackToLogin={onBackToLogin}
          onOtpSent={handleOtpSent}
        />
      );
  }
}
