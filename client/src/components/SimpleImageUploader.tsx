import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Image } from "lucide-react";

interface SimpleImageUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  hasImage?: boolean;
  buttonClassName?: string;
}

export function SimpleImageUploader({
  onFileSelect,
  isUploading = false,
  hasImage = false,
  buttonClassName,
}: SimpleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5242880) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }
      
      onFileSelect(file);
    }
    // Reset input to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className={buttonClassName}
        data-testid="button-upload-image"
      >
        <div className="flex items-center justify-center gap-2 py-2">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              {hasImage ? (
                <>
                  <Image className="h-4 w-4" />
                  <span>Trocar Imagem</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Selecionar Imagem</span>
                </>
              )}
            </>
          )}
        </div>
      </Button>
    </>
  );
}