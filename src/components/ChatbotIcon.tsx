import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChatbotConfig } from '../contexts/ChatbotConfigContext';

interface ChatbotIconProps {
  onClick: () => void;
}

export function ChatbotIcon({ onClick }: ChatbotIconProps) {
  const { config } = useChatbotConfig();
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTemporaryMessage, setShowTemporaryMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTemporaryMessage(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setShowTemporaryMessage(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return `#${(
      0x1000000 +
      (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative" style={{ maxWidth: '330px', maxHeight: '90px' }}>
        {showTemporaryMessage && (
          <div className={`temporary-message ${!showTemporaryMessage ? 'close-anim' : ''}`}>
            <div className="content-wrapper">
              <img
                src={config.logoUrl || '/FPTSoftware.png'}
                alt="Bot says"
                draggable="false"
                className="avatar bot-icon"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/FPTSoftware.png';
                }}
              />
              <div className="text-container">
                <div className="title no-select no-wrap">{config.popupTitle}</div>
                <div className="description no-select no-wrap">{config.popupDescription}</div>
              </div>
            </div>
          </div>
        )}

        {showTooltip && !showTemporaryMessage && (
          <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-black text-white text-sm rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            {config.triggerMessage}
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black"></div>
          </div>
        )}

        <button
          onClick={onClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            background: config.iconType === 'siriwhite'
              ? '#ffffff'
              : `linear-gradient(to bottom right, ${config.colorTheme}, ${darkenColor(config.colorTheme, 20)})`,
          }}
          className="group relative w-16 h-16 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center overflow-hidden"
          aria-label="Open chatbot"
        >
          {config.iconType === 'siriwhite' ? (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <svg className="w-10 h-10" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="3" fill="#8B5CF6">
                  <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="50" r="3" fill="#EC4899">
                  <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="50" r="3" fill="#06B6D4">
                  <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="50" r="2" fill="#F59E0B">
                  <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                </circle>
                <circle cx="75" cy="50" r="2" fill="#10B981">
                  <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          ) : config.iconType === 'siritrans' ? (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-10 h-10" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="3" fill="#FFFFFF">
                  <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="35" cy="50" r="3" fill="#FFFFFF">
                  <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="65" cy="50" r="3" fill="#FFFFFF">
                  <animate attributeName="r" values="3;6;3" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="50" r="2" fill="#FFFFFF">
                  <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
                </circle>
                <circle cx="75" cy="50" r="2" fill="#FFFFFF">
                  <animate attributeName="r" values="2;4;2" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" begin="0.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          ) : (
            <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
          )}

          {config.iconType === 'default' && (
            <div
              style={{ backgroundColor: config.colorTheme }}
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 animate-pulse"
            ></div>
          )}

          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </button>
      </div>
    </div>
  );
}
