import { useEffect, useState } from "react";
import { FolderIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { fileStorageAPI, type FileInfo } from "@/features/fileStorage/services/fileStorage";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import toast from "react-hot-toast";
import api from "@/api/axios";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { FileIcon } from "lucide-react";

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imagePath: string) => void;
}

export default function ImageSelectorModal({ isOpen, onClose, onSelectImage }: ImageSelectorModalProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  useDisableScroll(isOpen);

  // Cargar imagen como Base64
  const loadImageAsBase64 = async (filePath: string) => {
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
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    } finally {
      setLoadingImages(prev => ({ ...prev, [filePath]: false }));
    }
  };

  // Cargar archivos del directorio actual
  const loadFiles = async (path: string = "") => {
    try {
      setLoading(true);
      const data = await fileStorageAPI.listFiles(path);
      setFiles(data);
    } catch (error) {
      toast.error("Error al cargar archivos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar imágenes cuando cambian los archivos
  useEffect(() => {
    const loadImages = async () => {
      const imageFiles = files.filter(file =>
        !file.isDirectory &&
        file.extension.match(/^(jpg|jpeg|png|gif|webp|svg)$/i) &&
        !imageCache[file.path]
      );

      for (const file of imageFiles) {
        const base64 = await loadImageAsBase64(file.path);
        if (base64) {
          setImageCache(prev => ({ ...prev, [file.path]: base64 }));
        }
      }
    };

    if (files.length > 0) {
      loadImages();
    }
  }, [files]);

  // Navegar a una carpeta
  const navigateToFolder = (folderName: string) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  // Volver atrás
  const goBack = () => {
    if (!currentPath) return;

    const pathParts = currentPath.split('/');
    pathParts.pop();
    const newPath = pathParts.join('/');

    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  // Seleccionar imagen
  const handleSelectImage = (imagePath: string) => {
    onSelectImage(imagePath);
    onClose();
  };

  // Cargar archivos al montar el componente
  useEffect(() => {
    if (isOpen) {
      loadFiles(currentPath);
    }
  }, [currentPath, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Seleccionar imagen</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra de navegación */}
        <div className="flex items-center gap-2 mb-4">
          {currentPath && (
            <button
              onClick={goBack}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Volver atrás"
            >
              <ArrowUpIcon className="h-5 w-5" />
            </button>
          )}
          <span className="text-sm text-gray-600">
            {currentPath || "Raíz"}
          </span>
        </div>

        {/* Lista de archivos */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : files.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">
              {currentPath ? "Esta carpeta está vacía" : "No hay archivos"}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.path}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (file.isDirectory) {
                      navigateToFolder(file.name);
                    } else if (file.extension.match(/^(jpg|jpeg|png|gif|webp|svg)$/i)) {
                      handleSelectImage(file.path);
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {file.isDirectory ? (
                      <FolderIcon className="h-12 w-12 text-blue-500" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {file.extension.match(/^(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                          <>
                            {imageCache[file.path] ? (
                              <img
                                src={imageCache[file.path]}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {loadingImages[file.path] ? (
                                  <div className="animate-pulse bg-gray-200 w-8 h-8 rounded"></div>
                                ) : (
                                  <FileIcon className="h-8 w-8 text-gray-500" />
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <FileIcon className="h-8 w-8 text-gray-500" />
                        )}
                      </div>
                    )}

                    <div className="text-center">
                      <h3 className="font-medium text-sm truncate w-full">{file.name}</h3>
                      {!file.isDirectory && (
                        <p className="text-xs text-gray-500">
                          {file.extension.toUpperCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}