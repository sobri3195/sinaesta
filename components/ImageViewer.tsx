
import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setScale(prev => {
        const newScale = Math.max(prev - 0.5, 1);
        if (newScale === 1) setPosition({ x: 0, y: 0 }); // Reset pos on full zoom out
        return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 h-96 w-full select-none">
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          src={src} 
          alt={alt} 
          className="transition-transform duration-100 max-w-full max-h-full object-contain"
          style={{ 
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)` 
          }}
          draggable={false}
        />
      </div>

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm p-2 rounded-full border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleZoomOut} className="p-2 text-white hover:bg-gray-700 rounded-full" disabled={scale <= 1}>
          <ZoomOut size={18} />
        </button>
        <span className="text-xs font-mono text-gray-300 w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} className="p-2 text-white hover:bg-gray-700 rounded-full" disabled={scale >= 4}>
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-4 bg-gray-600 mx-1"></div>
        <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="p-2 text-white hover:bg-gray-700 rounded-full" title="Reset">
          <Maximize2 size={18} />
        </button>
      </div>

      {scale > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1 pointer-events-none">
            <Move size={12} /> Pan Mode Active
        </div>
      )}
    </div>
  );
};

export default ImageViewer;
