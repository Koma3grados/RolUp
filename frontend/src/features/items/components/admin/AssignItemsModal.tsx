import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemsAPI } from "@/features/items/services/items";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

interface AssignItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemIds: number[];
  characters: any[];
  onSuccess?: () => void;
}

export default function AssignItemsModal({
  isOpen,
  onClose,
  selectedItemIds,
  characters,
  onSuccess,
}: AssignItemsModalProps) {
  const [characterId, setCharacterId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

  // Cargar imágenes de personajes
  useEffect(() => {
    const loadCharacterImages = async () => {
      const charactersWithImages = characters.filter(character =>
        character.iconUrl &&
        !character.iconUrl.startsWith('http') &&
        !imageCache[character.iconUrl]
      );

      for (const character of charactersWithImages) {
        if (character.iconUrl) {
          await loadImageAsBase64(character.iconUrl);
        }
      }
    };

    if (characters.length > 0) {
      loadCharacterImages();
    }
  }, [characters, imageCache, loadImageAsBase64]);

  useDisableScroll(isOpen);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!characterId) {
      toast.error("Selecciona un personaje primero", {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await itemsAPI.assignItemsToCharacter(parseInt(characterId), selectedItemIds);
      toast.success("Ítems asignados correctamente", {
        position: "top-center",
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error("Error al asignar ítems", {
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedItemIds.length > 1
            ? `Asignar ${selectedItemIds.length} ítems`
            : `Asignar 1 ítem`}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar personaje
              {!characterId && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            {characters.length === 0 ? (
              <p className="text-gray-500 italic">No hay personajes registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {characters.map(character => (
                  <div
                    key={character.id}
                    className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${characterId === character.id.toString()
                      ? "ring-2 ring-amber-500 bg-amber-50"
                      : "bg-white border-gray-200"
                      }`}
                    onClick={() => setCharacterId(character.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {character.iconUrl ? (
                          <ImageThumbnail
                            file={{
                              isDirectory: false,
                              path: character.iconUrl,
                              name: character.name || 'character',
                              extension: character.iconUrl.split('.').pop() || ''
                            }}
                            imageCache={imageCache}
                            loadingImages={loadingImages}
                            size="sm"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                            <span>👤</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{character.name}</h3>
                        <p className="text-sm text-gray-500">Nivel {character.level} {character.race}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            onClick={handleAssign}
            disabled={!characterId || isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${!characterId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-amber-600 hover:bg-amber-700"
              }`}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}