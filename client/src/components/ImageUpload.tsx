import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  type: 'network' | 'main' | 'about';
  id: string;
  currentImage?: string;
  onUploadSuccess: (imageData: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
  maxSize?: number; // em MB
  acceptedTypes?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  id,
  currentImage,
  onUploadSuccess,
  onUploadError,
  className = '',
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    if (!acceptedTypes.includes(file.type)) {
      onUploadError(`Tipo de arquivo não suportado. Use: ${acceptedTypes.join(', ')}`);
      return;
    }

    // Validar tamanho
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/images/upload/${type}/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      
      if (result.success) {
        onUploadSuccess(result.imageInfo);
        setPreview(null);
      } else {
        throw new Error('Upload falhou');
      }

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = async () => {
    try {
      const response = await fetch(`/api/images/${type}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUploadSuccess('');
        setPreview(null);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      onUploadError('Erro ao remover imagem');
    }
  };

  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Área de upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? triggerFileInput : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div>
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Clique para selecionar
              </span>{' '}
              ou arraste e solte
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP até {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Preview da imagem atual */}
      {(currentImage || preview) && (
        <div className="mt-4">
          <div className="relative inline-block">
            <img
              src={preview || currentImage}
              alt="Preview"
              className="max-w-full h-auto rounded-lg shadow-sm"
              style={{ maxHeight: '200px' }}
            />
            {preview && (
              <button
                onClick={() => setPreview(null)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            )}
          </div>
          
          {currentImage && !preview && (
            <button
              onClick={removeImage}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Remover Imagem
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
