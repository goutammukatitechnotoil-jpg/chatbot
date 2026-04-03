# Logo Upload Base64 - Testing Checklist

## ✅ Changes Applied

1. **API Body Limit**: Config endpoint now accepts up to 10MB requests
2. **Upload Size Limit**: Logo uploads limited to 2MB (prevents base64 exceeding body limit)
3. **UI Validation**: Updated to show 2MB limit
4. **Dev Server**: Restarted and running on http://localhost:3001

## 🧪 Test Steps

### Test 1: Small Image Upload (< 500KB)
1. Go to Admin Panel → Appearance
2. Click "Choose Image File"
3. Select a small image (< 500KB)
4. ✅ Should upload successfully
5. ✅ Preview should appear instantly
6. Click "Save Changes"
7. ✅ Config should save without errors
8. ✅ Logo should display in chatbot

### Test 2: Medium Image Upload (500KB - 1MB)
1. Upload a medium-sized image
2. ✅ Should upload successfully
3. ✅ Should save successfully
4. ✅ Should display correctly

### Test 3: Large Image Upload (1.5MB - 2MB)
1. Upload a large image (close to 2MB)
2. ✅ Should upload successfully
3. ✅ Should save successfully
4. ✅ Should display correctly

### Test 4: Oversized Image (> 2MB)
1. Try to upload an image larger than 2MB
2. ✅ Should show error: "File size must be less than 2MB"
3. ✅ Should NOT upload

### Test 5: Base64 Format Verification
1. Open browser DevTools → Network tab
2. Upload an image
3. Click "Save Changes"
4. Check the request to `/api/config`
5. ✅ `logoUrl` should start with `data:image/...;base64,`
6. ✅ Request should be accepted (200 OK)

### Test 6: Manual URL Still Works
1. Clear the logo preview
2. Enter a URL manually (e.g., `https://example.com/logo.png`)
3. Click "Save Changes"
4. ✅ Should save successfully
5. ✅ External URL should work

## 📊 Expected Behavior

### Upload Process
```
User selects file → Client validates (2MB max) → 
Upload to /api/upload/logo → Convert to base64 → 
Return data URL → Update preview → 
User clicks save → POST to /api/config (10MB limit) → 
Save to MongoDB → Success
```

### File Size Limits
- **Client validation**: 2MB max (before upload)
- **Server validation**: 2MB max (during upload)
- **Base64 size**: ~2.66MB max (after encoding)
- **API body limit**: 10MB max (total request size)

## 🔍 What to Check

- [ ] Small images upload and save successfully
- [ ] Large images (up to 2MB) work correctly
- [ ] Oversized images are rejected properly
- [ ] Base64 data is saved in config
- [ ] Logo displays correctly in chatbot
- [ ] Manual URLs still work
- [ ] No console errors
- [ ] No "Body exceeded 1mb limit" error

## 🎯 Success Criteria

✅ All image sizes up to 2MB upload successfully
✅ Base64 data is saved in MongoDB
✅ No body size limit errors
✅ Logo displays correctly
✅ Error messages are clear and helpful
✅ No impact on other appearance settings

## 🚀 Ready to Test

The dev server is running at: **http://localhost:3001**

Navigate to: Admin Panel → Appearance → Chatbot Logo section
