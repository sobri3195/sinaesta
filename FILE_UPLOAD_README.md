# File Upload System - Sinaesta

## Overview

Sinaesta now includes a comprehensive file upload and storage system that supports images, documents, Excel files, and templates. The system includes automatic image optimization, file validation, secure storage, and an admin file management interface.

## Features

✅ **Multi-Provider Storage**
- Local file system storage (default)
- AWS S3 support
- MinIO support (self-hosted S3-compatible)
- Cloudflare R2 support

✅ **File Upload**
- Drag-and-drop interface
- Batch upload support (up to 10 files)
- Progress tracking
- File type validation
- Size limits enforcement
- Preview before upload

✅ **Image Optimization**
- Automatic resize to max 1920x1080
- WebP conversion for smaller file sizes
- Automatic thumbnail generation
- Quality compression (85% default)
- Up to 70-90% file size reduction

✅ **Security**
- File type whitelist validation
- Size limits (images: 5MB, documents: 10MB, Excel: 2MB)
- Malware scanning hooks
- Rate limiting
- Authentication required
- Filename sanitization

✅ **File Management**
- Admin panel for file management
- Search and filter files
- Bulk delete operations
- Storage statistics
- Download files
- Category organization

✅ **Storage Organization**
- `/uploads/images/` - Image files
- `/uploads/documents/` - Documents (PDF, DOC, etc.)
- `/uploads/templates/` - Excel templates
- `/uploads/users/` - User-specific files
- `/uploads/exams/` - Exam-related files

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit `.env` file:

```env
# File Upload Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Storage Configuration
STORAGE_PROVIDER=local

# For AWS S3/MinIO/Cloudflare R2 (optional)
# AWS_REGION=us-east-1
# S3_BUCKET=sinaesta-uploads
# S3_ENDPOINT=https://s3.amazonaws.com
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Run the Application

**Development (Frontend + Backend):**
```bash
npm run dev:all
```

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run server:watch
```

**Production:**
```bash
npm run build
npm run server
```

## API Endpoints

### Upload Single File
```
POST /api/upload
Headers:
  X-User-Id: <userId>
  X-User-Role: <userRole>
  X-User-Name: <userName>
Body: multipart/form-data
  file: <file>
  fileType: 'image' | 'document' | 'excel' | 'template'
  contextId: <optional context ID>
```

### Upload Multiple Files
```
POST /api/upload/batch
Headers: (same as above)
Body: multipart/form-data
  files[]: <files array>
  fileType: 'image' | 'document' | 'excel' | 'template'
  contextId: <optional context ID>
```

### Generate Presigned Upload URL
```
POST /api/upload/url
Headers: (same as above)
Body: JSON
{
  "filename": "example.jpg",
  "contentType": "image/jpeg",
  "category": "images",
  "expiresIn": 3600
}
```

### Get File Metadata
```
GET /api/files/:fileId
Headers: (same as above)
```

### List Files
```
GET /api/files?category=images&contextId=user123&limit=50
Headers: (same as above)
```

### Delete File (Admin only)
```
DELETE /api/files/:fileId
Headers: (same as above)
```

### Get Storage Statistics (Admin only)
```
GET /api/stats
Headers: (same as above)
```

## Frontend Components

### FileUpload Component

```tsx
import FileUpload from './components/FileUpload';

<FileUpload
  fileType="image"
  maxFiles={5}
  maxSize={5}
  contextId="exam-123"
  multiple={true}
  showPreview={true}
  onUploadComplete={(files) => {
    console.log('Uploaded files:', files);
  }}
  onUploadError={(error) => {
    console.error('Upload error:', error);
  }}
/>
```

### FileManager Component (Admin)

```tsx
import FileManager from './components/FileManager';

<FileManager currentUser={user} />
```

### ImagePreview Component

```tsx
import ImagePreview from './components/ImagePreview';

<ImagePreview
  url="https://example.com/image.jpg"
  alt="Description"
  showControls={true}
  maxWidth="800px"
  maxHeight="600px"
  onClose={() => console.log('Close preview')}
/>
```

## File Size Limits

| File Type | Max Size | Allowed Formats |
|-----------|----------|-----------------|
| Images    | 5 MB     | JPG, PNG, GIF, WebP |
| Documents | 10 MB    | PDF, DOC, DOCX, TXT |
| Excel     | 2 MB     | XLS, XLSX, CSV |
| Templates | 1 MB     | XLS, XLSX, CSV |

## Image Optimization

All uploaded images are automatically optimized:

1. **Resize**: Max 1920x1080px (maintains aspect ratio)
2. **Format**: Converted to WebP for better compression
3. **Quality**: 85% quality (balances size and visual quality)
4. **Thumbnails**: 200x200px thumbnails auto-generated
5. **File Size**: Typically 70-90% smaller than original

## Storage Providers

### Local Storage (Default)

Files stored in `/uploads` directory. Best for development and small deployments.

```env
STORAGE_PROVIDER=local
```

### AWS S3

```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
S3_BUCKET=sinaesta-uploads
S3_ENDPOINT=https://s3.amazonaws.com
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### MinIO (Self-hosted)

```env
STORAGE_PROVIDER=minio
AWS_REGION=us-east-1
S3_BUCKET=sinaesta-uploads
S3_ENDPOINT=http://localhost:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

### Cloudflare R2

```env
STORAGE_PROVIDER=cloudflare-r2
AWS_REGION=auto
S3_BUCKET=sinaesta-uploads
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
```

## Security Best Practices

1. **File Validation**: All files validated before upload
2. **Type Checking**: Only whitelisted MIME types allowed
3. **Size Limits**: Enforced at both frontend and backend
4. **Filename Sanitization**: Dangerous characters removed
5. **Rate Limiting**: Prevents abuse (50 uploads per 15 min)
6. **Authentication**: All endpoints require authentication
7. **Double Extension Prevention**: Files like `image.jpg.exe` blocked
8. **Directory Traversal Prevention**: Path manipulation blocked

## Adding Virus Scanning

To add virus scanning (ClamAV integration):

1. Install ClamAV:
```bash
sudo apt-get install clamav clamav-daemon
```

2. Add to `server/middleware/virusScanner.ts`:
```typescript
import { exec } from 'child_process';

export const scanFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec(`clamscan ${filePath}`, (error, stdout) => {
      if (error) {
        reject(new Error('Virus detected'));
      } else {
        resolve(true);
      }
    });
  });
};
```

3. Use in upload route:
```typescript
const isClean = await scanFile(filePath);
if (!isClean) {
  throw new Error('File contains malware');
}
```

## File Manager Access

**Admin Panel:**
1. Log in as Admin, Program Admin, or Mentor
2. Navigate to **File Manager** in the sidebar (under Organization section)
3. View all uploaded files, statistics, and manage storage

**Features:**
- Search files by name
- Filter by category (images, documents, templates)
- View storage statistics
- Download files
- Delete files (with confirmation)
- Bulk delete operations
- Refresh file list

## Usage in Exam Creator

The FileUpload component can be integrated into ExamCreator for question images:

```tsx
// In ExamCreator.tsx
<FileUpload
  fileType="image"
  maxFiles={1}
  contextId={`exam-${examId}`}
  onUploadComplete={(files) => {
    setQuestionImageUrl(files[0].url);
  }}
/>
```

## Troubleshooting

### Backend not starting

**Error**: "Cannot find module 'express'"

**Solution**: Run `npm install`

### CORS errors

**Error**: "Access-Control-Allow-Origin"

**Solution**: Check `FRONTEND_URL` in `.env` matches your frontend URL

### Upload fails

**Error**: "File too large"

**Solution**: Check file size limits in `server/utils/fileValidator.ts`

### Storage full

**Solution**: Run cleanup script or increase storage allocation

### Rate limit exceeded

**Error**: "Too many upload requests"

**Solution**: Wait 15 minutes or increase limits in `server/middleware/rateLimiter.ts`

## Future Enhancements

- [ ] File versioning
- [ ] Automatic backup to secondary storage
- [ ] CDN integration for faster delivery
- [ ] Advanced image editing (crop, rotate, filters)
- [ ] Video file support
- [ ] Automatic file expiry/cleanup
- [ ] File sharing with expiring links
- [ ] Upload from URL
- [ ] Clipboard paste upload
- [ ] Resume interrupted uploads

## Support

For issues or questions:
- Check the logs: `console.log` output in terminal
- Verify environment variables in `.env`
- Check file permissions on `/uploads` directory
- Review API endpoints in browser network tab
- Ensure backend server is running on port 3001

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Vite)   │
└────────┬────────┘
         │
         │ HTTP Requests
         │ (multipart/form-data)
         ▼
┌─────────────────┐
│   Backend       │
│  (Express.js)   │
├─────────────────┤
│ • Upload API    │
│ • Validation    │
│ • Optimization  │
│ • Rate Limiting │
└────────┬────────┘
         │
         │ File Storage
         ▼
┌─────────────────┐
│   Storage       │
├─────────────────┤
│ • Local FS      │
│ • AWS S3        │
│ • MinIO         │
│ • Cloudflare R2 │
└─────────────────┘
```

## License

Part of Sinaesta PPDS Exam Platform
