import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useImageMonitoring } from '@/hooks/use-image-monitoring';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onError?: (error: string) => void;
  loading?: 'lazy' | 'eager';
  [key: string]: any;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = '/placeholder-image.svg',
  className,
  onError,
  loading = 'lazy',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const { recordImageEvent } = useImageMonitoring();

  const handleError = useCallback(() => {
    if (!hasError && imageSrc !== fallbackSrc && retryCount < 2) {
      console.warn(`Failed to load image (attempt ${retryCount + 1}): ${imageSrc}`);
      
      // Record failure event
      recordImageEvent({
        url: imageSrc,
        success: false,
        error: `Failed to load image (attempt ${retryCount + 1})`,
        timestamp: new Date()
      });
      
      // Retry with a small delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageSrc(src); // Reset to original source
      }, 1000);
      
      return;
    }
    
    if (imageSrc !== fallbackSrc) {
      console.warn(`Switching to fallback image: ${fallbackSrc}`);
      setImageSrc(fallbackSrc);
      setHasError(true);
      setRetryCount(0);
      onError?.(`Failed to load: ${src}`);
    } else {
      // If fallback also fails, show error state
      setIsLoading(false);
      console.error(`Both image and fallback failed to load: ${src}`);
      
      // Record fallback failure event
      recordImageEvent({
        url: fallbackSrc,
        success: false,
        error: 'Fallback image also failed to load',
        timestamp: new Date()
      });
      
      onError?.(`Both image and fallback failed to load: ${src}`);
    }
  }, [src, fallbackSrc, hasError, onError, imageSrc, retryCount, recordImageEvent]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    
    // Record successful load event
    recordImageEvent({
      url: imageSrc,
      success: true,
      timestamp: new Date()
    });
  }, [imageSrc, recordImageEvent]);

  // Update image source when src prop changes
  useEffect(() => {
    if (src !== imageSrc) {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
      setRetryCount(0);
    }
  }, [src, imageSrc]);

  // Preload fallback image
  useEffect(() => {
    if (fallbackSrc && fallbackSrc !== '/placeholder-image.svg') {
      const img = new Image();
      img.src = fallbackSrc;
    }
  }, [fallbackSrc]);

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        {...props}
      />
      
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <div>Imagem não disponível</div>
            <div className="text-xs">{alt}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
