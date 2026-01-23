import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface StorageConfig {
  provider: 'local' | 's3' | 'minio' | 'cloudflare-r2';
  region?: string;
  bucket?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  useLocalFallback?: boolean;
  cdnUrl?: string;
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

  private getPublicUrl(category: string, filename: string, key: string): string {
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${key}`;
    }

    if (this.config.provider === 'local') {
      return `/uploads/${category}/${filename}`;
    }

    if (this.config.provider === 'cloudflare-r2') {
        // R2 often has a custom domain or uses the endpoint URL
        return `${this.config.endpoint}/${this.config.bucket}/${key}`;
    }

    return `https://${this.config.bucket}.s3.${this.config.region || 'us-east-1'}.amazonaws.com/${key}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    category: 'image' | 'document' | 'template' | 'user' | 'exam',
    contextId?: string,
    uploadedBy?: string
  ): Promise<UploadResult> {
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const key = contextId ? `${category}/${contextId}/${filename}` : `${category}/${filename}`;

    let url: string;
    let storagePath: string;

    if (this.config.provider === 'local') {
      // Local file system storage
      storagePath = this.getLocalPath(category, filename);
      const dir = path.dirname(storagePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(storagePath, file.buffer);
      url = this.getPublicUrl(category, filename, key);
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
          uploadedBy: uploadedBy || '',
          contextId: contextId || '',
        },
      };

      const result = await this.s3Client!.upload(params).promise();
      storagePath = result.Key;
      url = this.config.cdnUrl ? `${this.config.cdnUrl}/${result.Key}` : result.Location;
    }

    // Store metadata in DB
    await query(
      `INSERT INTO files (id, original_name, filename, mime_type, size, category, path, url, uploaded_by, context_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [fileId, file.originalname, filename, file.mimetype, file.size, category, storagePath, url, uploadedBy, contextId]
    );

    return {
      fileId,
      url,
      key,
      size: file.size,
      mimeType: file.mimetype,
      filename,
    };
  }

  async generatePresignedUrl(
    category: string,
    filename: string,
    expiresIn: number = 3600
  ): Promise<string> {
    if (this.config.provider === 'local') {
      return this.getPublicUrl(category, filename, `${category}/${filename}`);
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
    const res = await query('SELECT * FROM files WHERE id = $1', [fileId]);
    const metadata = res.rows[0];
    
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

    await query('DELETE FROM files WHERE id = $1', [fileId]);
    return true;
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    const res = await query('SELECT * FROM files WHERE id = $1', [fileId]);
    const row = res.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      originalName: row.original_name,
      filename: row.filename,
      mimeType: row.mime_type,
      size: parseInt(row.size),
      category: row.category,
      path: row.path,
      url: row.url,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.created_at).getTime(),
      contextId: row.context_id,
      tags: row.tags,
    };
  }

  async listFiles(
    category?: string,
    contextId?: string,
    limit: number = 50
  ): Promise<FileMetadata[]> {
    let sql = 'SELECT * FROM files';
    const params: any[] = [];
    const conditions: string[] = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (contextId) {
      params.push(contextId);
      conditions.push(`context_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const res = await query(sql, params);
    return res.rows.map(row => ({
      id: row.id,
      originalName: row.original_name,
      filename: row.filename,
      mimeType: row.mime_type,
      size: parseInt(row.size),
      category: row.category,
      path: row.path,
      url: row.url,
      uploadedBy: row.uploaded_by,
      uploadedAt: new Date(row.created_at).getTime(),
      contextId: row.context_id,
      tags: row.tags,
    }));
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, { count: number; size: number }>;
  }> {
    const res = await query(`
      SELECT 
        category, 
        COUNT(*) as count, 
        SUM(size) as size 
      FROM files 
      GROUP BY category
    `);

    const byCategory: Record<string, { count: number; size: number }> = {};
    let totalFiles = 0;
    let totalSize = 0;

    res.rows.forEach(row => {
      const count = parseInt(row.count);
      const size = parseInt(row.size);
      byCategory[row.category] = { count, size };
      totalFiles += count;
      totalSize += size;
    });

    return {
      totalFiles,
      totalSize,
      byCategory,
    };
  }

  async cleanupOrphanedFiles(): Promise<{ deleted: number }> {
    // This is a simplified version. A real version would check if the file is still referenced in other tables.
    // For now, let's just implement a placeholder that could be extended.
    // E.g. check against questions.image_url, users.avatar, etc.
    return { deleted: 0 };
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
