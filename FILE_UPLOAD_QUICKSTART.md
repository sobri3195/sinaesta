# File Upload System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Servers
```bash
npm run dev:all
```

This starts:
- Frontend on http://localhost:5173
- Backend on http://localhost:3001

### Step 3: Access File Manager
1. Open http://localhost:5173
2. Log in as Admin (use role switch modal)
3. Navigate to **File Manager** in sidebar (under Organization)
4. Start uploading files!

## 📁 Quick Usage Examples

### Upload Images
```tsx
import FileUpload from './components/FileUpload';

<FileUpload
  fileType="image"
  maxFiles={5}
  onUploadComplete={(files) => console.log('Uploaded:', files)}
/>
```

### Upload Documents
```tsx
<FileUpload
  fileType="document"
  maxSize={10}
  onUploadComplete={(files) => console.log('Uploaded:', files)}
/>
```

### Upload Excel Files
```tsx
<FileUpload
  fileType="excel"
  maxSize={2}
  onUploadComplete={(files) => console.log('Uploaded:', files)}
/>
```

## 🔑 Key Features

| Feature | Details |
|---------|---------|
| **Drag & Drop** | Just drag files into the upload zone |
| **Batch Upload** | Upload up to 10 files at once |
| **Image Optimization** | Automatic WebP conversion + thumbnails |
| **File Preview** | See images before uploading |
| **Progress Tracking** | Real-time upload progress bars |
| **File Management** | Admin panel to view/delete files |
| **Storage Stats** | Track storage usage by category |
| **Secure** | File validation + rate limiting |

## 📊 File Limits

| Type | Max Size | Formats |
|------|----------|---------|
| Images | 5 MB | JPG, PNG, GIF, WebP |
| Documents | 10 MB | PDF, DOC, DOCX, TXT |
| Excel | 2 MB | XLS, XLSX, CSV |

## 🎯 Common Use Cases

### 1. Add Images to Exam Questions
```tsx
// In ExamCreator component
<FileUpload
  fileType="image"
  contextId={`exam-${examId}`}
  onUploadComplete={(files) => {
    setQuestionImageUrl(files[0].url);
  }}
/>
```

### 2. Upload Profile Pictures
```tsx
// In Settings or Profile component
<FileUpload
  fileType="image"
  maxFiles={1}
  contextId={`user-${userId}`}
  onUploadComplete={(files) => {
    setProfilePicture(files[0].url);
  }}
/>
```

### 3. Upload Excel Templates
```tsx
// In ExcelImport component
<FileUpload
  fileType="excel"
  maxFiles={1}
  onUploadComplete={(files) => {
    processExcelFile(files[0]);
  }}
/>
```

## 🔧 Configuration

### Change Storage Provider

Edit `.env`:

**Local (default):**
```env
STORAGE_PROVIDER=local
```

**AWS S3:**
```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_BUCKET=sinaesta-uploads
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**MinIO (self-hosted):**
```env
STORAGE_PROVIDER=minio
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=sinaesta-uploads
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

### Adjust File Size Limits

Edit `server/utils/fileValidator.ts`:

```typescript
export const FILE_TYPE_RULES = {
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // Change to 10MB
    // ...
  },
};
```

### Change Rate Limits

Edit `server/middleware/rateLimiter.ts`:

```typescript
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Change to 100 uploads per 15 min
});
```

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `Cannot find module 'express'`

**Fix:**
```bash
npm install
```

### CORS Error

**Error:** `Access-Control-Allow-Origin`

**Fix:** Check `.env`:
```env
FRONTEND_URL=http://localhost:5173
```

### Upload Fails

**Error:** `File too large`

**Fix:** Check file size limits in `fileValidator.ts`

### Files Not Showing

**Fix:** Ensure backend server is running:
```bash
npm run server:watch
```

## 🎨 UI Components

### FileUpload Props

```typescript
interface FileUploadProps {
  fileType?: 'image' | 'document' | 'excel' | 'template';
  maxFiles?: number;           // Default: 10
  maxSize?: number;            // In MB, default varies by type
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  contextId?: string;          // e.g., userId, examId
  acceptedFormats?: string[];  // Override default formats
  multiple?: boolean;          // Default: true
  showPreview?: boolean;       // Default: true
}
```

### ImagePreview Props

```typescript
interface ImagePreviewProps {
  url: string;
  alt?: string;
  onClose?: () => void;
  showControls?: boolean;      // Default: true
  maxWidth?: string;           // Default: '800px'
  maxHeight?: string;          // Default: '600px'
}
```

## 📦 API Response Format

### Upload Success Response
```json
{
  "success": true,
  "file": {
    "fileId": "123e4567-e89b-12d3-a456-426614174000",
    "url": "/uploads/images/123e4567-e89b-12d3-a456-426614174000.webp",
    "filename": "123e4567-e89b-12d3-a456-426614174000.webp",
    "size": 245678,
    "mimeType": "image/webp"
  },
  "optimization": {
    "originalSize": 1234567,
    "optimizedSize": 245678,
    "savings": 80
  }
}
```

### Upload Error Response
```json
{
  "success": false,
  "error": "File too large. Maximum size is 5MB."
}
```

## 🚦 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Single Upload | 50 requests | 15 minutes |
| Batch Upload | 10 requests | 1 hour |
| Presigned URL | 100 requests | 5 minutes |
| General API | 100 requests | 15 minutes |

## 🔐 Security Features

✅ File type whitelist validation
✅ File size limits enforcement
✅ Filename sanitization
✅ Double extension prevention
✅ Directory traversal prevention
✅ Rate limiting
✅ Authentication required
✅ CORS protection
✅ Helmet security headers

## 📱 Mobile Support

The file upload system is fully responsive:

- **Desktop**: Drag & drop + file picker
- **Tablet**: Touch-friendly interface
- **Mobile**: Camera integration (iOS/Android)

## 🌐 Browser Support

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ✅ | Full support |
| Edge | ✅ | Full support |
| IE 11 | ❌ | Not supported |

## 📚 Additional Resources

- **Full Documentation**: See `FILE_UPLOAD_README.md`
- **API Reference**: `server/routes/upload.ts`
- **Component Examples**: `components/FileUpload.tsx`
- **Type Definitions**: `types.ts` (UploadedFile interface)

## 💡 Tips

1. **Always validate files on frontend** for better UX
2. **Use contextId** to organize files by user/exam
3. **Enable showPreview** for better user experience
4. **Images are auto-optimized** - no need to resize manually
5. **Check rate limits** if uploads fail
6. **Use batch upload** for multiple files
7. **Admin panel** shows all files and storage stats
8. **Delete unused files** to save storage space

## 🎓 Next Steps

1. Add file uploads to ExamCreator for question images
2. Add profile picture upload to Settings
3. Integrate into other components as needed
4. Configure cloud storage (S3/R2) for production
5. Set up CDN for faster delivery
6. Implement file cleanup jobs

## 🆘 Need Help?

- Check server logs in terminal
- Verify `.env` configuration
- Test API endpoints with Postman
- Check browser console for errors
- Review `FILE_UPLOAD_README.md` for detailed docs

---

**Ready to upload? Run `npm run dev:all` and start uploading!** 🚀
