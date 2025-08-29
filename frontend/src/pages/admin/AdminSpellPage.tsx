import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { schoolStyles, type SpellDTO } from "@/types/spells";
import { schoolTranslations, translateCategory } from "@/types/translations";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { CharacterSummaryDTO } from "@/types/characters";
import CreateSpellModal from "@/features/spells/components/admin/CreateSpellModal";
import SpellDetailModal from "@/features/spells/components/admin/SpellDetailModal";
import ManageSpellModal from "@/features/spells/components/admin/AssignSpellModal";
import { charactersAPI } from "@/features/characters/services/characters";
import { spellsAPI } from "@/features/spells/services/spells";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

export default function AdminSpellPage() {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSpellIds, setSelectedSpellIds] = useState<number[]>([]);
  const [characters, setCharacters] = useState<CharacterSummaryDTO[]>([]);
  const navigate = useNavigate();
  const [spells, setSpells] = useState<SpellDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpell, setSelectedSpell] = useState<SpellDTO | null>(null);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();
  useEffect(() => {
    const loadSpellImages = async () => {
      const spellsWithImages = spells.filter(spell =>
        spell.iconUrl &&
        !spell.iconUrl.startsWith('http') &&
        !imageCache[spell.iconUrl]
      );

      for (const spell of spellsWithImages) {
        if (spell.iconUrl) {
          await loadImageAsBase64(spell.iconUrl);
        }
      }
    };

    if (spells.length > 0) {
      loadSpellImages();
    }
  }, [spells, imageCache, loadImageAsBase64]);


  // Obtener todos los personajes
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await charactersAPI.fetchCharacters(); // Usar el servicio
        setCharacters(response);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSpellModalOpen || isCreateModalOpen) return;

      if (e.ctrlKey || e.metaKey) {
        setMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isSpellModalOpen || isCreateModalOpen) return;

      if (e.key === 'Control' || e.key === 'Meta') {
        setMultiSelectMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpellModalOpen, isCreateModalOpen]);


  const handleSpellSelection = (spellId: number) => {
    setSelectedSpellIds(prev =>
      prev.includes(spellId)
        ? prev.filter(id => id !== spellId)
        : [...prev, spellId]
    );
  };

  // Obtener todos los conjuros
  useEffect(() => {
    const fetchSpells = async () => {
      try {
        const response = await spellsAPI.getAllSpells(); // Sin characterId para todos los conjuros
        setSpells(response);
      } catch (error) {
        toast.error("Error cargando los conjuros.", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpells();
  }, []);

  // Agrupar conjuros por nivel
  const spellsByLevel: Record<number, SpellDTO[]> = {};
  for (let i = 0; i <= 9; i++) {
    spellsByLevel[i] = spells.filter(spell => spell.level === i);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 relative"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
        overflowAnchor: 'none'
      }}
    >

      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">

        {/* Banner de selección */}
        {multiSelectMode && (
          <div
            className="fixed z-[1000] bg-amber-100 text-amber-800 px-6 py-3 rounded-full shadow-lg backdrop-blur-sm"
            style={{
              top: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              maxWidth: '90%',
            }}
          >

            <div className="inline-flex items-center justify-center">
              <span>Modo selección múltiple (Ctrl + Click)</span>
            </div>
          </div>
        )}

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
            Administrar Conjuros
          </h1>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nuevo conjuro
          </button>
        </div>

        {/* Lista de conjuros por nivel */}
        <div className="space-y-8">
          {Object.entries(spellsByLevel).map(([level, levelSpells]) => (
            <div key={level} className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-bold mb-4 border-b border-amber-200 pb-2">
                {level === "0" ? "Trucos" : `Nivel ${level}`}
              </h2>

              {levelSpells.length === 0 ? (
                <p className="text-gray-500 italic">No hay conjuros de este nivel</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelSpells.map(spell => (
                    <div
                      key={spell.id}
                      className={`border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer ${selectedSpellIds.includes(spell.id) ? "ring-2 ring-amber-500 bg-amber-400" : ""
                        } ${multiSelectMode ? "hover:ring-1 hover:ring-gray-300" : ""
                        }`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey || multiSelectMode) {
                          e.preventDefault();
                          handleSpellSelection(spell.id);
                          return;
                        }
                        setSelectedSpell(spell);
                        setIsSpellModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {spell.iconUrl ? (
                            <ImageThumbnail
                              file={{
                                isDirectory: false,
                                path: spell.iconUrl,
                                name: spell.name || 'spell',
                                extension: spell.iconUrl.split('.').pop() || ''
                              }}
                              imageCache={imageCache}
                              loadingImages={loadingImages}
                              size="sm"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                              <span>✨</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg truncate">{spell.name}</h3>
                            <div className="flex gap-1">
                              {spell.concentration && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" title="Concentración">
                                  ⏳
                                </span>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded ${schoolStyles[spell.school?.toLowerCase() as keyof typeof schoolStyles]?.bgColor || schoolStyles.default.bgColor
                                  } ${schoolStyles[spell.school?.toLowerCase() as keyof typeof schoolStyles]?.textColor || schoolStyles.default.textColor
                                  }`}
                              >
                                {schoolStyles[spell.school?.toLowerCase() as keyof typeof schoolStyles]?.icon || schoolStyles.default.icon}
                                <span className="hidden sm:inline ml-1">
                                  {schoolTranslations[spell.school?.toLowerCase() as keyof typeof schoolTranslations] || spell.school}
                                </span>
                              </span>
                            </div>
                          </div>

                          {spell.categories?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {spell.categories.map(category => (
                                <span
                                  key={category}
                                  className="text-[0.7rem] bg-gray-100 text-gray-800 px-2 py-0.2 rounded-full border border-gray-200"
                                >
                                  {translateCategory(category)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal para crear nuevo conjuro */}
        {isCreateModalOpen && (
          <CreateSpellModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateSuccess={(newSpell) => {
              setSpells(prev => [...prev, newSpell]);
              setIsCreateModalOpen(false);
            }}
          />
        )}

        {/* Modal de detalle/edición del conjuro */}
        {isSpellModalOpen && selectedSpell && (
          <SpellDetailModal
            isOpen={isSpellModalOpen}
            spell={selectedSpell}
            onClose={() => {
              setIsSpellModalOpen(false);
              setSelectedSpell(null);
            }}
            onDeleteSuccess={(deletedId) => {
              setSpells(prev => prev.filter(spell => spell.id !== deletedId));
              setIsSpellModalOpen(false);
            }}
            onUpdateSuccess={(updatedSpell) => {
              setSpells(prev => prev.map(spell =>
                spell.id === updatedSpell.id ? updatedSpell : spell
              ));
            }}
          />
        )}

        {/* Modal para asociar conjuros a un personaje */}
        {selectedSpellIds.length > 0 && !multiSelectMode && (
          <ManageSpellModal
            isOpen={selectedSpellIds.length > 0 && !multiSelectMode}
            selectedSpellIds={selectedSpellIds}
            characters={characters}
            onClose={() => {
              setSelectedSpellIds([]);
            }}
            onSuccess={() => {
              setSelectedSpellIds([]);
            }}
          />
        )}

      </div>
    </div>
  );
}