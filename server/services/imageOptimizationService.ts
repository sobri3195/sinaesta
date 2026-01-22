import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface OptimizedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export interface OptimizationResult {
  original: OptimizedImage;
  optimized: OptimizedImage;
  thumbnail?: OptimizedImage;
}

class ImageOptimizationService {
  async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = 'webp',
      generateThumbnail = true,
      thumbnailSize = 200,
    } = options;

    // Get original image info
    const originalImage = sharp(buffer);
    const originalMetadata = await originalImage.metadata();

    // Optimize main image
    let optimizedPipeline = sharp(buffer);

    // Resize if needed
    if (
      (originalMetadata.width && originalMetadata.width > maxWidth) ||
      (originalMetadata.height && originalMetadata.height > maxHeight)
    ) {
      optimizedPipeline = optimizedPipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to target format and compress
    let optimizedBuffer: Buffer;
    if (format === 'webp') {
      optimizedBuffer = await optimizedPipeline.webp({ quality }).toBuffer();
    } else if (format === 'jpeg') {
      optimizedBuffer = await optimizedPipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    } else {
      optimizedBuffer = await optimizedPipeline.png({ quality }).toBuffer();
    }

    const optimizedMetadata = await sharp(optimizedBuffer).metadata();

    const result: OptimizationResult = {
      original: {
        buffer,
        format: originalMetadata.format || 'unknown',
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0,
        size: buffer.length,
      },
      optimized: {
        buffer: optimizedBuffer,
        format,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        size: optimizedBuffer.length,
      },
    };

    // Generate thumbnail if requested
    if (generateThumbnail) {
      const thumbnailBuffer = await sharp(buffer)
        .resize(thumbnailSize, thumbnailSize, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();

      result.thumbnail = {
        buffer: thumbnailBuffer,
        format: 'webp',
        width: thumbnailMetadata.width || 0,
        height: thumbnailMetadata.height || 0,
        size: thumbnailBuffer.length,
      };
    }

    return result;
  }

  async generateThumbnail(buffer: Buffer, size: number = 200): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async convertToWebP(buffer: Buffer, quality: number = 85): Promise<Buffer> {
    return sharp(buffer).webp({ quality }).toBuffer();
  }

  async getImageInfo(buffer: Buffer): Promise<{
    format: string;
    width: number;
    height: number;
    size: number;
  }> {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format || 'unknown',
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
    };
  }

  isImage(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  }
}

export default new ImageOptimizationService();
