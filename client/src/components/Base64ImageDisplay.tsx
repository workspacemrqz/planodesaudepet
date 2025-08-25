import React, { useState, useCallback, useRef, useEffect } from 'react';

interface Base64ImageDisplayProps {
  base64String: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: string) => void;
  onLoad?: () => void;
}

const isValidBase64Image = (base64String: string): boolean => {
  if (!base64String || typeof base64String !== 'string') {
    return false;
  }

  // Verificar se tem o formato correto de data URL
  const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;

  // Se não tem o prefix, verificar se é Base64 válido
  if (!dataUrlPattern.test(base64String)) {
    try {
      const base64Content = base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const decoded = btoa(atob(base64Content));
      return decoded === base64Content && base64Content.length > 0;
    } catch {
      return false;
    }
  }

  return true;
};

const processBase64Image = (base64String: string): string => {
  if (!base64String) {
    throw new Error('Base64 string is required');
  }

  // Se já está no formato correto, retornar como está
  if (base64String.startsWith('data:image/')) {
    return base64String;
  }

  // Se é apenas o conteúdo Base64, adicionar o prefix
  try {
    const base64Content = base64String.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    // Verificar se é Base64 válido
    atob(base64Content);

    // Adicionar prefix padrão (assumir JPEG se não especificado)
    return `data:image/jpeg;base64,${base64Content}`;
  } catch {
    throw new Error('Invalid Base64 image format');
  }
};

export const Base64ImageDisplay: React.FC<Base64ImageDisplayProps> = ({
  base64String,
  alt,
  className = '',
  fallbackSrc = '/placeholder-image.svg',
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const processImage = useCallback(async () => {
    if (!base64String) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      onError?.('Base64 string is empty');
      return;
    }

    try {
      // Verificar se é uma imagem Base64 válida
      if (!isValidBase64Image(base64String)) {
        throw new Error('Invalid Base64 image format');
      }

      // Processar a string Base64
      const processedImage = processBase64Image(base64String);
      setImageSrc(processedImage);
      setHasError(false);
    } catch (error) {
      console.error('Error processing Base64 image:', error);
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [base64String, fallbackSrc, onError]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    if (!hasError) {
      console.warn(`Base64 image failed to load, using fallback: ${fallbackSrc}`);
      setHasError(true);
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      onError?.('Failed to load processed Base64 image');
    }
  }, [hasError, fallbackSrc, onError]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
};