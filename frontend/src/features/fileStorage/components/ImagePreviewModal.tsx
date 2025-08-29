import { XMarkIcon } from "@heroicons/react/24/outline";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  imageCache: Record<string, string>;
  files: Array<{ path: string; extension: string }>;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imagePath,
  imageCache,
  files
}: ImagePreviewModalProps) {
  useDisableScroll(isOpen);

  if (!isOpen) return null;

  const fileInfo = files.find(f => f.path === imagePath);

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10 p-2"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Imagen */}
        {imageCache[imagePath] ? (
          <img
            src={imageCache[imagePath]}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        ) : (
          <div className="flex items-center justify-center w-96 h-96 bg-gray-800 rounded-lg">
            <div className="text-white">Cargando imagen...</div>
          </div>
        )}

        {/* Información de la imagen */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg">
          <p className="text-sm truncate">{imagePath.split('/').pop()}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-300">
              {fileInfo?.extension.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}