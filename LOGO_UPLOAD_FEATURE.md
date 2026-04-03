# Logo Upload Feature

## Overview
The Appearance Section now supports uploading custom logo images directly through the Admin Panel, in addition to the existing URL/path input method.

## Features Added

### 1. Image Upload in Admin Panel
- **Location**: Appearance Section → Chatbot Logo
- **File Support**: JPG, PNG, GIF, SVG
- **Max File Size**: 5MB
- **Upload Method**: Drag & drop or click to browse

### 2. Dual Input Options
Users can now set their logo in two ways:
1. **Upload Image**: Click "Choose Image File" button to upload from local computer
2. **Enter URL**: Use the existing URL/path input field

These options are separated by an "OR" divider for clarity.

### 3. API Endpoint
**Endpoint**: `POST /api/upload/logo`
- Accepts multipart/form-data with image file
- Validates file type (images only)
- Validates file size (5MB max)
- Generates unique filename with timestamp
- Returns public URL path

**Request**:
```javascript
const formData = new FormData();
formData.append('logo', file);

const response = await fetch('/api/upload/logo', {
  method: 'POST',
  body: formData,
});
```

**Response**:
```json
{
  "success": true,
  "url": "/uploads/logos/logo_1234567890_abc123.png",
  "filename": "logo_1234567890_abc123.png"
}
```

### 4. File Storage
- **Directory**: `/public/uploads/logos/`
- **Filename Format**: `logo_{timestamp}_{random}.{ext}`
- **Public Access**: Files are accessible via `/uploads/logos/filename.ext`

### 5. Git Configuration
The `.gitignore` file has been updated to:
- Ignore uploaded logo files (`public/uploads/logos/*`)
- Keep the directory structure (`.gitkeep` file is tracked)

## Usage

### For Administrators
1. Navigate to **Appearance Section** in Admin Panel
2. Scroll to **Chatbot Logo** section
3. Choose one of two methods:
   - **Upload**: Click "Choose Image File" and select an image (≤5MB)
   - **URL**: Enter a logo URL or path in the text field
4. Preview the logo in real-time
5. Click **Save Changes** to apply

### File Requirements
- **Supported Formats**: JPEG, PNG, GIF, SVG
- **Maximum Size**: 5 MB
- **Recommended Dimensions**: 100x100px to 200x200px (square)
- **Recommended Format**: PNG with transparent background

## Technical Implementation

### Frontend (AdminPanel.tsx)
```tsx
// File input with upload handler
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Upload
    const formData = new FormData();
    formData.append('logo', file);
    const response = await fetch('/api/upload/logo', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (response.ok && data.url) {
      setLocalConfig({ ...localConfig, logoUrl: data.url });
    }
  }}
/>
```

### Backend (pages/api/upload/logo.ts)
- Uses `formidable` library for file upload handling
- Validates file type and size
- Generates unique filenames to prevent conflicts
- Stores files in `/public/uploads/logos/`
- Returns public URL path

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **File Size Limit**: 5MB maximum to prevent abuse
3. **Unique Filenames**: Prevents file conflicts and overwriting
4. **Public Directory**: Files are served from `/public` for direct access

## Dependencies Added
```json
{
  "dependencies": {
    "formidable": "^3.x.x"
  },
  "devDependencies": {
    "@types/formidable": "^3.x.x"
  }
}
```

## File Structure
```
/public
  /uploads
    /logos
      .gitkeep
      logo_1234567890_abc123.png  (uploaded files)
      
/pages
  /api
    /upload
      logo.ts  (upload endpoint)
      
/src
  /components
    AdminPanel.tsx  (updated with upload UI)
```

## Migration Notes
- Existing logo URLs continue to work without changes
- No database schema changes required
- Backward compatible with all existing configurations
- Uploaded files are persisted on the server

## Future Enhancements (Optional)
- [ ] Image cropping/resizing before upload
- [ ] Support for drag-and-drop upload
- [ ] Cloud storage integration (S3, Cloudinary, etc.)
- [ ] Image optimization/compression
- [ ] Upload progress indicator
- [ ] Multiple logo variants (light/dark mode)

## Testing Checklist
- [x] Upload image file (PNG, JPG, GIF, SVG)
- [x] Validate file size limit (5MB)
- [x] Validate file type (images only)
- [x] Preview uploaded logo immediately
- [x] Save and persist logo URL to config
- [x] Verify logo appears in chatbot widget
- [x] Test existing URL input still works
- [x] Test fallback to default logo on error
