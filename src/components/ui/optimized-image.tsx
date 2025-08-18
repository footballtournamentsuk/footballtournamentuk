import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  placeholderColor?: string;
  sizes?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  placeholderColor = 'bg-muted',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const ext = baseSrc.split('.').pop();
    const basePath = baseSrc.replace(`.${ext}`, '');
    
    return [
      `${basePath}-400w.webp 400w`,
      `${basePath}-800w.webp 800w`,
      `${basePath}-1200w.webp 1200w`,
      `${basePath}-1600w.webp 1600w`
    ].join(', ');
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    >
      {/* Placeholder */}
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 animate-pulse rounded-md",
            placeholderColor
          )}
          style={{ width, height }}
        />
      )}

      {/* Optimized Image */}
      {!hasError && (
        <picture>
          {/* Modern formats first */}
          <source
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            type="image/webp"
          />
          
          {/* Fallback */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              "w-full h-full object-cover"
            )}
            style={{
              contentVisibility: priority ? "visible" : "auto",
            }}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "bg-muted text-muted-foreground text-sm"
        )}>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              📷
            </div>
            Image unavailable
          </div>
        </div>
      )}
    </div>
  );
};