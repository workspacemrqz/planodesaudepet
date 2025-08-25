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
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasErrored, setHasErrored] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { recordImageEvent } = useImageMonitoring();

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasErrored(false);
    // Record successful load event
    recordImageEvent({
      url: currentSrc,
      success: true,
      timestamp: new Date()
    });
  }, [currentSrc, recordImageEvent]);

  const handleError = useCallback((error?: string | Event) => {
    if (hasErrored) return; // Evita loops

    // Log mais silencioso para evitar spam no console
    if (src && !src.includes('placeholder-image.svg')) {
      console.log(`Image failed to load: ${src}, using fallback: ${fallbackSrc}`);
    }

    setHasErrored(true);
    setIsLoading(false);

    if (onError) {
      onError(typeof error === 'string' ? error : 'Falha ao carregar imagem');
    }

    // Tentar carregar imagem de fallback
    if (fallbackSrc && fallbackSrc !== src && fallbackSrc !== currentSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [src, fallbackSrc, onError, hasErrored, currentSrc]);

  // Preload da imagem
  useEffect(() => {
    if (!src) {
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasErrored(false);
      } else {
        setHasErrored(true);
      }
      return;
    }

    // Reset states when src changes
    if (src !== currentSrc) {
      setIsLoading(true);
      setHasErrored(false);
      setCurrentSrc(src);
    }

    // Skip preloading for placeholder images
    if (src.includes('placeholder-image.svg') || src.includes('data:image')) {
      setIsLoading(false);
      setHasErrored(false);
      return;
    }

    const img = new Image();
    const timeoutId = setTimeout(() => {
      handleError('Timeout ao carregar imagem');
    }, 10000); // 10 segundo timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      handleLoad();
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      handleError();
    };

    // Set src after event listeners are attached
    img.src = src;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, currentSrc, fallbackSrc, handleLoad, handleError]);

  return (
    <div className={cn('relative', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}

      <img
        src={currentSrc}
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

      {hasErrored && currentSrc === fallbackSrc && (
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