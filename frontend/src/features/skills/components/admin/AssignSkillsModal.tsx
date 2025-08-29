import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { CharacterSummaryDTO } from "@/types/characters";
import { skillsAPI } from "@/features/skills/services/skills";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { translateSource } from "@/types/translations";
import { Source } from "@/types/enums";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

interface AssignSkillModalProps {
  isOpen: boolean;
  selectedSkillIds: number[];
  characters: CharacterSummaryDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignSkillModal({
  isOpen,
  selectedSkillIds,
  characters,
  onClose,
  onSuccess
}: AssignSkillModalProps) {
  const [characterId, setCharacterId] = useState<string>("");
  const [source, setSource] = useState<string>("CLASS");
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

  useDisableScroll(isOpen);

  if (!isOpen) return null;

  const handleAssociate = async () => {
    if (!characterId) return;

    setIsLoading(true);
    try {
      await skillsAPI.associateSkillsToCharacter(characterId, selectedSkillIds, source);
      toast.success("Habilidades asociadas correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al asociar habilidades", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!characterId) return;

    setIsLoading(true);
    try {
      await skillsAPI.disassociateSkillsFromCharacter(characterId, selectedSkillIds, source);
      toast.success("Habilidades desasociadas correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al desasociar habilidades", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedSkillIds.length > 1
            ? `Gestionar ${selectedSkillIds.length} habilidades`
            : `Gestionar 1 habilidad`}
        </h2>

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
              onChange={(e) => setSource(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled={isLoading}
            >
              {Object.values(Source).map(src => (
                <option key={src} value={src}>
                  {translateSource(src)}
                </option>
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
            onClick={handleDisassociate}
            disabled={!characterId || selectedSkillIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            {isLoading ? "Procesando..." : "Desasociar"}
          </button>

          <button
            onClick={handleAssociate}
            disabled={!characterId || selectedSkillIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300"
          >
            {isLoading ? "Procesando..." : "Asociar"}
          </button>
        </div>
      </div>
    </div>
  );
}