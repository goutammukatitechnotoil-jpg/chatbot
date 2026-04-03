#!/bin/bash

# FPT Chatbot - Logo Fix Verification Script
# This script verifies that the logo is properly configured and accessible

echo "🖼️ FPT CHATBOT - LOGO FIX VERIFICATION"
echo "====================================="
echo ""

BASE_URL="http://localhost:3000"

echo "📋 1. CHECKING CURRENT LOGO CONFIGURATION"
echo "----------------------------------------"
LOGO_URL=$(curl -s "$BASE_URL/api/config" | jq -r '.data.logoUrl')
echo "Current logoUrl in database: $LOGO_URL"
echo ""

echo "📋 2. VERIFYING LOGO IMAGE FILE EXISTS"
echo "-------------------------------------"
if [ -f "./public/FPTSoftware.png" ]; then
    echo "✅ Logo file exists: ./public/FPTSoftware.png"
    ls -la "./public/FPTSoftware.png" | awk '{print "   Size: " $5 " bytes, Modified: " $6 " " $7 " " $8}'
else
    echo "❌ Logo file NOT found: ./public/FPTSoftware.png"
fi
echo ""

echo "📋 3. TESTING LOGO HTTP ACCESSIBILITY"
echo "------------------------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/FPTSoftware.png")
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Logo accessible via HTTP: $BASE_URL/FPTSoftware.png"
    echo "   HTTP Status: $HTTP_STATUS"
else
    echo "❌ Logo NOT accessible via HTTP: $BASE_URL/FPTSoftware.png"
    echo "   HTTP Status: $HTTP_STATUS"
fi
echo ""

echo "📋 4. VERIFYING CHATBOT CONFIGURATION"
echo "------------------------------------"
curl -s "$BASE_URL/api/config" | jq '{
  chatbot_name: .data.chatbotName,
  logo_url: .data.logoUrl,
  color_theme: .data.colorTheme,
  header_color: .data.headerColorTheme
}'
echo ""

echo "📋 5. LOGO INTEGRATION SUMMARY"
echo "-----------------------------"
if [ "$LOGO_URL" = "/FPTSoftware.png" ] && [ "$HTTP_STATUS" = "200" ]; then
    echo "🎉 LOGO INTEGRATION: ✅ WORKING PERFECTLY!"
    echo ""
    echo "✅ Logo URL correctly set in database: $LOGO_URL"
    echo "✅ Logo file exists and is accessible"
    echo "✅ ChatWindow component will display logo properly"
    echo ""
    echo "The logo should now be visible in:"
    echo "• Chat window header (next to chatbot name)"
    echo "• Bot message avatars (in conversation)"
else
    echo "⚠️  LOGO INTEGRATION: ❌ ISSUES DETECTED!"
    echo ""
    if [ "$LOGO_URL" != "/FPTSoftware.png" ]; then
        echo "❌ Logo URL incorrect: Expected '/FPTSoftware.png', Got '$LOGO_URL'"
    fi
    if [ "$HTTP_STATUS" != "200" ]; then
        echo "❌ Logo file not accessible via HTTP (Status: $HTTP_STATUS)"
    fi
fi

echo ""
echo "🔧 TO TEST THE FIX:"
echo "==================="
echo "1. Open: $BASE_URL"
echo "2. Click the chatbot icon to open chat window"
echo "3. Verify logo appears in header and bot messages"
echo ""
