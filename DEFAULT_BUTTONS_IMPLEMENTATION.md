# Default "Speak to Expert" Button Implementation

## Overview
All tenants (both new and existing) now have access to default "Speak to Expert" and "Continue with AI" buttons in their Button Actions list.

## What Was Implemented

### 1. Automatic Default Buttons for New Tenants
When a new tenant is created, two default buttons are automatically seeded:

#### "Speak to Expert" Button
```javascript
{
  id: 'btn_talk_to_human',
  label: 'Speak to Expert',
  type: 'cta',
  description: 'Connect users with human support agents',
  location: 'welcome_screen',
  action_type: 'expert_support',
  is_system_button: true,
  is_active: true,
  order_index: 1
}
```

#### "Continue with AI" Button
```javascript
{
  id: 'btn_continue_ai',
  label: 'Continue with AI',
  type: 'cta',
  description: 'Start conversation with AI chatbot',
  location: 'welcome_screen',
  action_type: 'start_chat',
  is_system_button: true,
  is_active: true,
  order_index: 2
}
```

### 2. Migration for Existing Tenants
A migration script has been created to add these default buttons to all existing tenants.

## Files Modified

### 1. `/src/services/multiTenantDatabaseService.ts`
Added `seedDefaultButtons()` method that:
- Runs automatically when a new tenant is created
- Checks if buttons already exist before inserting
- Logs the seeding process
- Doesn't throw errors if seeding fails (non-critical operation)

**Key Changes:**
```typescript
private async seedDefaultButtons(db: Db): Promise<void> {
  // Seeds "Speak to Expert" and "Continue with AI" buttons
  // Only inserts if they don't already exist
}
```

Called in `initializeTenantDatabase()`:
```typescript
await this.ensureTenantIndexes(db);
// Seed default buttons
await this.seedDefaultButtons(db);
console.log(`Initialized database for tenant: ${tenantId}`);
```

### 2. `/scripts/seedDefaultButtons.js` (NEW)
Migration script to add default buttons to existing tenants.

**Features:**
- Processes all active tenants
- Skips buttons that already exist
- Provides detailed progress logging
- Shows summary of seeded vs skipped buttons
- Can be run multiple times safely (idempotent)

## Usage

### For New Tenants
✅ **Automatic** - No action needed!

When a tenant is created through the Super Admin dashboard:
1. Tenant database is initialized
2. Collections are created
3. Indexes are set up
4. **Default buttons are automatically seeded**
5. Tenant is ready to use

### For Existing Tenants

#### Option 1: Run Migration Script
```bash
cd "FPT Chatbot 10"
node scripts/seedDefaultButtons.js
```

#### Option 2: Manual Seeding via MongoDB
If you need to add buttons to a specific tenant manually:

```javascript
// Connect to tenant database
const db = client.db('fpt_t_1234567890_xxxxx');

// Insert default buttons
await db.collection('chatbot_buttons').insertMany([
  {
    id: 'btn_talk_to_human',
    label: 'Speak to Expert',
    type: 'cta',
    description: 'Connect users with human support agents',
    location: 'welcome_screen',
    action_type: 'expert_support',
    is_system_button: true,
    is_active: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'btn_continue_ai',
    label: 'Continue with AI',
    type: 'cta',
    description: 'Start conversation with AI chatbot',
    location: 'welcome_screen',
    action_type: 'start_chat',
    is_system_button: true,
    is_active: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]);
```

## Migration Script Output

When you run `node scripts/seedDefaultButtons.js`, you'll see:

```
🚀 Starting Default Buttons Migration
This will add "Speak to Expert" and "Continue with AI" buttons to all tenants

🔗 Connected to MongoDB

📋 Found 5 active tenants

📍 Seeding default buttons for tenant: t_1234567890_xxxxx (fpt_t_1234567890_xxxxx)
  ✅ Seeded button: "Speak to Expert"
  ✅ Seeded button: "Continue with AI"
  📊 Result: 2 seeded, 0 already existed

📍 Seeding default buttons for tenant: t_0987654321_yyyyy (fpt_t_0987654321_yyyyy)
  ⏭️  Button "Speak to Expert" already exists, skipping
  ⏭️  Button "Continue with AI" already exists, skipping
  📊 Result: 0 seeded, 2 already existed

...

============================================================
📊 SUMMARY
============================================================
Total tenants processed: 5
  ✅ Successful: 5
  ❌ Failed: 0
  📝 Buttons seeded: 8
  ⏭️  Buttons already existed: 2
============================================================

✨ Migration complete!
🔌 Disconnected from MongoDB

✅ All done!
```

## Button Properties Explained

### `id`
- Unique identifier for the button
- Used for lookups and references
- Format: `btn_<action>_<detail>`

### `label`
- Text displayed on the button
- User-facing, should be clear and concise
- Can be customized by tenant admins

### `type`
- Button category
- `'cta'` = Call-to-Action button
- Helps with styling and behavior

### `description`
- Internal description for admins
- Explains what the button does
- Shows in admin panel

### `location`
- Where the button appears in the chatbot
- `'welcome_screen'` = Shows on initial chatbot load
- Can also be `'chat_window'`, `'footer'`, etc.

### `action_type`
- Defines the button's action
- `'expert_support'` = Triggers human agent request
- `'start_chat'` = Begins AI conversation
- Used by chatbot logic to handle clicks

### `is_system_button`
- `true` = Created and managed by system
- `false` = Created by tenant admin
- System buttons can have special protections

### `is_active`
- `true` = Button is visible and clickable
- `false` = Button is hidden/disabled
- Tenants can toggle this in admin panel

### `order_index`
- Controls button display order
- Lower numbers appear first
- Allows customizing button sequence

## Verifying Default Buttons

### Via Admin Panel
1. Login to tenant admin panel
2. Navigate to **Button Actions** page
3. You should see:
   - ✅ "Speak to Expert" button
   - ✅ "Continue with AI" button
   - Both marked as system buttons
   - Both set to active

### Via MongoDB
```javascript
// Connect to tenant database
const buttons = await db.collection('chatbot_buttons').find({
  is_system_button: true
}).toArray();

console.log(buttons);
// Should show 2 default buttons
```

### Via API
```bash
# Get tenant's buttons (requires authentication)
curl http://localhost:3000/api/button \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Customization by Tenants

Tenant admins can customize these default buttons:

### What Can Be Changed:
- ✅ `label` - Button text
- ✅ `description` - Internal description
- ✅ `is_active` - Show/hide button
- ✅ `order_index` - Button display order
- ✅ Connected forms or actions

### What Cannot Be Changed:
- ❌ `id` - System ID (used for references)
- ❌ `is_system_button` - Always true for defaults
- ⚠️ `action_type` - Should not change (breaks functionality)

## Troubleshooting

### Buttons Don't Appear in New Tenant
**Possible Causes:**
1. Database initialization failed
2. Seeding process was interrupted
3. Collection doesn't exist

**Solution:**
Run the migration script for that specific tenant:
```bash
node scripts/seedDefaultButtons.js
```

### Migration Script Fails
**Check:**
1. MongoDB connection string is correct
2. Master database is accessible
3. Tenant databases exist
4. User has write permissions

**Run with detailed logging:**
```javascript
// Edit the script to add more logs
console.log('Current tenant:', tenant);
console.log('Database name:', tenant.database_name);
```

### Duplicate Buttons
**Cause:** Script ran multiple times or manual insertion

**Solution:** The script checks for existing buttons, so duplicates shouldn't occur. If they do:

```javascript
// Remove duplicates
db.collection('chatbot_buttons').aggregate([
  {
    $group: {
      _id: "$id",
      uniqueIds: { $addToSet: "$_id" },
      count: { $sum: 1 }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  }
]).forEach(doc => {
  // Keep first, delete rest
  doc.uniqueIds.slice(1).forEach(id => {
    db.collection('chatbot_buttons').deleteOne({ _id: id });
  });
});
```

## Best Practices

### For Super Admins
1. ✅ Run migration script after upgrading system
2. ✅ Verify buttons exist in new tenants
3. ✅ Document any custom button requirements
4. ✅ Backup database before running migrations

### For Tenant Admins
1. ✅ Keep default buttons active for better UX
2. ✅ Customize labels to match your brand
3. ✅ Connect "Speak to Expert" to a form for lead capture
4. ✅ Test button functionality after changes

### For Developers
1. ✅ Always check if button exists before inserting
2. ✅ Use the `is_system_button` flag correctly
3. ✅ Maintain consistent `id` format
4. ✅ Add new default buttons to the seed function

## Future Enhancements

### Planned Features
- [ ] More default buttons (e.g., "View Pricing", "Download Brochure")
- [ ] Button templates for different industries
- [ ] Visual button editor in admin panel
- [ ] A/B testing for button effectiveness
- [ ] Button analytics (click rates, conversions)
- [ ] Multi-language button labels
- [ ] Custom button icons/colors

### Adding New Default Buttons

To add more default buttons in the future:

1. **Update the default buttons array** in `/src/services/multiTenantDatabaseService.ts`:
```typescript
private async seedDefaultButtons(db: Db): Promise<void> {
  const defaultButtons = [
    // Existing buttons...
    {
      id: 'btn_new_action',
      label: 'New Action',
      type: 'cta',
      description: 'Description of new action',
      // ... other properties
    }
  ];
  // ... rest of function
}
```

2. **Update migration script** at `/scripts/seedDefaultButtons.js`:
```javascript
const DEFAULT_BUTTONS = [
  // Existing buttons...
  {
    id: 'btn_new_action',
    // ... properties
  }
];
```

3. **Run migration** for existing tenants:
```bash
node scripts/seedDefaultButtons.js
```

## Related Documentation
- [Button Management Guide](./BUTTON_MANAGEMENT.md)
- [Multi-Tenant Setup](./MULTI_TENANT_SETUP.md)
- [Admin Panel Features](./TENANT_FACING_PAGES.md)

---

**Status**: ✅ Implemented & Tested  
**Last Updated**: November 29, 2025  
**Version**: 2.3.0
