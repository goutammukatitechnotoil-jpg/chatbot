# 🎨 Logo Upload Feature - Visual Guide

## Where to Find It

```
Admin Panel
└── Appearance Tab
    └── Chatbot Logo Section ← HERE!
```

## UI Layout

```
╔══════════════════════════════════════════════════════════════╗
║                      APPEARANCE TAB                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [Color Theme Settings]                                      ║
║                                                              ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ CHATBOT LOGO                                           │ ║
║  │                                                        │ ║
║  │ Set the logo image that appears in the chatbot header │ ║
║  │                                                        │ ║
║  │ ┌────────────────────────────────────────────────────┐ │ ║
║  │ │ Upload Logo Image                                  │ │ ║
║  │ │                                                    │ │ ║
║  │ │ ┌────────────────────────────────────────────────┐ │ │ ║
║  │ │ │  📷  Choose Image File                        │ │ │ ║ ← NEW UPLOAD BUTTON
║  │ │ └────────────────────────────────────────────────┘ │ │ ║
║  │ │                                                    │ │ ║
║  │ │ Supported formats: JPG, PNG, GIF, SVG (Max 5MB)   │ │ ║
║  │ └────────────────────────────────────────────────────┘ │ ║
║  │                                                        │ ║
║  │                   ────── OR ──────                     │ ║ ← NEW DIVIDER
║  │                                                        │ ║
║  │ ┌────────────────────────────────────────────────────┐ │ ║
║  │ │ Logo URL or Path                                  │ │ ║
║  │ │                                                    │ │ ║
║  │ │ [/logo.png or https://example.com/logo.png]       │ │ ║ ← EXISTING URL INPUT
║  │ │                                                    │ │ ║
║  │ │ Use a relative path or a full URL                 │ │ ║
║  │ └────────────────────────────────────────────────────┘ │ ║
║  │                                                        │ ║
║  │ ┌────────────────────────────────────────────────────┐ │ ║
║  │ │ Preview                                           │ │ ║
║  │ │                                                    │ │ ║
║  │ │ ┌──────┐                                          │ │ ║
║  │ │ │ LOGO │  MCP Flezi                               │ │ ║
║  │ │ │ IMG  │  Virtual Assistant                       │ │ ║
║  │ │ └──────┘                                          │ │ ║
║  │ └────────────────────────────────────────────────────┘ │ ║
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
║  [Other Appearance Settings...]                              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## User Journey

### Method 1: Upload Image (NEW!)

```
Step 1: Click Upload Button
┌────────────────────────┐
│  📷  Choose Image File │  ← Click here
└────────────────────────┘

       ↓

Step 2: Select File
┌─────────────────────────────┐
│ 📁 File Picker              │
│                             │
│ ○ my-logo.png      150 KB   │ ← Select
│ ○ company-logo.jpg 2.3 MB   │
│ ○ brand.svg        45 KB    │
│                             │
│ [Cancel]    [Open]          │
└─────────────────────────────┘

       ↓

Step 3: Auto Upload & Update
┌────────────────────────┐
│ Uploading...           │
└────────────────────────┘
       ↓
┌────────────────────────┐
│ ✅ Upload Success!     │
│ URL: /uploads/logos/   │
│ logo_123456_abc.png    │
└────────────────────────┘

       ↓

Step 4: Preview Updates
┌──────────────────┐
│  [New Logo]      │  ← Shows immediately
│  MCP Flezi       │
└──────────────────┘

       ↓

Step 5: Save
┌────────────────┐
│ Save Changes   │  ← Click to persist
└────────────────┘
```

### Method 2: Enter URL (Existing)

```
Step 1: Type/Paste URL
┌──────────────────────────────────────┐
│ https://example.com/logo.png         │ ← Type or paste
└──────────────────────────────────────┘

       ↓

Step 2: Preview Updates
┌──────────────────┐
│  [Logo from URL] │
│  MCP Flezi       │
└──────────────────┘

       ↓

Step 3: Save
┌────────────────┐
│ Save Changes   │  ← Click to persist
└────────────────┘
```

## File Requirements

```
╔═══════════════════════════════════════╗
║  ✅ ACCEPTED                          ║
╠═══════════════════════════════════════╣
║  Format:  JPG, JPEG, PNG, GIF, SVG    ║
║  Size:    ≤ 5 MB                      ║
║  Ratio:   Any (square recommended)    ║
║  Colors:  RGB, RGBA (transparency OK) ║
╚═══════════════════════════════════════╝

╔═══════════════════════════════════════╗
║  ❌ REJECTED                          ║
╠═══════════════════════════════════════╣
║  Format:  PDF, WEBP, TIFF, BMP        ║
║  Size:    > 5 MB                      ║
║  Type:    Non-image files             ║
╚═══════════════════════════════════════╝
```

## Error Messages

```
File Too Large:
┌──────────────────────────────────┐
│ ⚠️  File size must be less than │
│     5MB                          │
└──────────────────────────────────┘

Wrong File Type:
┌──────────────────────────────────┐
│ ⚠️  Please select an image file  │
└──────────────────────────────────┘

Upload Failed:
┌──────────────────────────────────┐
│ ❌ Failed to upload logo.        │
│    Please try again.             │
└──────────────────────────────────┘
```

## Example Files

### ✅ Good Examples

```
✓ company-logo.png    (250 KB, 200x200px)
✓ brand-icon.svg      (45 KB, vector)
✓ logo.jpg            (180 KB, 150x150px)
✓ transparent.png     (320 KB, 256x256px with alpha)
```

### ❌ Bad Examples

```
✗ huge-image.jpg      (8 MB - too large)
✗ document.pdf        (not an image)
✗ photo.webp          (unsupported format)
✗ banner.tiff         (unsupported format)
```

## Tips for Best Results

```
📏 Size:         100x100 to 200x200 pixels (square)
📦 Format:       PNG with transparency OR SVG
🎨 Background:   Transparent or solid color
📁 File Size:    < 500 KB (smaller is better)
🔍 Quality:      High resolution for retina displays
```

## Technical Flow

```
User Action              Backend                   Result
─────────────────────────────────────────────────────────
Select File        →     Validate type         →   ✅/❌
                  →     Validate size         →   ✅/❌
                  →     Generate unique name  →   ✅
Upload            →     Save to /public/      →   ✅
                  →     Return URL            →   ✅
Update Preview    →     Display image         →   ✅
Save Changes      →     Store in database     →   ✅
```

---

## 🎯 Quick Reference

| Action | Location | What Happens |
|--------|----------|--------------|
| **Upload** | Click "Choose Image File" | Opens file picker |
| **Validate** | On file select | Checks type & size |
| **Upload** | Automatic | Sends to server |
| **Preview** | Instant | Shows new logo |
| **Save** | Click "Save Changes" | Persists to DB |

---

**Created**: December 7, 2025  
**Status**: ✅ Production Ready
