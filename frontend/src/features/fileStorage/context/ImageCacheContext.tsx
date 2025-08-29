import api from '@/api/axios';
import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface ImageCacheContextType {
  imageCache: Record<string, string>;
  loadingImages: Record<string, boolean>;
  loadImageAsBase64: (filePath: string) => Promise<void>;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

export const useImageCache = () => {
  const context = useContext(ImageCacheContext);
  if (!context) {
    throw new Error('useImageCache must be used within an ImageCacheProvider');
  }
  return context;
};

interface ImageCacheProviderProps {
  children: ReactNode;
}

export const ImageCacheProvider: React.FC<ImageCacheProviderProps> = ({ children }) => {
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const loadImageAsBase64 = async (filePath: string) => {
    if (imageCache[filePath]) return; // Si ya está cargada, la devolvemos

    try {
      setLoadingImages(prev => ({ ...prev, [filePath]: true }));

      const filename = filePath.split('/').pop() || '';
      const path = filePath.includes('/')
        ? filePath.substring(0, filePath.lastIndexOf('/'))
        : '';

      const response = await api.get(`/api/file-manager/image/${filename}?path=${encodeURIComponent(path)}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      setImageCache(prev => ({ ...prev, [filePath]: base64 }));
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [filePath]: false }));
    }
  };

  return (
    <ImageCacheContext.Provider value={{ imageCache, loadingImages, loadImageAsBase64 }}>
      {children}
    </ImageCacheContext.Provider>
  );
};