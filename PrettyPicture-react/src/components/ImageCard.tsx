import React, { useState } from 'react';
import type { ImageItem } from '../types';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onClick,
  onCopy,
  onDelete,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-content2 cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-content2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error ? (
          <div className="aspect-square flex items-center justify-center bg-content2">
            <svg className="w-12 h-12 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.name}
            className={`w-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ aspectRatio: image.width && image.height ? `${image.width}/${image.height}` : 'auto' }}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-sm font-medium truncate mb-2">
            {image.name}
          </p>
          <div className="flex gap-2">
            {onCopy && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy();
                }}
                className="flex-1 py-1.5 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-colors"
              >
                复制链接
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="py-1.5 px-3 bg-danger/80 hover:bg-danger rounded-lg text-white text-xs font-medium transition-colors"
              >
                删除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
