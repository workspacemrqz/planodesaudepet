import React, { useState, useEffect } from 'react';

interface ImageDebugProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageDebug: React.FC<ImageDebugProps> = ({ src, alt, className = '' }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ Image loaded successfully: ${src}`);
      setImageStatus('success');
    };
    
    img.onerror = () => {
      console.error(`❌ Image failed to load: ${src}`);
      setImageStatus('error');
      setErrorMessage('Failed to load image');
    };
    
    img.src = src;
  }, [src]);

  if (imageStatus === 'loading') {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  if (imageStatus === 'error') {
    return (
      <div className={`${className} bg-red-100 border border-red-300 rounded flex items-center justify-center`}>
        <span className="text-red-600 text-sm">❌ {errorMessage}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => {
        console.error(`❌ Image error after load: ${src}`);
        setImageStatus('error');
        setErrorMessage('Error after load');
      }}
    />
  );
};

export default ImageDebug;
