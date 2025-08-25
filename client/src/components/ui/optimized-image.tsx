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
    if (hasErrored && currentSrc === fallbackSrc) return; // Evita loops

    // Log mais silencioso para evitar spam no console
    if (src && !src.includes('placeholder-image.svg') && !src.includes('data:image')) {
      console.log(`Image failed to load: ${src}, using fallback: ${fallbackSrc}`);
    }

    setIsLoading(false);

    const errorMessage = typeof error === 'string' ? error : 
                        error instanceof Event ? 'Falha ao carregar imagem' :
                        'Falha ao carregar imagem';

    if (onError) {
      onError(errorMessage);
    }

    // Tentar carregar imagem de fallback
    if (fallbackSrc && fallbackSrc !== src && fallbackSrc !== currentSrc) {
      setCurrentSrc(fallbackSrc);
      setHasErrored(false); // Reset error state para tentar o fallback
    } else {
      setHasErrored(true);
    }
  }, [src, fallbackSrc, onError, hasErrored, currentSrc]);

  // Preload da imagem
  useEffect(() => {
    if (!src) {
      if (fallbackSrc) {
        setCurrentSrc(fallbackSrc);
        setHasErrored(false);
        setIsLoading(false);
      } else {
        setHasErrored(true);
        setIsLoading(false);
      }
      return;
    }

    // Reset states when src changes
    if (src !== currentSrc && !hasErrored) {
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
    }, 8000); // 8 segundo timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      if (img.src === currentSrc) { // Verificar se ainda é a imagem atual
        handleLoad();
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      if (img.src === currentSrc) { // Verificar se ainda é a imagem atual
        handleError();
      }
    };

    // Set src after event listeners are attached
    img.src = currentSrc;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src, currentSrc, fallbackSrc, handleLoad, handleError, hasErrored]);

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