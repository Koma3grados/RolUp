import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FolderIcon, TrashIcon, PlusIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import { fileStorageAPI, type FileInfo } from "@/features/fileStorage/services/fileStorage";
import CreateFolderModal from "@/features/fileStorage/components/CreateFolderModal";
import ImagePreviewModal from "@/features/fileStorage/components/ImagePreviewModal";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

export default function AdminFileStoragePage() {
    const navigate = useNavigate();
    const [currentPath, setCurrentPath] = useState("");
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

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
                await loadImageAsBase64(file.path);
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

    // Subir archivo
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await fileStorageAPI.uploadFile(file, currentPath);
            toast.success('Archivo subido correctamente');
            loadFiles(currentPath);
        } catch (error) {
            toast.error('Error al subir archivo');
        }
    };

    // Crear carpeta
    const handleCreateFolder = async (folderName: string) => {
        if (!folderName.trim()) return;

        try {
            await fileStorageAPI.createDirectory(currentPath, folderName);
            toast.success('Carpeta creada correctamente');
            setShowCreateFolder(false);
            loadFiles(currentPath);
        } catch (error) {
            toast.error('Error al crear carpeta');
        }
    };

    // Eliminar archivo/carpeta
    const handleDelete = async (path: string, isDirectory: boolean) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar ${isDirectory ? 'la carpeta' : 'el archivo'}?`)) return;

        try {
            await fileStorageAPI.delete(path, isDirectory);
            toast.success('Eliminado correctamente');
            loadFiles(currentPath);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    // Cargar archivos al montar el componente
    useEffect(() => {
        loadFiles(currentPath);
    }, [currentPath]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 relative"
            style={{
                backgroundImage: "url('/Scroll.png')",
                backgroundColor: '#f5e7d0',
            }}
        >
            {/* Overlay entre fondo y contenido */}
            <div className="fixed inset-0 bg-parchment/70 z-0"></div>

            {/* Contenido principal */}
            <div className="relative z-10">
                {/* Barra de navegación */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Volver al panel
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-2">
                        Gestión de Archivos
                    </h1>

                    <div className="w-32"></div> {/* Espaciador para mantener la alineación */}
                </div>

                {/* Barra de herramientas */}
                <div className="bg-white rounded-xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
                    {/* Navegación */}
                    <div className="flex items-center gap-2">
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

                    {/* Acciones */}
                    <div className="flex gap-2 ml-auto">
                        <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                            <PlusIcon className="h-5 w-5" />
                            Subir archivo
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={() => setShowCreateFolder(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FolderIcon className="h-5 w-5" />
                            Nueva carpeta
                        </button>
                    </div>
                </div>

                {/* Lista de archivos */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                    {files.length === 0 ? (
                        <p className="text-gray-500 italic text-center py-8">
                            {currentPath ? "Esta carpeta está vacía" : "No hay archivos"}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {files.map((file) => (
                                <div
                                    key={file.path}
                                    className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                        if (!file.isDirectory) {
                                            setSelectedImage(file.path);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <ImageThumbnail
                                            file={file}
                                            imageCache={imageCache}
                                            loadingImages={loadingImages}
                                            size="md"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate text-sm">{file.name}</h3>
                                            {!file.isDirectory && (
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(1)} KB • {file.extension.toUpperCase()}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(file.path, file.isDirectory);
                                            }}
                                            className="p-1 text-red-500 hover:text-red-700 flex-shrink-0"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {file.isDirectory && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigateToFolder(file.name);
                                            }}
                                            className="w-full mt-2 py-1 bg-gray-100 text-sm rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            Abrir carpeta
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal crear carpeta */}
                <CreateFolderModal
                    isOpen={showCreateFolder}
                    onClose={() => setShowCreateFolder(false)}
                    onCreate={handleCreateFolder}
                />

                {/* Modal de previsualización de imagen */}
                <ImagePreviewModal
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imagePath={selectedImage || ""}
                    imageCache={imageCache}
                    files={files}
                />
            </div>
        </div>
    );
}