function TestChatbotView() {
  const { config } = useChatbotConfig();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f37021] to-[#d85a0a] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Test Chatbot</h2>
            <p className="text-white/90">Test your chatbot configuration and interactions in real-time</p>
          </div>
          <MessageSquare className="w-12 h-12 text-white/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Live Chatbot Preview</h3>
          <p className="text-sm text-gray-600 mb-4">
            The chatbot below uses your current configuration settings. Test all features including forms, buttons, and AI responses.
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live Configuration
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Real-time Testing
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 min-h-[600px] relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Click the chatbot icon in the bottom right to start testing</p>
            </div>
          </div>
          <Chatbot />
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Sources Window Status</h4>
              <div className="bg-white p-3 rounded border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Sources Panel Width:</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{config.sourcesWidth}px</span>
                </div>
                <div className="text-[10px] text-gray-600 space-y-1">
                  <div>• Visible only on desktop screens (≥1024px wide)</div>
                  <div>• Shows reference links from bot responses with sources</div>
                  <div>• Width is currently set to {config.sourcesWidth}px</div>
                </div>
              </div>
              <p className="text-[10px] text-blue-600 mt-2">
                <strong>Tip:</strong> Send messages to the AI to see sources appear in the right panel. 
                Ensure your screen is wide enough (desktop) to see the sources window.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Test Features
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Quick reply buttons</li>
              <li>• Custom forms</li>
              <li>• Button actions</li>
              <li>• AI responses</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Visual Testing
            </h4>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Color themes</li>
              <li>• Logo display</li>
              <li>• Icon animations</li>
              <li>• Message styling</li>
              <li>• Sources window width</li>
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics Tracking
            </h4>
            <ul className="text-xs text-orange-800 space-y-1">
              <li>• Session tracking</li>
              <li>• Message counting</li>
              <li>• Lead capture</li>
              <li>• User engagement</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Testing Tips</h4>
              <ul className="text-xs text-yellow-800 space-y-1">
                <li>• Changes made in other sections will automatically apply here</li>
                <li>• Test on different screen sizes to ensure responsiveness</li>
                <li>• Try all button actions and form submissions</li>
                <li>• Check that analytics are being recorded in the Dashboard</li>
                <li>• Sources panel only appears on desktop screens (≥1024px width)</li>
                <li>• Send AI messages to see sources populate in the right panel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
