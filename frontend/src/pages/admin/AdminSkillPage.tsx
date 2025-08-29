import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SkillDTO } from "@/types/skills";
import { Category, ResetOn } from "@/types/enums";
import { categoryTranslations, resetOnTranslations } from "@/types/translations";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { CharacterSummaryDTO } from "@/types/characters";
import CreateSkillModal from "@/features/skills/components/admin/CreateSkillModal";
import SkillDetailModal from "@/features/skills/components/admin/SkillDetailModal";
import SkillAssociationModal from "@/features/skills/components/admin/AssignSkillsModal";
import { charactersAPI } from "@/features/characters/services/characters";
import { skillsAPI } from "@/features/skills/services/skills";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

// (Nota: mover estas funciones a Translation)
// Función helper para traducir
const translateCategory = (category: string): string => {
  return categoryTranslations[category as Category] || category;
};
// Función helper para traducir
const translateResetOn = (resetOn: ResetOn): string => {
  return resetOnTranslations[resetOn] || resetOn;
};

export default function AdminSkillPage() {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [characters, setCharacters] = useState<CharacterSummaryDTO[]>([]);
  const navigate = useNavigate();
  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillDTO | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();
  useEffect(() => {
    const loadSkillImages = async () => {
      const skillsWithImages = skills.filter(skill =>
        skill.iconUrl &&
        !skill.iconUrl.startsWith('http') &&
        !imageCache[skill.iconUrl]
      );

      for (const skill of skillsWithImages) {
        if (skill.iconUrl) {
          await loadImageAsBase64(skill.iconUrl);
        }
      }
    };

    if (skills.length > 0) {
      loadSkillImages();
    }
  }, [skills, imageCache, loadImageAsBase64]);

  // Obtener todos los personajes
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await charactersAPI.fetchCharacters();
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
      if (isSkillModalOpen || isCreateModalOpen) return;

      if (e.ctrlKey || e.metaKey) {
        setMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isSkillModalOpen || isCreateModalOpen) return;

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
  }, [isSkillModalOpen, isCreateModalOpen]);

  const handleSkillSelection = (skillId: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Obtener todas las habilidades
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await skillsAPI.getAllSkills();
        setSkills(response);
      } catch (error) {
        toast.error("Error cargando las habilidades.", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

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
            Administrar Habilidades
          </h1>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva habilidad
          </button>
        </div>

        {/* Lista de habilidades */}
        <div className="space-y-4">
          {skills.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 italic">No hay habilidades disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className={`border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer ${selectedSkillIds.includes(skill.id) ? "ring-2 ring-amber-500 bg-amber-400" : ""
                    } ${multiSelectMode ? "hover:ring-1 hover:ring-gray-300" : ""
                    }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || multiSelectMode) {
                      e.preventDefault();
                      handleSkillSelection(skill.id);
                      return;
                    }

                    setSelectedSkill(skill);
                    setIsSkillModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                      {skill.iconUrl ? (
                        <ImageThumbnail
                          file={{
                            isDirectory: false,
                            path: skill.iconUrl,
                            name: skill.name || 'skill',
                            extension: skill.iconUrl.split('.').pop() || ''
                          }}
                          imageCache={imageCache}
                          loadingImages={loadingImages}
                          size="sm"
                        />
                      ) : (
                        <span>⚡</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg truncate">{skill.name}</h3>
                        <div className="flex items-center gap-1">
                          <div className="text-sm flex flex-col">
                            <span>
                              {skill.maxUses === 0 ? "Pasiva" : `${skill.maxUses} usos máximos`}
                            </span>
                            {skill.maxUses > 0 && (
                              <span>
                                {translateResetOn(skill.resetOn as ResetOn)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {skill.categories?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skill.categories.map(category => (
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

        {/* Modal para crear nueva habilidad */}
        {isCreateModalOpen && (
          <CreateSkillModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateSuccess={(newSkill) => {
              setSkills([...skills, newSkill]);
            }}
          />
        )}

        {/* Modal de detalle/edición de la habilidad */}
        {isSkillModalOpen && selectedSkill && (
          <SkillDetailModal
            isOpen={isSkillModalOpen}
            skill={selectedSkill}
            onClose={() => setIsSkillModalOpen(false)}
            onDeleteSuccess={(deletedId) => {
              setSkills(skills.filter(skill => skill.id !== deletedId));
              setIsSkillModalOpen(false);
            }}
            onUpdateSuccess={(updatedSkill) => {
              setSkills(skills.map(skill =>
                skill.id === updatedSkill.id ? updatedSkill : skill
              ));
              setIsSkillModalOpen(false); // Cerrar modal
            }}
          />
        )}

        {/* Modal para asociar/desasociar habilidades */}
        <SkillAssociationModal
          isOpen={selectedSkillIds.length > 0 && !multiSelectMode}
          selectedSkillIds={selectedSkillIds}
          characters={characters}
          onClose={() => {
            setMultiSelectMode(false);
            setSelectedSkillIds([]);
          }}
          onSuccess={() => {
            setMultiSelectMode(false);
            setSelectedSkillIds([]);
          }}
        />

      </div>
    </div>
  );
}