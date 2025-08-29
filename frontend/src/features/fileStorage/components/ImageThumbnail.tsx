import { FolderIcon } from "@heroicons/react/24/outline";
import { FileIcon } from "lucide-react";

interface ImageThumbnailProps {
    file: {
        isDirectory: boolean;
        path: string;
        name: string;
        extension: string;
    };
    imageCache: Record<string, string>;
    loadingImages: Record<string, boolean>;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function ImageThumbnail({
    file,
    imageCache,
    loadingImages,
    size = "md",
    className = ""
}: ImageThumbnailProps) {
    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20"
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    if (file.isDirectory) {
        return (
            <FolderIcon
                className={`text-blue-500 flex-shrink-0 ${size === "sm" ? "h-6 w-6" : "h-8 w-8"} ${className}`}
            />
        );
    }

    const isExternalUrl = (url: string): boolean => {
        return url.startsWith('http://') || url.startsWith('https://');
    };

    return (
        <div className={`${sizeClasses[size]} bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}>
            {file.extension.match(/^(jpg|jpeg|png|gif|webp|svg)$/i) || isExternalUrl(file.path) ? (
                <>
                    {imageCache[file.path] ? (
                        <img
                            src={imageCache[file.path]}
                            alt={file.name}
                            className="w-full h-full object-fill"
                        />
                    ) : isExternalUrl(file.path) ? (
                        // Para URLs externas, cargar directamente
                        <img
                            src={file.path}
                            alt={file.name}
                            className="w-full h-full object-fill"
                            onError={(e) => {
                                // Si falla la carga, mostrar icono de archivo
                                e.currentTarget.style.display = 'none';
                                // Se podría añadir lógica para mostrar el FileIcon aquí
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            {loadingImages[file.path] ? (
                                <div className={`animate-pulse bg-gray-200 rounded ${sizeClasses[size]}`}></div>
                            ) : (
                                <FileIcon className={`text-gray-500 ${iconSizes[size]}`} />
                            )}
                        </div>
                    )}
                </>
            ) : (
                <FileIcon className={`text-gray-500 ${iconSizes[size]}`} />
            )}
        </div>
    );
}