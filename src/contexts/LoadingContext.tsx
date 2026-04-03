import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FullPageLoader } from '../components/FullPageLoader';

interface LoadingContextType {
  setIsLoading: (loading: boolean, message?: string) => void;
  isLoading: boolean;
  message: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoadingState] = useState(false);
  const [message, setMessageState] = useState('Processing...');

  const setIsLoading = (loading: boolean, msg?: string) => {
    setIsLoadingState(loading);
    if (msg) setMessageState(msg);
    else if (!loading) setMessageState('Processing...'); // Reset message when closing
  };

  return (
    <LoadingContext.Provider value={{ setIsLoading, isLoading, message }}>
      {children}
      <FullPageLoader isLoading={isLoading} message={message} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
