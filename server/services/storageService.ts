import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageConfig {
  provider: 'local' | 's3' | 'minio' | 'cloudflare-r2';
  region?: string;
  bucket?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  useLocalFallback?: boolean;
}

export interface UploadResult {
  fileId: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  filename: string;
}

export interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  category: string;
  path: string;
  url: string;
  uploadedBy?: string;
  uploadedAt: number;
  contextId?: string; // userId, examId, etc.
  tags?: string[];
}

class StorageService {
  private s3Client?: AWS.S3;
  private config: StorageConfig;
  private fileDatabase: Map<string, FileMetadata> = new Map(); // In-memory DB (use real DB in production)

  constructor(config: StorageConfig) {
    this.config = config;

    if (config.provider !== 'local') {
      this.s3Client = new AWS.S3({
        endpoint: config.endpoint,
        region: config.region || 'us-east-1',
        credentials: {
          accessKeyId: config.accessKeyId || '',
          secretAccessKey: config.secretAccessKey || '',
        },
        s3ForcePathStyle: config.provider === 'minio',
        signatureVersion: 'v4',
      });
    }
  }

  private getLocalPath(category: string, filename: string): string {
    return path.join(process.cwd(), 'uploads', category, filename);
  }

  private getPublicUrl(category: string, filename: string): string {
    if (this.config.provider === 'local') {
      return `/uploads/${category}/${filename}`;
    }
    return `https://${this.config.bucket}.${this.config.endpoint}/${category}/${filename}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    category: 'image' | 'document' | 'template' | 'user' | 'exam',
    contextId?: string
  ): Promise<UploadResult> {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const key = contextId ? `${category}/${contextId}/${filename}` : `${category}/${filename}`;

    if (this.config.provider === 'local') {
      // Local file system storage
      const uploadPath = this.getLocalPath(category, filename);
      const dir = path.dirname(uploadPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(uploadPath, file.buffer);

      // Store metadata
      const metadata: FileMetadata = {
        id: fileId,
        originalName: file.originalname,
        filename,
        mimeType: file.mimetype,
        size: file.size,
        category,
        path: uploadPath,
        url: this.getPublicUrl(category, filename),
        uploadedAt: Date.now(),
        contextId,
      };
      this.fileDatabase.set(fileId, metadata);

      return {
        fileId,
        url: metadata.url,
        key,
        size: file.size,
        mimeType: file.mimetype,
        filename,
      };
    } else {
      // S3/MinIO/R2 storage
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.config.bucket!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: file.originalname,
          uploadedAt: Date.now().toString(),
        },
      };

      const result = await this.s3Client!.upload(params).promise();

      const metadata: FileMetadata = {
        id: fileId,
        originalName: file.originalname,
        filename,
        mimeType: file.mimetype,
        size: file.size,
        category,
        path: result.Key,
        url: result.Location,
        uploadedAt: Date.now(),
        contextId,
      };
      this.fileDatabase.set(fileId, metadata);

      return {
        fileId,
        url: result.Location,
        key: result.Key,
        size: file.size,
        mimeType: file.mimetype,
        filename,
      };
    }
  }

  async generatePresignedUrl(
    category: string,
    filename: string,
    expiresIn: number = 3600
  ): Promise<string> {
    if (this.config.provider === 'local') {
      // For local storage, return direct URL (no presigning needed)
      return this.getPublicUrl(category, filename);
    }

    const key = `${category}/${filename}`;
    const params = {
      Bucket: this.config.bucket!,
      Key: key,
      Expires: expiresIn,
    };

    return this.s3Client!.getSignedUrlPromise('getObject', params);
  }

  async generateUploadUrl(
    category: string,
    filename: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ url: string; key: string }> {
    const key = `${category}/${filename}`;

    if (this.config.provider === 'local') {
      // For local, return upload endpoint
      return {
        url: `/api/upload/direct/${category}/${filename}`,
        key,
      };
    }

    const params = {
      Bucket: this.config.bucket!,
      Key: key,
      Expires: expiresIn,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const url = await this.s3Client!.getSignedUrlPromise('putObject', params);
    return { url, key };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const metadata = this.fileDatabase.get(fileId);
    if (!metadata) {
      throw new Error('File not found');
    }

    if (this.config.provider === 'local') {
      if (fs.existsSync(metadata.path)) {
        fs.unlinkSync(metadata.path);
      }
    } else {
      const params = {
        Bucket: this.config.bucket!,
        Key: metadata.path,
      };
      await this.s3Client!.deleteObject(params).promise();
    }

    this.fileDatabase.delete(fileId);
    return true;
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return this.fileDatabase.get(fileId) || null;
  }

  async listFiles(
    category?: string,
    contextId?: string,
    limit: number = 50
  ): Promise<FileMetadata[]> {
    let files = Array.from(this.fileDatabase.values());

    if (category) {
      files = files.filter(f => f.category === category);
    }

    if (contextId) {
      files = files.filter(f => f.contextId === contextId);
    }

    return files
      .sort((a, b) => b.uploadedAt - a.uploadedAt)
      .slice(0, limit);
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, { count: number; size: number }>;
  }> {
    const files = Array.from(this.fileDatabase.values());
    const byCategory: Record<string, { count: number; size: number }> = {};

    let totalSize = 0;

    files.forEach(file => {
      totalSize += file.size;
      if (!byCategory[file.category]) {
        byCategory[file.category] = { count: 0, size: 0 };
      }
      byCategory[file.category].count++;
      byCategory[file.category].size += file.size;
    });

    return {
      totalFiles: files.length,
      totalSize,
      byCategory,
    };
  }
}

// Singleton instance
let storageInstance: StorageService | null = null;

export function initializeStorage(config: StorageConfig): StorageService {
  storageInstance = new StorageService(config);
  return storageInstance;
}

export function getStorageService(): StorageService {
  if (!storageInstance) {
    throw new Error('Storage service not initialized. Call initializeStorage first.');
  }
  return storageInstance;
}

export default StorageService;
