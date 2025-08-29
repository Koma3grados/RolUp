import { useEffect, useState } from "react";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

interface EditCharacterIconModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentIconUrl: string;
    onSave: (newIconUrl: string) => void;
    characterName: string;
}

export default function EditCharacterIconModal({
    isOpen,
    onClose,
    currentIconUrl,
    onSave,
    characterName
}: EditCharacterIconModalProps) {
    const [iconUrl, setIconUrl] = useState(currentIconUrl);
    const [showImageSelector, setShowImageSelector] = useState(false);

    const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

    useEffect(() => {
        if (iconUrl && !iconUrl.startsWith('http') && !imageCache[iconUrl]) {
            loadImageAsBase64(iconUrl);
        }
    }, [iconUrl, imageCache, loadImageAsBase64]);

    useDisableScroll(isOpen);

    const handleSelectImage = (imagePath: string) => {
        setIconUrl(imagePath);
    };

    const handleSave = () => {
        onSave(iconUrl);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                    <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-amber-900">
                            Cambiar icono de {characterName}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-500 hover:text-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={iconUrl || ""}
                                    onChange={(e) => setIconUrl(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Ruta de la imagen"
                                    readOnly
                                />
                                <button
                                    onClick={() => setShowImageSelector(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Seleccionar
                                </button>
                            </div>
                            {iconUrl && (
                                <div className="mt-4 flex justify-center">
                                    <ImageThumbnail
                                        file={{
                                            isDirectory: false,
                                            path: iconUrl,
                                            name: characterName || 'character',
                                            extension: iconUrl.split('.').pop() || ''
                                        }}
                                        imageCache={imageCache}
                                        loadingImages={loadingImages}
                                        size="lg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>

            <ImageSelectorModal
                isOpen={showImageSelector}
                onClose={() => setShowImageSelector(false)}
                onSelectImage={handleSelectImage}
            />
        </>
    );
}