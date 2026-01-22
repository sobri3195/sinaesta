export interface FileValidationRules {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  minSizeBytes?: number;
  allowedExtensions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const FILE_TYPE_RULES: Record<string, FileValidationRules> = {
  image: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    minSizeBytes: 1024, // 1KB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  },
  document: {
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  },
  excel: {
    allowedMimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedExtensions: ['.xls', '.xlsx', '.csv'],
  },
  template: {
    allowedMimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    maxSizeBytes: 1 * 1024 * 1024, // 1MB
    allowedExtensions: ['.xls', '.xlsx', '.csv'],
  },
};

export class FileValidator {
  validateFile(
    file: Express.Multer.File,
    fileType: 'image' | 'document' | 'excel' | 'template'
  ): ValidationResult {
    const errors: string[] = [];
    const rules = FILE_TYPE_RULES[fileType];

    if (!rules) {
      errors.push(`Unknown file type: ${fileType}`);
      return { isValid: false, errors };
    }

    // Check MIME type
    if (!rules.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(
        `Invalid file type. Allowed types: ${rules.allowedMimeTypes.join(', ')}`
      );
    }

    // Check file extension
    if (rules.allowedExtensions) {
      const ext = this.getFileExtension(file.originalname).toLowerCase();
      if (!rules.allowedExtensions.includes(ext)) {
        errors.push(
          `Invalid file extension. Allowed extensions: ${rules.allowedExtensions.join(', ')}`
        );
      }
    }

    // Check file size
    if (file.size > rules.maxSizeBytes) {
      errors.push(
        `File too large. Maximum size: ${this.formatBytes(rules.maxSizeBytes)}`
      );
    }

    if (rules.minSizeBytes && file.size < rules.minSizeBytes) {
      errors.push(
        `File too small. Minimum size: ${this.formatBytes(rules.minSizeBytes)}`
      );
    }

    // Additional security checks
    if (this.hasDoubleExtension(file.originalname)) {
      errors.push('Double file extensions are not allowed for security reasons');
    }

    if (this.hasSuspiciousName(file.originalname)) {
      errors.push('File name contains suspicious characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateBatch(
    files: Express.Multer.File[],
    fileType: 'image' | 'document' | 'excel' | 'template',
    maxFiles: number = 10
  ): { isValid: boolean; errors: string[]; fileErrors: Record<string, string[]> } {
    const errors: string[] = [];
    const fileErrors: Record<string, string[]> = {};

    if (files.length > maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${maxFiles}`);
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file, fileType);
      if (!validation.isValid) {
        fileErrors[`file_${index}_${file.originalname}`] = validation.errors;
      }
    });

    return {
      isValid: errors.length === 0 && Object.keys(fileErrors).length === 0,
      errors,
      fileErrors,
    };
  }

  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
  }

  private hasDoubleExtension(filename: string): boolean {
    const dangerousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js)\./i,
      /\.(php|asp|jsp|cgi)\./i,
    ];
    return dangerousPatterns.some(pattern => pattern.test(filename));
  }

  private hasSuspiciousName(filename: string): boolean {
    // Check for directory traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return true;
    }

    // Check for null bytes
    if (filename.includes('\0')) {
      return true;
    }

    // Check for control characters
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1f\x7f]/.test(filename)) {
      return true;
    }

    return false;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  sanitizeFilename(filename: string): string {
    // Remove any directory paths
    filename = filename.replace(/^.*[\\\/]/, '');
    
    // Remove or replace dangerous characters
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    // Prevent hidden files
    if (filename.startsWith('.')) {
      filename = '_' + filename;
    }
    
    // Limit length
    if (filename.length > 255) {
      const ext = this.getFileExtension(filename);
      filename = filename.substring(0, 255 - ext.length) + ext;
    }
    
    return filename;
  }
}

export default new FileValidator();
