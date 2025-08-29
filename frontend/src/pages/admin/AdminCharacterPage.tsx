import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { charactersAPI } from "@/features/characters/services/characters";
import { type CharacterSummaryDTO } from "@/types/characters";
import toast from "react-hot-toast";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { showConfirmDialog } from "@/components/others/Notification";
import LoadingSpinner from "@/components/others/LoadingSpinner";

import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import EditCharacterIconModal from "@/features/characters/components/admin/EditCharacterIconModal";

export default function AdminCharacterPage() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharacter, setEditingCharacter] = useState<CharacterSummaryDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Obtener todos los personajes
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const data = await charactersAPI.fetchCharacters();
        setCharacters(data);
      } catch (error) {
        toast.error("Error cargando los personajes", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  // Eliminar personaje
  const handleDeleteCharacter = async (characterId: number) => {
    const userConfirmed = await showConfirmDialog("¿Seguro que quieres eliminar este personaje para siempre?");
    if (!userConfirmed) return;

    try {
      await charactersAPI.deleteCharacter(characterId);
      setCharacters(characters.filter(c => c.id !== characterId));
      toast.success("Personaje eliminado correctamente", {
        position: "top-center"
      });
    } catch (error) {
      toast.error("Error eliminando el personaje", {
        position: "top-center"
      });
    }
  };

  // Actualizar icono del personaje
  const handleUpdateCharacterIcon = async (characterId: number, newIconUrl: string) => {
    try {
      await charactersAPI.updateCharacter(characterId, { iconUrl: newIconUrl });

      // Actualizar el estado local
      setCharacters(characters.map(character =>
        character.id === characterId
          ? { ...character, iconUrl: newIconUrl }
          : character
      ));

      toast.success("Icono actualizado correctamente", {
        position: "top-center"
      });
    } catch (error) {
      toast.error("Error actualizando el icono", {
        position: "top-center"
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6" style={{
      backgroundImage: "url('/Scroll.png')",
      backgroundColor: '#f5e7d0',
    }}
    >
      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">

        {/* Barra de navegación superior */}
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
            Administrar Personajes
          </h1>

          <div className="w-40"></div> {/* Espacio para mantener el balance */}
        </div>

        {/* Lista de personajes */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          {characters.length === 0 ? (
            <p className="text-gray-500 italic">No hay personajes registrados</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map(character => (
                <div
                  key={character.id}
                  className="border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 relative"
                >
                  {/* Botones de acción */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {/* Botón de editar icono */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCharacter(character);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title="Cambiar icono"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    {/* Botón de eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCharacter(character.id);
                      }}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Eliminar personaje"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Nombre de usuario abajo a la derecha */}
                  {character.accountUsername && (
                    <span className="absolute bottom-2 right-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {character.accountUsername}
                    </span>
                  )}

                  {/* Contenido del personaje */}
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/character/${character.id}`)}
                  >
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
                      <p className="text-sm text-gray-500">ID: {character.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal de edición de icono */}
      {editingCharacter && (
        <EditCharacterIconModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCharacter(null);
          }}
          currentIconUrl={editingCharacter.iconUrl || ""}
          onSave={(newIconUrl) => {
            if (editingCharacter) {
              handleUpdateCharacterIcon(editingCharacter.id, newIconUrl);
            }
          }}
          characterName={editingCharacter.name}
        />
      )}
    </div>
  );
}