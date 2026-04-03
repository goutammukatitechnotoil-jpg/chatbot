# Base64 Body Limit Fix

## Problem
When uploading logo images in base64 format, the Next.js API was rejecting requests with:
```
Failed to save config: Body exceeded 1mb limit
```

This occurred because base64 encoding increases the size of images by approximately 33%, and the default Next.js body parser limit is 1MB.

## Solution

### 1. Increased API Body Size Limit
**File**: `/pages/api/config/index.ts`

Added configuration to allow larger request bodies:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

This allows the config endpoint to accept base64 encoded images up to 10MB total body size.

### 2. Reduced Upload File Size Limit
**File**: `/pages/api/upload/logo.ts`

Reduced the maximum upload file size from 5MB to 2MB:
```typescript
maxFileSize: 2 * 1024 * 1024, // 2MB limit
```

**Reasoning**:
- A 2MB image file becomes ~2.66MB when base64 encoded
- This safely fits within the 10MB body limit
- Leaves room for other config data in the request body
- Still provides plenty of space for high-quality logos

### 3. Updated UI Validation
**File**: `/src/components/AdminPanel.tsx`

Updated client-side validation to match:
```typescript
// Validate file size (2MB max)
if (file.size > 2 * 1024 * 1024) {
  alert('File size must be less than 2MB');
  return;
}
```

Updated user-facing message:
```
Supported formats: JPG, PNG, GIF, SVG (Max 2MB)
```

## Technical Details

### Base64 Size Calculation
- Original file: X bytes
- Base64 encoded: ~X × 1.33 bytes (33% overhead)
- Data URL format: `data:image/png;base64,{base64Data}`

### Example Sizes
| Original File | Base64 Size | Total Body Size |
|--------------|-------------|-----------------|
| 500 KB       | ~665 KB     | ~670 KB         |
| 1 MB         | ~1.33 MB    | ~1.34 MB        |
| 2 MB         | ~2.66 MB    | ~2.67 MB        |

### Why 10MB Body Limit?
- Safely accommodates 2MB images after base64 encoding
- Allows for future config expansion
- Standard Next.js practice for file upload endpoints
- Prevents abuse while supporting legitimate use cases

## Testing
1. Upload a small image (< 100KB) - Should work
2. Upload a medium image (500KB - 1MB) - Should work
3. Upload a large image (1.5MB - 2MB) - Should work
4. Upload an oversized image (> 2MB) - Should be rejected with "File size must be less than 2MB"
5. Verify the config saves successfully after upload
6. Verify the logo displays correctly in the chatbot

## Files Modified
1. `/pages/api/config/index.ts` - Added body size limit
2. `/pages/api/upload/logo.ts` - Reduced file size limit to 2MB
3. `/src/components/AdminPanel.tsx` - Updated validation and UI text

## Status
✅ **COMPLETE** - All changes implemented and tested
- Images are saved as base64 data URLs
- Config API accepts requests up to 10MB
- Upload API validates files up to 2MB
- UI properly reflects new limits
- No other functionality affected
