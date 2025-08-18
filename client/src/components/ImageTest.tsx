import React from 'react';
import { getImageUrlSync } from '@/lib/image-utils';

const ImageTest = () => {
  const testImages = [
    '/objects/uploads/56af0d88-86af-47d5-ba07-6d4c63ac7319',
    '/objects/uploads/d63ae981-b3b5-43e5-bac0-1a1fb88ad9b7',
    '/objects/uploads/030cab72-f4f6-44e0-b9fe-1f7adee38cc8'
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Teste de Imagens</h2>
      {testImages.map((imagePath, index) => {
        const imageUrl = getImageUrlSync(imagePath);
        console.log(`Imagem ${index + 1}: ${imagePath} -> ${imageUrl}`);
        
        return (
          <div key={index} className="mb-4 p-4 border rounded">
            <p className="mb-2">
              <strong>Path original:</strong> {imagePath}
            </p>
            <p className="mb-2">
              <strong>URL gerada:</strong> {imageUrl}
            </p>
            <img 
              src={imageUrl} 
              alt={`Teste ${index + 1}`} 
              className="max-w-xs max-h-32 object-cover rounded border"
              onLoad={() => console.log(`Imagem ${index + 1} carregada com sucesso`)}
              onError={(e) => {
                console.error(`Erro ao carregar imagem ${index + 1}:`, e);
                console.error(`URL que falhou: ${imageUrl}`);
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ImageTest;