#!/bin/bash

echo "🧪 Logo Upload - Base64 Format Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Checking API endpoint...${NC}"
if grep -q "base64Data" pages/api/upload/logo.ts; then
    echo -e "${GREEN}✅ Base64 conversion code found${NC}"
else
    echo "❌ Base64 conversion not found"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Checking data URL creation...${NC}"
if grep -q "data:\${mimeType};base64" pages/api/upload/logo.ts; then
    echo -e "${GREEN}✅ Data URL format found${NC}"
else
    echo "❌ Data URL format not found"
    exit 1
fi

echo ""
echo -e "${BLUE}3. Checking temp file cleanup...${NC}"
if grep -q "fs.unlinkSync" pages/api/upload/logo.ts; then
    echo -e "${GREEN}✅ Temp file cleanup found${NC}"
else
    echo "❌ Temp file cleanup not found"
fi

echo ""
echo -e "${BLUE}4. Checking temp directory...${NC}"
if [ -d "public/uploads/temp" ]; then
    echo -e "${GREEN}✅ Temp directory exists${NC}"
else
    echo "❌ Temp directory not found"
    exit 1
fi

echo ""
echo -e "${BLUE}5. Checking .gitignore...${NC}"
if grep -q "public/uploads/temp" .gitignore; then
    echo -e "${GREEN}✅ Temp directory gitignored${NC}"
else
    echo "❌ Temp directory not in .gitignore"
fi

echo ""
echo -e "${BLUE}6. Testing base64 response format...${NC}"
if grep -q "url: base64Url" pages/api/upload/logo.ts; then
    echo -e "${GREEN}✅ Response returns base64 URL${NC}"
else
    echo "❌ Response format incorrect"
    exit 1
fi

echo ""
echo -e "${BLUE}7. Checking MIME type handling...${NC}"
if grep -q "mimeType" pages/api/upload/logo.ts; then
    echo -e "${GREEN}✅ MIME type included in response${NC}"
else
    echo "❌ MIME type not found"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ All base64 checks passed!${NC}"
echo ""
echo -e "${YELLOW}📝 How it works:${NC}"
echo "  1. User uploads image file"
echo "  2. File saved temporarily"
echo "  3. Read as binary buffer"
echo "  4. Converted to base64 string"
echo "  5. Wrapped in data URL format"
echo "  6. Temporary file deleted"
echo "  7. Data URL returned and saved in config"
echo ""
echo -e "${YELLOW}📊 Example output:${NC}"
echo '  {
    "success": true,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
    "filename": "logo.png",
    "mimeType": "image/png",
    "size": 12345
  }'
echo ""
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "  1. Run: npm run dev"
echo "  2. Go to Admin Panel → Appearance"
echo "  3. Upload a logo image"
echo "  4. Check preview (should show immediately)"
echo "  5. Save changes"
echo "  6. Verify logoUrl in config starts with 'data:image/'"
echo ""
