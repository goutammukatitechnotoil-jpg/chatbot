# Quick Start: Adding Default Buttons to All Tenants

## 🎯 What This Does
Adds "Speak to Expert" and "Continue with AI" buttons to all existing tenants.

## ⚡ Quick Steps

### 1. Prerequisites
- ✅ Node.js installed
- ✅ MongoDB connection configured
- ✅ Terminal/Command Prompt access

### 2. Run the Migration
```bash
cd "FPT Chatbot 10"
node scripts/seedDefaultButtons.js
```

### 3. Expected Output
```
🚀 Starting Default Buttons Migration
🔗 Connected to MongoDB
📋 Found X active tenants

📍 Seeding default buttons for each tenant...
  ✅ Seeded button: "Speak to Expert"
  ✅ Seeded button: "Continue with AI"

============================================================
📊 SUMMARY
============================================================
Total tenants processed: X
  ✅ Successful: X
  ❌ Failed: 0
  📝 Buttons seeded: XX
  ⏭️  Buttons already existed: X
============================================================

✨ Migration complete!
```

## ✅ Verification

### Check in Admin Panel
1. Login to any tenant
2. Go to **Button Actions** page
3. You should see:
   - "Speak to Expert" button
   - "Continue with AI" button

### Check in Database
```javascript
// Connect to tenant DB
use fpt_t_xxxxx_yyyyy

// Find default buttons
db.chatbot_buttons.find({ is_system_button: true })
```

## 🔧 Troubleshooting

### If Migration Fails
```bash
# Check MongoDB connection
echo $MONGODB_URI

# Verify you're in the correct directory
pwd
# Should show: .../FPT Chatbot 10

# Check if script exists
ls scripts/seedDefaultButtons.js
```

### If Buttons Don't Appear
1. Verify tenant is **active** (not suspended/cancelled)
2. Check if buttons already existed (script will skip them)
3. Try running the script again (it's safe to run multiple times)

## 📝 What Gets Added

### Button 1: "Speak to Expert"
- **Purpose**: Connect users with human support
- **Label**: "Speak to Expert"
- **Action**: Triggers expert support request
- **Location**: Welcome screen
- **Status**: Active by default

### Button 2: "Continue with AI"
- **Purpose**: Start AI chatbot conversation  
- **Label**: "Continue with AI"
- **Action**: Begins chat with AI
- **Location**: Welcome screen
- **Status**: Active by default

## 🎨 Customization

Tenants can customize these buttons:
- ✅ Change label text
- ✅ Toggle active/inactive
- ✅ Change display order
- ✅ Connect to forms
- ❌ Cannot change ID (system field)

## ⚠️ Important Notes

1. **Safe to Run Multiple Times**: The script checks for existing buttons and skips them
2. **No Data Loss**: Only adds new buttons, doesn't modify or delete existing ones
3. **Active Tenants Only**: Only processes tenants with status = 'active'
4. **Non-Blocking**: If one tenant fails, others continue processing

## 🆘 Need Help?

**Error Messages:**
- `Connection refused`: Check MongoDB connection string
- `Permission denied`: Ensure user has write access to tenant databases
- `Tenant not found`: Verify tenant exists in master database

**For More Details:**
See [DEFAULT_BUTTONS_IMPLEMENTATION.md](./DEFAULT_BUTTONS_IMPLEMENTATION.md)

---

**Quick Command:**
```bash
node scripts/seedDefaultButtons.js
```

**That's it!** ✨
