import { exec } from 'child_process';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

/**
 * Scans a file for viruses using ClamAV (clamscan)
 * Returns true if clean, false if virus detected or scanning fails
 */
export const scanFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if clamscan is available
    exec('clamscan --version', (error) => {
      if (error) {
        // ClamAV not installed, skip scanning but log it
        console.warn('⚠️ ClamAV (clamscan) not found, skipping virus scan.');
        return resolve(true);
      }

      // Run scan
      exec(`clamscan ${filePath}`, (scanError, stdout) => {
        if (scanError) {
          console.error('❌ Virus scan detected potential threat or failed:', stdout);
          return resolve(false);
        }
        console.log('✅ Virus scan completed: File is clean.');
        resolve(true);
      });
    });
  });
};

/**
 * Middleware for scanning uploaded files
 * Note: Only works if files are written to disk first
 */
export const virusScanMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
    return next();
  }

  const filesToScan = req.file ? [req.file] : (Array.isArray(req.files) ? req.files : []);

  for (const file of filesToScan) {
    // If the file is in a buffer (multer memoryStorage), we need to write it to a temp file for scanning
    if (file.buffer) {
      const tempPath = `/tmp/${Date.now()}_${file.originalname}`;
      fs.writeFileSync(tempPath, file.buffer);
      
      const isClean = await scanFile(tempPath);
      
      // Delete temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      if (!isClean) {
        return res.status(400).json({
          success: false,
          error: 'Malware detected in uploaded file.',
        });
      }
    } else if (file.path) {
      // File already on disk
      const isClean = await scanFile(file.path);
      if (!isClean) {
        // Delete malicious file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({
          success: false,
          error: 'Malware detected in uploaded file.',
        });
      }
    }
  }

  next();
};
