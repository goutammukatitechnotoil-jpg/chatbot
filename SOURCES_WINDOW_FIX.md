# Sources Window Fix for Test Chatbot UI

## ✅ Issue Resolution Summary

### 🎯 **Problem Identified**
The Test Chatbot UI in the AdminPanel was not showing the Sources Window because:
- `sourcesWidth` was set to 1000px (too large for 900px ChatWindow)
- No responsive constraints to prevent layout overflow
- Missing admin controls for configuration

### 🔧 **Solution Implemented**

1. **Fixed Sources Width Configuration**
   - Reset `sourcesWidth` from 1000px to optimal 350px
   - Added database persistence for all changes
   - Configuration now properly stored and retrieved

2. **Enhanced ChatWindow Layout**
   - Added responsive constraints: `min: 200px, max: 500px or 40%`
   - Sources panel properly sized within ChatWindow bounds
   - Maintains responsive behavior (hidden on screens < 1024px)

3. **Added Admin Panel Controls**
   - Sources Window section in Appearance tab
   - Real-time width configuration (200-500px range)
   - Live preview showing layout changes
   - Input validation and recommendations

4. **Improved Test Environment**
   - Test Chatbot UI now displays current sources width
   - Added troubleshooting information
   - Clear instructions for testing sources functionality

## 🧪 **Testing the Sources Window**

### **How to Test:**
1. Open Admin Panel on desktop/wide screen (≥1024px)
2. Navigate to **Test Chatbot** tab
3. Click the chatbot icon to open chat window
4. Send a message to the AI bot
5. Look for **sources panel on the RIGHT side** of chat

### **Expected Behavior:**
- ✅ Sources panel appears on desktop screens (≥1024px)
- ✅ Panel width matches configured setting (350px)
- ✅ Sources populate when bot responses include references
- ✅ Panel hidden on mobile/small screens

## 📊 **Current Configuration**

```bash
# Check current sources width
curl -X GET http://localhost:3000/api/config | jq '.data.sourcesWidth'
# Result: 350

# Layout specifications
ChatWindow Total Width: 900px (desktop)
Main Chat Area: ~550px (flexible)
Sources Panel: 350px (configurable 200-500px)
Responsive Breakpoint: ≥1024px
```

## ⚙️ **Configuration Options**

### **Via Admin Panel:**
1. **Admin Panel** → **Appearance** → **Sources Window**
2. Adjust **"Sources Panel Width"** (200-500px)
3. View **real-time preview**
4. Click **"Save Appearance Settings"**

### **Via API Commands:**
```bash
# Compact layout (more chat space)
curl -X PUT -H 'Content-Type: application/json' \
  -d '{"sourcesWidth": 250}' http://localhost:3000/api/config

# Balanced layout  
curl -X PUT -H 'Content-Type: application/json' \
  -d '{"sourcesWidth": 350}' http://localhost:3000/api/config

# Spacious layout (more sources detail)
curl -X PUT -H 'Content-Type: application/json' \
  -d '{"sourcesWidth": 450}' http://localhost:3000/api/config
```

## 🔍 **Troubleshooting**

### **If Sources Window Doesn't Appear:**

1. **Check Screen Width**
   - Minimum: 1024px (desktop/large tablet)
   - Sources intentionally hidden on mobile

2. **Verify Bot Responses**  
   - Sources only appear with reference links
   - Test with AI queries that return sources

3. **Check Configuration**
   - Sources width: 200-500px range
   - Current setting: 350px
   - Adjust via Appearance settings

4. **Browser Developer Tools**
   - Inspect ChatWindow element
   - Look for sources panel div
   - Check CSS display properties

## 🎊 **Resolution Status**

- ✅ **Sources Window Visibility**: FIXED
- ✅ **Database Configuration**: WORKING  
- ✅ **Admin Panel Controls**: IMPLEMENTED
- ✅ **Responsive Design**: APPLIED
- ✅ **Test Environment**: OPTIMIZED

## 📝 **Files Modified**

1. **ChatWindow.tsx** - Added responsive width constraints
2. **AdminPanel.tsx** - Added Sources Window configuration section
3. **Configuration API** - Properly storing sourcesWidth
4. **Test Scripts** - Created comprehensive verification tools

The Sources Window is now fully functional in the Test Chatbot UI and properly respects the configured width settings stored in the database.
