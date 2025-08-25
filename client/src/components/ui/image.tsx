"use client"

import React, { useState, useCallback } from 'react';
import { getImageUrlSync } from '@/lib/image-utils';

interface RobustImageProps {
  src: string | null | undefined;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onError?: (error: string) => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
}

export function RobustImage({
  src,
  alt,
  fallback = '/placeholder-image.svg',
  className = '',
  width,
  height,
  onError,
  onLoad,
  style,
  ...props
}: RobustImageProps) {
  // Use getImageUrlSync to validate and process the src
  const processedSrc = React.useMemo(() => {
    return getImageUrlSync(src, fallback);
  }, [src, fallback]);

  const [imgSrc, setImgSrc] = useState<string>(processedSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError && imgSrc !== fallback) {
      console.warn(`Image failed to load: ${imgSrc}, using fallback: ${fallback}`);
      setImgSrc(fallback);
      setHasError(true);
      if (onError) {
        onError('Falha ao carregar imagem');
      }
    }
  }, [imgSrc, fallback, hasError, onError]);

  const handleLoad = useCallback(() => {
    setHasError(false);
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Atualizar src quando mudar, usando processamento seguro
  React.useEffect(() => {
    const newProcessedSrc = getImageUrlSync(src, fallback);
    if (newProcessedSrc !== imgSrc) {
      setImgSrc(newProcessedSrc);
      setHasError(false);
    }
  }, [src, fallback, imgSrc]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}

export default RobustImage;
