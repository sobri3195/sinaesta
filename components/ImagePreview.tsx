import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
  alt?: string;
  onClose?: () => void;
  showControls?: boolean;
  maxWidth?: string;
  maxHeight?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  alt = 'Image preview',
  onClose,
  showControls = true,
  maxWidth = '800px',
  maxHeight = '600px',
}) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
        onClick={toggleFullscreen}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={url}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          style={{ transform: `scale(${zoom / 100})` }}
          onClick={(e) => e.stopPropagation()}
        />
        {showControls && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white px-3 font-medium">{zoom}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white bg-opacity-30 mx-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded text-white"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div className="relative" style={{ maxWidth, maxHeight }}>
        <img
          src={url}
          alt={alt}
          className="w-full h-full object-contain rounded-lg border border-gray-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
        />

        {showControls && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Zoom Out"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 font-medium">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Zoom In"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Fullscreen"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {onClose && (
              <>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
