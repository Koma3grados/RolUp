import { useEffect, useState } from "react";
import { Source } from "@/types/enums";
import { sourceTranslations, translateSource } from "@/types/translations";
import type { CharacterSummaryDTO } from "@/types/characters";
import toast from "react-hot-toast";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { charactersAPI } from "@/features/characters/services/characters";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

interface AssignSpellModalProps {
  isOpen: boolean;
  selectedSpellIds: number[];
  characters: CharacterSummaryDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignSpellModal({
  isOpen,
  selectedSpellIds,
  characters,
  onClose,
  onSuccess
}: AssignSpellModalProps) {
  const [characterId, setCharacterId] = useState<string>("");
  const [source, setSource] = useState<Source>(Source.CLASS);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAssociateSpells = async () => {
    if (!characterId || selectedSpellIds.length === 0) return;

    setIsLoading(true);
    try {
      await charactersAPI.addSpellsToCharacter(
        parseInt(characterId),
        selectedSpellIds,
        source
      );
      toast.success(selectedSpellIds.length > 1
        ? "Conjuros asociados correctamente"
        : "Conjuro asociado correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(selectedSpellIds.length > 1
        ? "Error al asociar conjuros"
        : "Error al asociar conjuro", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSpells = async () => {
    if (!characterId || selectedSpellIds.length === 0) return;

    setIsLoading(true);
    try {
      await charactersAPI.removeSpellsFromCharacter(
        parseInt(characterId),
        selectedSpellIds,
        source
      );
      toast.success(selectedSpellIds.length > 1
        ? "Conjuros desasociados correctamente"
        : "Conjuro desasociado correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(selectedSpellIds.length > 1
        ? "Error al desasociar conjuros"
        : "Error al desasociar conjuro", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useDisableScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-amber-900">
            {selectedSpellIds.length > 1
              ? `Gestionar ${selectedSpellIds.length} conjuros`
              : `Gestionar 1 conjuro`}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar personaje</label>
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
                    onClick={() => !isLoading && setCharacterId(character.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {character.iconUrl ? (
                          <ImageThumbnail
                            file={{
                              isDirectory: false,
                              path: character.iconUrl,
                              name: character.name || "character",
                              extension: character.iconUrl.split(".").pop() || "",
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
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg truncate">{character.name}</h3>
                          {character.accountUsername && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {character.accountUsername}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">ID: {character.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as Source)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isLoading}
            >
              {Object.entries(sourceTranslations).map(([key]) => (
                <option key={key} value={key}>{translateSource(key as Source)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            onClick={handleRemoveSpells}
            disabled={!characterId || selectedSpellIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            {isLoading ? "Procesando..." : "Desasociar"}
          </button>

          <button
            onClick={handleAssociateSpells}
            disabled={!characterId || selectedSpellIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300"
          >
            {isLoading ? "Procesando..." : "Asociar"}
          </button>
        </div>
      </div>
    </div>
  );
}