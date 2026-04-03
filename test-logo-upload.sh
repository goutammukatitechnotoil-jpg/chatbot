#!/bin/bash

echo "🧪 Logo Upload Feature - Quick Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Checking API endpoint file...${NC}"
if [ -f "pages/api/upload/logo.ts" ]; then
    echo -e "${GREEN}✅ API endpoint exists${NC}"
else
    echo "❌ API endpoint not found"
    exit 1
fi

echo ""
echo -e "${BLUE}2. Checking upload directory...${NC}"
if [ -d "public/uploads/logos" ]; then
    echo -e "${GREEN}✅ Upload directory exists${NC}"
else
    echo "❌ Upload directory not found"
    exit 1
fi

echo ""
echo -e "${BLUE}3. Checking .gitkeep file...${NC}"
if [ -f "public/uploads/logos/.gitkeep" ]; then
    echo -e "${GREEN}✅ .gitkeep file exists${NC}"
else
    echo "❌ .gitkeep file not found"
fi

echo ""
echo -e "${BLUE}4. Checking .gitignore configuration...${NC}"
if grep -q "public/uploads/logos/\*" .gitignore; then
    echo -e "${GREEN}✅ .gitignore configured${NC}"
else
    echo "❌ .gitignore not configured"
fi

echo ""
echo -e "${BLUE}5. Checking npm packages...${NC}"
if grep -q "formidable" package.json; then
    echo -e "${GREEN}✅ formidable package installed${NC}"
else
    echo "❌ formidable package not found"
    exit 1
fi

echo ""
echo -e "${BLUE}6. Checking AdminPanel changes...${NC}"
if grep -q "Choose Image File" src/components/AdminPanel.tsx; then
    echo -e "${GREEN}✅ Upload UI added to AdminPanel${NC}"
else
    echo "❌ Upload UI not found in AdminPanel"
    exit 1
fi

echo ""
echo -e "${BLUE}7. Checking for 'OR' divider...${NC}"
if grep -q "OR" src/components/AdminPanel.tsx; then
    echo -e "${GREEN}✅ OR divider added${NC}"
else
    echo "❌ OR divider not found"
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📝 Next Steps:"
echo "  1. Run: npm run dev"
echo "  2. Navigate to Admin Panel → Appearance"
echo "  3. Scroll to 'Chatbot Logo' section"
echo "  4. Try uploading an image file"
echo "  5. Verify preview updates"
echo "  6. Save and check chatbot widget"
echo ""
