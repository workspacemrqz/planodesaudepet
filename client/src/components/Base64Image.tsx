import React, { useState, useEffect } from 'react';

interface Base64ImageProps {
  type: 'network' | 'main' | 'about';
  id: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const Base64Image: React.FC<Base64ImageProps> = ({
  type,
  id,
  alt,
  className = '',
  fallbackSrc,
  onError,
  onLoad
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const response = await fetch(`/api/images/${type}/${id}`);
        
        if (!response.ok) {
          throw new Error('Image not found');
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        
        if (onLoad) {
          onLoad();
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setHasError(true);
        
        if (onError) {
          onError();
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadImage();
    }

    // Cleanup function
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [type, id, onLoad, onError]);

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded`}>
        <div className="w-full h-full bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (hasError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          onError={onError}
        />
      );
    }
    
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}>
        <span>Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

export default Base64Image;
