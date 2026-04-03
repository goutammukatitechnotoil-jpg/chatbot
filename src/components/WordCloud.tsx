import React, { useEffect, useState, useRef } from 'react';
import { Cloud, RefreshCw, Download, Info } from 'lucide-react';
import Swal from 'sweetalert2';

interface WordData {
  word: string;
  count: number;
  percentage: number;
}

interface WordCloudMetadata {
  totalConversations: number;
  totalMessages: number;
  totalWords: number;
  uniqueWords: number;
  topWordsShown: number;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
}

interface WordCloudProps {
  startDate?: Date;
  endDate?: Date;
  maxWords?: number;
}

const WordCloud: React.FC<WordCloudProps> = ({ 
  startDate, 
  endDate, 
  maxWords = 50 
}) => {
  const [wordData, setWordData] = useState<WordData[]>([]);
  const [metadata, setMetadata] = useState<WordCloudMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);

  // Color schemes for different word frequencies
  const getWordStyle = (word: WordData): React.CSSProperties => {
    const percentage = word.percentage;
    let fontSize: number;
    let color: string;
    let opacity: number;

    // Font size based on percentage (8px to 48px)
    fontSize = Math.max(8, Math.min(48, 8 + (percentage * 0.4)));
    
    // Color based on frequency rank
    if (percentage >= 80) {
      color = '#DC2626'; // Red-600 - highest frequency
      opacity = 1;
    } else if (percentage >= 60) {
      color = '#EA580C'; // Orange-600
      opacity = 0.9;
    } else if (percentage >= 40) {
      color = '#D97706'; // Amber-600
      opacity = 0.8;
    } else if (percentage >= 25) {
      color = '#059669'; // Emerald-600
      opacity = 0.7;
    } else if (percentage >= 15) {
      color = '#0D9488'; // Teal-600
      opacity = 0.6;
    } else if (percentage >= 8) {
      color = '#0284C7'; // Sky-600
      opacity = 0.55;
    } else {
      color = '#7C3AED'; // Violet-600
      opacity = 0.5;
    }

    return {
      fontSize: `${fontSize}px`,
      color,
      opacity,
      fontWeight: percentage >= 50 ? 'bold' : percentage >= 25 ? '600' : 'normal',
      margin: '2px 6px',
      display: 'inline-block',
      lineHeight: '1.2',
      textShadow: percentage >= 60 ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    };
  };

  const fetchWordCloudData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString());
      }
      params.append('maxWords', maxWords.toString());

      const response = await fetch(`/api/analytics/wordcloud?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setWordData(result.data || []);
      setMetadata(result.metadata || null);
      
    } catch (err) {
      console.error('Error fetching word cloud data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load word cloud data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWordCloudData();
  }, [startDate, endDate, maxWords]);

  const handleWordClick = (word: WordData) => {
    Swal.fire({
      title: 'Word Details',
      text: `"${word.word}" appears ${word.count} times (${word.percentage}% relative frequency)`,
      icon: 'info',
      confirmButtonColor: '#3085d6',
    });
  };

  const handleRefresh = () => {
    fetchWordCloudData();
  };

  const handleDownload = () => {
    if (!wordData.length) return;

    const csvContent = [
      'Word,Count,Percentage',
      ...wordData.map(w => `"${w.word}",${w.count},${w.percentage}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-cloud-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conversation Word Cloud</h3>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Analyzing conversations...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conversation Word Cloud</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Failed to load word cloud</div>
          <div className="text-sm text-gray-500 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!wordData.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cloud className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Conversation Word Cloud</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No conversation data available</div>
          <div className="text-sm text-gray-400">Start chatting with users to see word patterns here</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cloud className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conversation Word Cloud</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            title="Show information"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            title="Download as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && metadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Word Cloud Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">{metadata.totalConversations}</div>
              <div className="text-blue-600">Conversations</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">{metadata.totalMessages}</div>
              <div className="text-blue-600">Messages</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">{metadata.uniqueWords}</div>
              <div className="text-blue-600">Unique Words</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">{metadata.topWordsShown}</div>
              <div className="text-blue-600">Words Shown</div>
            </div>
          </div>
        </div>
      )}

      {/* Word Cloud */}
      <div 
        ref={cloudRef}
        className="min-h-64 bg-gray-50 rounded-lg p-6 text-center leading-relaxed overflow-hidden"
        style={{ 
          lineHeight: '1.4',
          wordWrap: 'break-word'
        }}
      >
        {wordData.map((word) => (
          <span
            key={word.word}
            style={getWordStyle(word)}
            onClick={() => handleWordClick(word)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={`${word.word}: ${word.count} occurrences`}
          >
            {word.word}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>Click any word to see details</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Most frequent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-violet-600 rounded"></div>
              <span>Less frequent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCloud;
