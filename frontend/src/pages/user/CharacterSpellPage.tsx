import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { schoolStyles, type SpellDTO } from "@/types/spells";
import { calculateSpellModifier, calculateSpellSaveDC, formatModifier, type CharacterDTO, type SpellSlot } from "@/types/characters";
import { schoolTranslations, translateCategory, translateSpellStat } from "@/types/translations";
import toast from "react-hot-toast";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import EditModal from "@/components/modals/forms/EditModal";
import KnownSpellsModal from "@/features/spells/components/user/KnownSpellsModal";
import SpellSlotsModal from "@/features/spells/components/user/SpellSlotsModal";
import SpellDetailModal from "@/features/spells/components/user/SpellDetailModal";
import EditSpellStatsModal from "@/features/spells/components/user/EditSpellStatsModal";
import { spellsAPI } from "@/features/spells/services/spells";
import { charactersAPI } from "@/features/characters/services/characters";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import PageHeader from "@/components/others/PageHeader";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

const SpellCard = ({
  spell,
  onSelect,
  onToggleFavorite,
  imageCache,
  loadingImages
}: {
  spell: SpellDTO,
  onSelect: () => void,
  onToggleFavorite: () => void,
  imageCache: Record<string, string>,
  loadingImages: Record<string, boolean>
}) => {
  return (

    <div
      className={`border rounded-lg p-3 transition-all cursor-pointer relative ${spell.prepared
        ? 'bg-gray-100 border-gray-300'
        : 'bg-white border-gray-200 hover:shadow-md'
        }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
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
            <span>✨</span>
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
                className={`text-xs px-2 py-1 rounded-full ${schoolStyles[spell.school?.toLowerCase() as keyof typeof schoolStyles]?.bgColor || schoolStyles.default.bgColor
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

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute bottom-2 right-2 p-1"
      >
        {spell.favourite ? (
          <StarIconSolid className="h-5 w-5 text-amber-400" />
        ) : (
          <StarIconOutline className="h-5 w-5 text-gray-400 hover:text-amber-400" />
        )}
      </button>
    </div>
  );
};


export default function CharacterSpellPage() {
  const { id } = useParams<{ id: string }>();
  const [spells, setSpells] = useState<SpellDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpell, setSelectedSpell] = useState<SpellDTO | null>(null);
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  const [preparedCount, setPreparedCount] = useState(0);
  const [spellSlots, setSpellSlots] = useState<SpellSlot[]>([]);
  const [character, setCharacter] = useState<CharacterDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<null | {
    field: keyof CharacterDTO;
    type: "text" | "number" | "skill" | "spellStat";
    title: string;
    value: any;
  }>(null);

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

  const [maxPreparedModalOpen, setMaxPreparedModalOpen] = useState(false);

  const [knownSpellsModalOpen, setKnownSpellsModalOpen] = useState(false);
  const [, setEditingKnownSpells] = useState<number[]>(Array(10).fill(0));

  const [spellSlotsModalOpen, setSpellSlotsModalOpen] = useState(false);
  const [, setEditingSpellSlots] = useState<SpellSlot[]>([]);

  const handleEditSpellSlots = async (newSpellSlots: SpellSlot[]) => {
    if (!character) return;

    try {
      await charactersAPI.updateCharacter(character.id, {
        spellSlots: newSpellSlots
      });
      // Actualizar el estado local inmediatamente
      setCharacter(prev => prev ? { ...prev, spellSlots: newSpellSlots } : null);
      setSpellSlots(newSpellSlots);
      setSpellSlotsModalOpen(false);
      toast.success("Huecos de conjuro actualizados", { position: "top-center" });
    } catch (error) {
      toast.error("Error al actualizar huecos de conjuro", { position: "top-center" });
    }
  };

  const handleTogglePrepared = async (spellId: number, newPreparedState: boolean) => {
    try {
      await spellsAPI.togglePrepared(spellId, id!);

      // Actualizar el estado local inmediatamente
      setSpells(spells.map(s =>
        s.id === spellId ? { ...s, prepared: newPreparedState } : s
      ));

      if (selectedSpell?.id === spellId) {
        setSelectedSpell({
          ...selectedSpell,
          prepared: newPreparedState
        });
      }
    } catch (error) {
      toast.error("Error al actualizar", {
        position: "top-center"
      });

      setSpells(spells.map(s =>
        s.id === spellId ? { ...s, prepared: !newPreparedState } : s
      ));

      if (selectedSpell?.id === spellId) {
        setSelectedSpell({
          ...selectedSpell,
          prepared: !newPreparedState
        });
      }
    }
  };

  const openEditModal = (
    field: keyof CharacterDTO,
    type: "text" | "number" | "skill" | "spellStat",
    title: string,
    value: any
  ) => {
    setModalProps({ field, type, title, value });
    setModalOpen(true);
  };

  // Reemplazar la función toggleFavorite:
  const toggleFavorite = async (spellId: number) => {
    try {
      await spellsAPI.toggleFavorite(spellId, id!);
      setSpells(spells.map(spell =>
        spell.id === spellId
          ? { ...spell, favourite: !spell.favourite }
          : spell
      ));
      if (selectedSpell?.id === spellId) {
        setSelectedSpell({
          ...selectedSpell,
          favourite: !selectedSpell.favourite
        });
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos", {
        position: "top-center"
      });
    }
  };

  const menuItems = [
    { label: "Ficha de personaje", path: "" },
    { label: "Habilidades", path: "skills" },
    { label: "Inventario", path: "items" },
  ];

  // Actualizar huecos de conjuro
  const updateSpellSlots = async (level: number, slotIndex: number) => {
    try {
      const slot = spellSlots.find(s => s.level === level);
      if (!slot) return;

      const newCurrent = slotIndex < slot.currentSlots ? slotIndex : slotIndex + 1;

      const updatedSlots = spellSlots.map(s =>
        s.level === level ? { ...s, currentSlots: newCurrent } : s
      );

      await charactersAPI.updateCharacter(Number(id), {
        spellSlots: updatedSlots
      });

      // Actualizar ambos estados locales inmediatamente
      setSpellSlots(updatedSlots);
      setCharacter(prev => prev ? { ...prev, spellSlots: updatedSlots } : null);
    } catch (error) {
      toast.error("Error al actualizar huecos de conjuro", {
        position: "top-center"
      });
    }
  };

  // Modificar handleEdit para manejar los nuevos campos
  const handleEdit = async (field: keyof CharacterDTO, value: any) => {
    if (!character) return;

    let updated: Partial<CharacterDTO> = {};

    if (field === "spellCastingStat") {
      updated = {
        spellCastingStat: value.stat,
        // Actualizar automáticamente los valores calculados
        spellCastingModifier: calculateSpellModifier(character, false, 0),
        spellSaveDC: calculateSpellSaveDC(character, false, 0)
      };
    } else if (field === "spellCastingModifier") {
      updated = {
        spellCastingModifier: value.value,
        spellCastingModifierManual: value.isManual
      };
    } else if (field === "spellSaveDC") {
      updated = {
        spellSaveDC: value.value,
        spellSaveDCManual: value.isManual
      };
    } else {
      updated = { [field]: value };
    }

    try {
      await charactersAPI.updateCharacter(character.id, updated);
      // Actualizar el estado local inmediatamente
      setCharacter(prev => prev ? { ...prev, ...updated } : null);
      setModalOpen(false);
      toast.success("Valor actualizado", { position: "top-center" });
    } catch (error) {
      toast.error("Error al actualizar", { position: "top-center" });
    }
  };

  // Inicializar slots al cargar el personaje
  useEffect(() => {
    if (character) {
      setSpellSlots(character.spellSlots || []);
      setEditingSpellSlots(character.spellSlots || []);
      setEditingKnownSpells(character.knownSpells || Array(10).fill(0));
    }
  }, [character]);

  // Actualiza el contador al cargar los conjuros
  useEffect(() => {
    if (spells.length > 0) {
      setPreparedCount(spells.filter(spell => spell.prepared).length);
    }
  }, [spells]);

  // Reemplazar el useEffect de fetchData:
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spellsResponse, characterResponse] = await Promise.all([
          spellsAPI.getAllSpells(id!),
          charactersAPI.getCharacter(Number(id))
        ]);
        setSpells(spellsResponse);
        setCharacter(characterResponse);
        setSpellSlots(characterResponse.spellSlots || []);
      } catch (error) {
        toast.error("Error cargando los datos", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEditKnownSpells = async (newKnownSpells: number[]) => {
    if (!character) return;

    try {
      await charactersAPI.updateCharacter(character.id, {
        knownSpells: newKnownSpells
      });
      // Actualizar el estado local inmediatamente
      setCharacter(prev => prev ? { ...prev, knownSpells: newKnownSpells } : null);
      setKnownSpellsModalOpen(false);
      toast.success("Conjuros conocidos actualizados", { position: "top-center" });
    } catch (error) {
      toast.error("Error al actualizar conjuros conocidos", { position: "top-center" });
    }
  };

  if (loading) return <LoadingSpinner />;

  // Agrupar conjuros por nivel
  const spellsByLevel: Record<number, SpellDTO[]> = {};
  for (let i = 0; i <= 9; i++) {
    spellsByLevel[i] = spells.filter(spell => spell.level === i);
  }

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 space-y-0" style={{
      backgroundImage: "url('/Scroll.png')",
      backgroundColor: '#f5e7d0',
    }}>

      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">

        <PageHeader
          title="Conjuros"
          menuItems={menuItems}
        />

        {/* Sección de estadísticas de conjuros */}
        <div className="bg-white rounded-xl shadow-sm p-4 !mb-6">
          {/* Contenedor principal */}
          <div className="flex flex-col xl:flex-row sm:justify-between xl:items-center gap-4">
            {/* Contenedor para los botones (izquierda) */}
            <div className="flex flex-col xl:flex-row gap-2">
              <button
                onClick={() => setKnownSpellsModalOpen(true)}
                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0 w-full xl:w-auto justify-center xl:justify-start"
              >
                Conocidos por nivel
              </button>

              <button
                onClick={() => setSpellSlotsModalOpen(true)}
                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0 w-full xl:w-auto justify-center xl:justify-start"
              >
                Huecos por nivel
              </button>

              <button
                onClick={() => setMaxPreparedModalOpen(true)}
                className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0 w-full xl:w-auto justify-center xl:justify-start"
              >
                Preparados por nivel
              </button>

              {character?.maxPreparedSpells && character.maxPreparedSpells > 0 ? (
                <div className="bg-amber-100 text-amber-800 px-3 py-[0.375rem] rounded-full text-sm font-medium flex-shrink-0 whitespace-nowrap flex items-center justify-center">
                  Preparados: {preparedCount}/{character.maxPreparedSpells}
                </div>
              ) : null}
            </div>

            {/* Contenedor de stats (derecha) */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-4 overflow-x-auto pb-2 xl:pb-0">
              {/* Modificador de lanzamiento */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Modificador:</span>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded text-sm bg-gray-100 text-gray-800`}>
                    {formatModifier(
                      character ? calculateSpellModifier(
                        character,
                        character.spellCastingModifierManual,
                        character.spellCastingModifier || 0
                      ) : 0
                    )}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(
                        "spellCastingModifier",
                        "number",
                        "Modificador de Lanzamiento",
                        {
                          value: character?.spellCastingModifier || 0,
                          isManual: character?.spellCastingModifierManual || false
                        }
                      );
                    }}
                    className="p-1 text-amber-600 hover:text-amber-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* CD de salvación */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">CD de Salvación:</span>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded text-sm bg-gray-100 text-gray-800`}>
                    {character ? calculateSpellSaveDC(
                      character,
                      character.spellSaveDCManual,
                      character.spellSaveDC || 0
                    ) : 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(
                        "spellSaveDC",
                        "number",
                        "CD de salvación",
                        {
                          value: character?.spellSaveDC || 0,
                          isManual: character?.spellSaveDCManual || false
                        }
                      );
                    }}
                    className="p-1 text-amber-600 hover:text-amber-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Característica de lanzamiento - Se mantiene igual */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Característica:</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">
                    {character?.spellCastingStat ? translateSpellStat(character.spellCastingStat) : 'No definido'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(
                        "spellCastingStat",
                        "spellStat",
                        "Característica de Lanzamiento",
                        {
                          stat: character?.spellCastingStat || '',
                          isManual: false
                        }
                      );
                    }}
                    className="p-1 text-amber-600 hover:text-amber-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de conjuros por nivel */}
        <div className="space-y-8">

          {/* Sección de Favoritos */}
          {spells.filter(spell => spell.favourite).length > 0 && (
            <div key="favorites" className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-bold mb-4 border-b border-amber-200 pb-2 flex items-center gap-2">
                <StarIconSolid className="h-5 w-5 text-amber-400" />
                <span>Conjuros Favoritos</span>
                <StarIconSolid className="h-5 w-5 text-amber-400" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spells
                  .filter(spell => spell.favourite)
                  .sort((a, b) => {
                    // Primero por nivel (ascendente)
                    if (a.level !== b.level) {
                      return a.level - b.level;
                    }
                    // Luego por nombre (alfabético)
                    return a.name.localeCompare(b.name);
                  })
                  .map(spell => (
                    <div
                      key={`fav-${spell.id}`}
                      className={`border rounded-lg p-3 transition-all cursor-pointer relative ${spell.prepared
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-white border-gray-200 hover:shadow-md'
                        }`}
                      onClick={() => {
                        setSelectedSpell(spell);
                        setIsSpellModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
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
                            <span>✨</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg truncate">{spell.name}</h3>
                            <div className="flex gap-1">
                              {/* Etiqueta de nivel - solo en favoritos */}
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Nivel {spell.level}
                              </span>
                              {spell.concentration && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded" title="Concentración">
                                  ⏳
                                </span>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${schoolStyles[spell.school?.toLowerCase() as keyof typeof schoolStyles]?.bgColor || schoolStyles.default.bgColor
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

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(spell.id);
                        }}
                        className="absolute bottom-2 right-2 p-1"
                      >
                        {spell.favourite ? (
                          <StarIconSolid className="h-5 w-5 text-amber-400" />
                        ) : (
                          <StarIconOutline className="h-5 w-5 text-gray-400 hover:text-amber-400" />
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {Object.entries(spellsByLevel).map(([level, levelSpells]) => (
            <div key={level} className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2 flex justify-between items-center">
                <span>{level === "0" ? "Trucos" : `Nivel ${level}`}</span>

                <div className="flex items-center gap-4">
                  {/* Mostrar conjuros conocidos SOLO si es mayor que 0 */}
                  {(character?.knownSpells?.[parseInt(level)] || 0) > 0 && (
                    <span className="text-sm text-gray-600">
                      Conocidos: {character?.knownSpells?.[parseInt(level)] || 0}
                    </span>
                  )}

                  {spellSlots.find(slot => slot.level === parseInt(level)) && (
                    <div className="flex items-center gap-1 group relative">
                      {[...Array(spellSlots.find(slot => slot.level === parseInt(level))!.maxSlots)].map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSpellSlots(parseInt(level), i);
                          }}
                          className={`w-4 h-4 rounded-full border transition-colors ${i < spellSlots.find(slot => slot.level === parseInt(level))!.currentSlots
                            ? 'bg-amber-500 border-amber-600 hover:bg-amber-400'
                            : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                            }`}
                          title={`Huecos usados: ${spellSlots.find(slot => slot.level === parseInt(level))!.currentSlots}/${spellSlots.find(slot => slot.level === parseInt(level))!.maxSlots}`}
                        />
                      ))}
                      {spellSlots.find(slot => slot.level === parseInt(level))?.maxSlots !== 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({spellSlots.find(slot => slot.level === parseInt(level))!.currentSlots}/
                          {spellSlots.find(slot => slot.level === parseInt(level))!.maxSlots})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </h2>

              {levelSpells.length === 0 ? (
                <p className="text-gray-500 italic">No hay conjuros de este nivel</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelSpells.map(spell => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      onSelect={() => {
                        setSelectedSpell(spell);
                        setIsSpellModalOpen(true);
                      }}
                      onToggleFavorite={() => toggleFavorite(spell.id)}
                      imageCache={imageCache}
                      loadingImages={loadingImages}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <KnownSpellsModal
          isOpen={knownSpellsModalOpen}
          onClose={() => setKnownSpellsModalOpen(false)}
          onSave={handleEditKnownSpells}
          initialKnownSpells={character?.knownSpells || Array(10).fill(0)}
        />

        <SpellSlotsModal
          isOpen={spellSlotsModalOpen}
          onClose={() => setSpellSlotsModalOpen(false)}
          onSave={handleEditSpellSlots}
          initialSpellSlots={character?.spellSlots || []}
        />

        {maxPreparedModalOpen && (
          <EditModal<number>
            isOpen={maxPreparedModalOpen}
            title="Ajustar límite de conjuros preparados"
            initialValue={character?.maxPreparedSpells || 0}
            type="number"
            onSave={(value) => {
              if (character) {
                charactersAPI.updateCharacter(character.id, {
                  maxPreparedSpells: value
                }).then(() => {
                  // Actualizar el estado local inmediatamente
                  setCharacter(prev => prev ? { ...prev, maxPreparedSpells: value } : null);
                  toast.success("Límite actualizado", { position: "top-center" });
                }).catch(() => {
                  toast.error("Error al actualizar", { position: "top-center" });
                });
              }
              setMaxPreparedModalOpen(false);
            }}
            onClose={() => setMaxPreparedModalOpen(false)}
          />
        )}


        {/* Modal de detalle del conjuro */}
        {selectedSpell && (
          <SpellDetailModal
            isOpen={isSpellModalOpen}
            onClose={() => setIsSpellModalOpen(false)}
            spell={selectedSpell}
            onTogglePrepared={handleTogglePrepared} // Pasar la función del padre
          />
        )}

        {modalOpen && modalProps && (
          <EditSpellStatsModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={(value) => handleEdit(modalProps.field, value)}
            title={modalProps.title}
            type={modalProps.type}
            initialValue={modalProps.value}
          />
        )}

      </div>

    </div>

  );
}