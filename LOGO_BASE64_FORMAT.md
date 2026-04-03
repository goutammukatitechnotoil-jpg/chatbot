# Logo Upload Feature - Base64 Format

## Overview
The logo upload feature now converts uploaded images to **base64 format** and stores them directly in the configuration, eliminating the need for file storage management.

## Key Changes

### Base64 Storage Benefits
✅ **No file management** - Images stored as data URLs  
✅ **Portable** - Configuration is self-contained  
✅ **No broken links** - Image data travels with config  
✅ **Database-friendly** - Can be stored directly in MongoDB  
✅ **Backup-friendly** - Images included in config exports  

## How It Works

### Upload Process:
```
1. User selects image file
   ↓
2. File uploaded to temporary directory
   ↓
3. Server reads file as binary buffer
   ↓
4. Buffer converted to base64 string
   ↓
5. Base64 wrapped in data URL format
   ↓
6. Temporary file deleted
   ↓
7. Data URL returned to client
   ↓
8. Saved in config as logoUrl
```

### Data URL Format:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
```

### Example Response:
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBORw0KGgoAAAANSUh...",
  "filename": "logo.png",
  "mimeType": "image/png",
  "size": 12345
}
```

## Technical Implementation

### API Endpoint: `/api/upload/logo`

**Request:**
```javascript
const formData = new FormData();
formData.append('logo', imageFile);

const response = await fetch('/api/upload/logo', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBORw0KG...",
  "filename": "company-logo.png",
  "mimeType": "image/png",
  "size": 45678
}
```

### Backend Processing:

```typescript
// 1. Receive uploaded file
const uploadedFile = files.logo?.[0];

// 2. Read file as buffer
const fileBuffer = fs.readFileSync(uploadedFile.filepath);

// 3. Convert to base64
const base64Data = fileBuffer.toString('base64');

// 4. Create data URL
const base64Url = `data:${mimeType};base64,${base64Data}`;

// 5. Clean up temp file
fs.unlinkSync(uploadedFile.filepath);

// 6. Return data URL
return { url: base64Url };
```

### Storage in Config:

```javascript
// Config stored in database
{
  logoUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  // Image is now part of the config!
}
```

## Advantages

### 1. No File System Dependencies
- No need to manage uploaded files
- No broken links from missing files
- No cleanup required

### 2. Portable Configurations
- Export/import includes images
- Easy backups
- Migration-friendly

### 3. Database Storage
- Single source of truth
- Atomic updates
- Version control possible

### 4. Simplified Deployment
- No separate file storage needed
- Works with any hosting
- No CDN required for small logos

## File Size Considerations

### Recommended Sizes:
- ✅ **Small logos**: 50-200 KB (optimal)
- ⚠️ **Medium logos**: 200-500 KB (acceptable)
- ❌ **Large logos**: > 500 KB (not recommended)

### Why Size Matters:
- Base64 increases size by ~33%
- Stored in database (affects DB size)
- Sent with every config request
- Should be reasonable for logos

### Best Practices:
1. Use PNG with transparency
2. Optimize before upload
3. Keep under 200 KB
4. Use square dimensions (100x100 to 200x200px)

## Browser Support

Base64 data URLs are supported in:
- ✅ All modern browsers
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile browsers (iOS, Android)
- ✅ Internet Explorer 8+

## Usage Example

### In HTML:
```html
<img src="data:image/png;base64,iVBORw0KG..." alt="Logo" />
```

### In React:
```tsx
<img 
  src={config.logoUrl} 
  alt="Logo"
  className="w-16 h-16"
/>
```

### In CSS:
```css
.logo {
  background-image: url('data:image/png;base64,iVBORw0KG...');
}
```

## Temporary File Cleanup

Files are automatically cleaned up:
- ✅ Read and converted to base64
- ✅ Temporary file deleted immediately
- ✅ No files persist on server
- ✅ Directory: `/public/uploads/temp/` (gitignored)

## Database Storage

### MongoDB Document:
```javascript
{
  _id: ObjectId("..."),
  tenantId: "tenant_123",
  config: {
    logoUrl: "data:image/png;base64,iVBORw0KG...",
    chatbotName: "AI Assistant",
    primaryColor: "#f37021",
    // ... other config
  },
  updated_at: "2025-12-07T12:00:00Z"
}
```

### Size Impact:
- Small logo (100 KB file) → ~133 KB base64
- Medium logo (200 KB file) → ~266 KB base64
- Large logo (500 KB file) → ~666 KB base64

## Migration Notes

### Existing URLs Still Work:
```javascript
// These all work fine:
logoUrl: "/FPTSoftware.png"                    // ✅ Relative path
logoUrl: "https://example.com/logo.png"        // ✅ Absolute URL
logoUrl: "data:image/png;base64,iVBORw0KG..."  // ✅ Base64 (NEW!)
```

### Automatic Handling:
The system automatically detects the format:
- Starts with `/` → File path
- Starts with `http://` or `https://` → External URL
- Starts with `data:` → Base64 data URL

## Comparison

### File Storage (Old):
```
❌ Requires file system
❌ Files can be deleted
❌ Separate backup needed
❌ Broken links possible
✅ Smaller database
✅ Faster DB queries
```

### Base64 Storage (New):
```
✅ No file system needed
✅ Self-contained
✅ Included in backups
✅ No broken links
❌ Larger database (~33%)
❌ Slower DB queries (if huge)
```

## Performance

### Typical Logo (150 KB):
- File size: 150 KB
- Base64 size: ~200 KB
- Database impact: Minimal
- Load time: Negligible difference

### Trade-offs:
- **Small increase** in database size
- **Big decrease** in complexity
- **Better** portability
- **Simpler** deployment

## Security

### Validation:
✅ File type checked (images only)  
✅ File size limited (5 MB max)  
✅ MIME type validated  
✅ Temporary files cleaned  

### Safe Storage:
✅ No file system exposure  
✅ No directory traversal risks  
✅ Stored in database  
✅ Access controlled by config API  

## Testing

### Test Upload:
```bash
curl -X POST \
  http://localhost:3000/api/upload/logo \
  -F "logo=@/path/to/logo.png"
```

### Expected Response:
```json
{
  "success": true,
  "url": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "filename": "logo.png",
  "mimeType": "image/png",
  "size": 45678
}
```

## Troubleshooting

### Issue: "URI too long" error
**Solution**: Image is too large. Use smaller logo (<200 KB)

### Issue: Logo not displaying
**Solution**: Check if base64 string is complete (no truncation)

### Issue: Slow config loading
**Solution**: Optimize logo size, use compression

---

**Updated**: December 7, 2025  
**Format**: Base64 Data URLs  
**Storage**: Database (MongoDB)  
**Status**: ✅ Production Ready
