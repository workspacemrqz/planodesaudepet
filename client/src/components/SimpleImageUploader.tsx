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
      console.log('=== DEBUG UPLOAD ===');
      console.log('Nome do arquivo:', file.name);
      console.log('Tipo MIME:', file.type);
      console.log('Tamanho:', file.size, 'bytes');
      console.log('Última modificação:', new Date(file.lastModified));
      
      // Validate file type (PNG, JPEG, JPG)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      console.log('Tipos permitidos:', allowedTypes);
      console.log('Tipo do arquivo está na lista?', allowedTypes.includes(file.type));
      
      // Also check file extension as fallback
      const fileName = file.name.toLowerCase();
      const hasValidExtension = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
      console.log('Extensão do arquivo é válida?', hasValidExtension);
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        console.log('ERRO: Tipo de arquivo não permitido');
        alert(`Por favor, selecione apenas arquivos PNG, JPEG ou JPG. Tipo detectado: ${file.type}, Nome: ${file.name}`);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5242880) {
        console.log('ERRO: Arquivo muito grande');
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }
      
      console.log('Arquivo válido, chamando onFileSelect');
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
        accept="image/png,image/jpeg,image/jpg,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full hover:bg-[#1f5a5c] text-white disabled:opacity-50 bg-[#145759]"
        data-testid="button-upload-image"
      >
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
      </Button>
    </>
  );
}