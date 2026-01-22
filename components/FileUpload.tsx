import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, File, Image as ImageIcon, FileText, Loader } from 'lucide-react';

export interface FileUploadProps {
  fileType?: 'image' | 'document' | 'excel' | 'template';
  maxFiles?: number;
  maxSize?: number; // in MB
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  contextId?: string;
  acceptedFormats?: string[];
  multiple?: boolean;
  showPreview?: boolean;
}

export interface UploadedFile {
  fileId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadProgress?: number;
  uploadError?: string;
  uploadResult?: UploadedFile;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const FileUpload: React.FC<FileUploadProps> = ({
  fileType = 'image',
  maxFiles = 10,
  maxSize = 5,
  onUploadComplete,
  onUploadError,
  contextId,
  acceptedFormats,
  multiple = true,
  showPreview = true,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultAcceptedFormats = {
    image: '.jpg,.jpeg,.png,.gif,.webp',
    document: '.pdf,.doc,.docx,.txt',
    excel: '.xls,.xlsx,.csv',
    template: '.xls,.xlsx,.csv',
  };

  const accept = acceptedFormats?.join(',') || defaultAcceptedFormats[fileType];

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }
    return null;
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validatedFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        onUploadError?.(error);
        continue;
      }

      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.uploadStatus = 'pending';
      fileWithPreview.uploadProgress = 0;

      if (showPreview && file.type.startsWith('image/')) {
        fileWithPreview.preview = await createFilePreview(file);
      }

      validatedFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...validatedFiles]);
  }, [files.length, maxFiles, maxSize, showPreview, onUploadError]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: FileWithPreview, index: number): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (contextId) {
      formData.append('contextId', contextId);
    }

    try {
      // Get user info from localStorage (mock auth)
      const currentUser = JSON.parse(localStorage.getItem('sinaesta_current_user') || '{}');

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'X-User-Id': currentUser.id || 'guest',
          'X-User-Role': currentUser.role || 'STUDENT',
          'X-User-Name': currentUser.name || 'Guest',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setFiles(prev => {
        const updated = [...prev];
        updated[index].uploadStatus = 'success';
        updated[index].uploadProgress = 100;
        updated[index].uploadResult = data.file;
        return updated;
      });

      return data.file;
    } catch (error: any) {
      setFiles(prev => {
        const updated = [...prev];
        updated[index].uploadStatus = 'error';
        updated[index].uploadError = error.message || 'Upload failed';
        return updated;
      });
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const uploadPromises = files.map((file, index) => {
      if (file.uploadStatus !== 'pending') return Promise.resolve(null);
      
      setFiles(prev => {
        const updated = [...prev];
        updated[index].uploadStatus = 'uploading';
        return updated;
      });

      return uploadFile(file, index);
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((r): r is PromiseFulfilledResult<UploadedFile> => 
          r.status === 'fulfilled' && r.value !== null
        )
        .map(r => r.value);

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
      }

      const failedUploads = results.filter(r => r.status === 'rejected');
      if (failedUploads.length > 0) {
        onUploadError?.(`${failedUploads.length} file(s) failed to upload`);
      }
    } catch (error: any) {
      onUploadError?.(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
  };

  const hasFilesToUpload = files.some(f => f.uploadStatus === 'pending');

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
        </p>
        <p className="text-sm text-gray-500">
          {fileType === 'image' && `Images (JPG, PNG, GIF, WebP) • Max ${maxSize}MB each`}
          {fileType === 'document' && `Documents (PDF, DOC, DOCX, TXT) • Max ${maxSize}MB each`}
          {fileType === 'excel' && `Excel files (XLS, XLSX, CSV) • Max ${maxSize}MB each`}
          {fileType === 'template' && `Template files (XLS, XLSX, CSV) • Max ${maxSize}MB each`}
        </p>
        {multiple && (
          <p className="text-xs text-gray-400 mt-1">
            Maximum {maxFiles} files
          </p>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">
              Files ({files.length})
            </h4>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview or Icon */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-400">
                    {getFileIcon(file)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatBytes(file.size)}
                </p>

                {/* Progress Bar */}
                {file.uploadStatus === 'uploading' && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${file.uploadProgress || 0}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {file.uploadStatus === 'error' && file.uploadError && (
                  <p className="text-xs text-red-600 mt-1">
                    {file.uploadError}
                  </p>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {file.uploadStatus === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {file.uploadStatus === 'uploading' && (
                  <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                )}
                {file.uploadStatus === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {file.uploadStatus === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {hasFilesToUpload && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium
            transition-colors duration-200
            ${isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Uploading...
            </span>
          ) : (
            `Upload ${files.filter(f => f.uploadStatus === 'pending').length} File(s)`
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
