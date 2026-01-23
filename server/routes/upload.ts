import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getStorageService } from '../services/storageService';
import imageOptimizationService from '../services/imageOptimizationService';
import fileValidator from '../utils/fileValidator';
import {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} from '../middleware/uploadMiddleware';
import {
  uploadRateLimiter,
  bulkUploadRateLimiter,
  presignedUrlRateLimiter,
} from '../middleware/rateLimiter';
import { virusScanMiddleware } from '../middleware/virusScanner';
import { authenticateUser, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Single file upload
router.post(
  '/upload',
  uploadRateLimiter,
  authenticateUser,
  uploadSingle,
  virusScanMiddleware,
  handleUploadError,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      const { fileType = 'image', contextId } = req.body;

      // Validate file
      const validation = fileValidator.validateFile(req.file, fileType);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'File validation failed',
          details: validation.errors,
        });
      }

      const storageService = getStorageService();
      let fileToUpload = req.file;

      // Optimize images
      if (imageOptimizationService.isImage(req.file.mimetype)) {
        const optimized = await imageOptimizationService.optimizeImage(req.file.buffer, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85,
          format: 'webp',
          generateThumbnail: true,
        });

        // Use optimized image
        fileToUpload = {
          ...req.file,
          buffer: optimized.optimized.buffer,
          mimetype: 'image/webp',
          size: optimized.optimized.size,
          originalname: req.file.originalname.replace(/\.[^.]+$/, '.webp'),
        };

        // Also upload thumbnail if generated
        if (optimized.thumbnail) {
          const thumbnailFile = {
            ...req.file,
            buffer: optimized.thumbnail.buffer,
            mimetype: 'image/webp',
            size: optimized.thumbnail.size,
            originalname: `thumb_${req.file.originalname.replace(/\.[^.]+$/, '.webp')}`,
          };

          await storageService.uploadFile(
            thumbnailFile as Express.Multer.File,
            'image',
            contextId
          );
        }
      }

      // Upload file
      const categoryMap: Record<string, 'image' | 'document' | 'template' | 'user' | 'exam'> = {
        'image': 'image',
        'document': 'document',
        'excel': 'template',
        'template': 'template',
      };
      const result = await storageService.uploadFile(
        fileToUpload,
        categoryMap[fileType] || 'image',
        contextId || req.user?.id,
        req.user?.id
      );

      res.json({
        success: true,
        file: result,
        optimization: imageOptimizationService.isImage(req.file.mimetype)
          ? {
              originalSize: req.file.size,
              optimizedSize: fileToUpload.size,
              savings: Math.round(
                ((req.file.size - fileToUpload.size) / req.file.size) * 100
              ),
            }
          : undefined,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Upload failed',
      });
    }
  }
);

// Batch upload
router.post(
  '/upload/batch',
  bulkUploadRateLimiter,
  authenticateUser,
  uploadMultiple,
  virusScanMiddleware,
  handleUploadError,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided',
        });
      }

      const { fileType = 'image', contextId } = req.body;

      // Validate all files
      const batchValidation = fileValidator.validateBatch(req.files, fileType, 10);
      if (!batchValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Batch validation failed',
          details: batchValidation.errors,
          fileErrors: batchValidation.fileErrors,
        });
      }

      const storageService = getStorageService();
      const results = [];
      const errors = [];

      for (const file of req.files) {
        try {
          let fileToUpload = file;

          // Optimize images
          if (imageOptimizationService.isImage(file.mimetype)) {
            const optimized = await imageOptimizationService.optimizeImage(file.buffer);
            fileToUpload = {
              ...file,
              buffer: optimized.optimized.buffer,
              mimetype: 'image/webp',
              size: optimized.optimized.size,
              originalname: file.originalname.replace(/\.[^.]+$/, '.webp'),
            };
          }

          const categoryMap: Record<string, 'image' | 'document' | 'template' | 'user' | 'exam'> = {
            'image': 'image',
            'document': 'document',
            'excel': 'template',
            'template': 'template',
          };
          const result = await storageService.uploadFile(
            fileToUpload,
            categoryMap[fileType] || 'image',
            contextId || req.user?.id,
            req.user?.id
          );

          results.push({
            originalName: file.originalname,
            ...result,
          });
        } catch (error: any) {
          errors.push({
            file: file.originalname,
            error: error.message,
          });
        }
      }

      res.json({
        success: errors.length === 0,
        uploaded: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error('Batch upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Batch upload failed',
      });
    }
  }
);

// Generate presigned upload URL
router.post(
  '/upload/url',
  presignedUrlRateLimiter,
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { filename, contentType, category = 'images', expiresIn = 3600 } = req.body;

      if (!filename || !contentType) {
        return res.status(400).json({
          success: false,
          error: 'Filename and contentType are required',
        });
      }

      // Sanitize filename
      const sanitizedFilename = fileValidator.sanitizeFilename(filename);
      const uniqueFilename = `${uuidv4()}_${sanitizedFilename}`;

      const storageService = getStorageService();
      const { url, key } = await storageService.generateUploadUrl(
        category,
        uniqueFilename,
        contentType,
        expiresIn
      );

      res.json({
        success: true,
        uploadUrl: url,
        key,
        filename: uniqueFilename,
        expiresIn,
      });
    } catch (error: any) {
      console.error('Presigned URL error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate upload URL',
      });
    }
  }
);

// Get file metadata
router.get(
  '/files/:fileId',
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
      const storageService = getStorageService();
      const metadata = await storageService.getFileMetadata(fileId);

      if (!metadata) {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }

      res.json({
        success: true,
        file: metadata,
      });
    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get file',
      });
    }
  }
);

// List files
router.get(
  '/files',
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { category, contextId, limit = 50 } = req.query;
      const storageService = getStorageService();
      
      const files = await storageService.listFiles(
        typeof category === 'string' ? category : undefined,
        typeof contextId === 'string' ? contextId : undefined,
        Number(limit)
      );

      res.json({
        success: true,
        files,
        count: files.length,
      });
    } catch (error: any) {
      console.error('List files error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list files',
      });
    }
  }
);

// Delete file (admin only)
router.delete(
  '/files/:fileId',
  authenticateUser,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
      const storageService = getStorageService();
      
      await storageService.deleteFile(fileId);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete file',
      });
    }
  }
);

// Get storage statistics (admin only)
router.get(
  '/stats',
  authenticateUser,
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const storageService = getStorageService();
      const stats = await storageService.getStorageStats();

      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error('Stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get statistics',
      });
    }
  }
);

export default router;
