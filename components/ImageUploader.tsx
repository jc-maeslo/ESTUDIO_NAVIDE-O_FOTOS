
import React, { useCallback } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  images: ImageData[];
  setImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages }) => {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as 'File' to resolve 'unknown' property errors on lines 24 and 28
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            base64,
            mimeType: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, [setImages]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-images text-red-600"></i>
          Fotos de Referencia
        </h2>
        <span className="text-sm text-slate-500">{images.length} fotos seleccionadas</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
            <img src={img.base64} alt="Referencia" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ))}
        
        {images.length < 10 && (
          <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-red-400 hover:bg-red-50 cursor-pointer transition-all duration-200 group">
            <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 group-hover:text-red-500 mb-2"></i>
            <span className="text-sm font-medium text-slate-500 group-hover:text-red-600">Añadir Fotos</span>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
      
      {images.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-500">Sube las fotos originales de los niños para empezar.</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
