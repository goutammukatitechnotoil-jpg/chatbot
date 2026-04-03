import React from 'react';

interface FullPageLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({ isLoading, message = 'Processing...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="relative">
          {/* Main Spinner */}
          <div className="w-16 h-16 border-4 border-gray-100 border-t-[#f37021] rounded-full animate-spin"></div>
          
          {/* Inner Accent Spinner */}
          <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-orange-300 rounded-full animate-spin duration-700"></div>
          
          {/* Center Pulsing Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#f37021] rounded-full animate-pulse shadow-[0_0_10px_#f37021]"></div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <p className="text-gray-900 font-bold text-lg">{message}</p>
          <div className="flex gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-[#f37021] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-[#f37021] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-[#f37021] rounded-full animate-bounce"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
