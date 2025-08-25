import React, { useState, useEffect } from 'react';

interface Base64ImageDisplayProps {
  base64Data: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const Base64ImageDisplay: React.FC<Base64ImageDisplayProps> = ({
  base64Data,
  alt,
  className = '',
  fallbackSrc = '/placeholder-image.svg',
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (base64Data && base64Data.startsWith('data:image/')) {
      setImageSrc(base64Data);
      setIsLoading(false);
      setHasError(false);
      if (onLoad) {
        onLoad();
      }
    } else if (base64Data) {
      // Se não for um data URL válido, tratar como erro
      setHasError(true);
      setIsLoading(false);
      if (onError) {
        onError();
      }
    } else {
      // Sem dados, usar fallback
      setImageSrc(fallbackSrc);
      setIsLoading(false);
    }
  }, [base64Data, fallbackSrc, onLoad, onError]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      if (onError) {
        onError();
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded flex items-center justify-center`}>
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  if (hasError && imageSrc === fallbackSrc) {
    return (
      <div className={`${className} bg-gray-100 rounded flex items-center justify-center`}>
        <div className="text-gray-400 text-sm text-center">
          <div>Imagem não disponível</div>
          <div className="text-xs">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={() => {
        setIsLoading(false);
        setHasError(false);
        if (onLoad) {
          onLoad();
        }
      }}
    />
  );
};

export default Base64ImageDisplay;
