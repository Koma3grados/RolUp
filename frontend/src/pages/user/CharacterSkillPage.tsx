import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { skillsAPI } from "@/features/skills/services/skills";
import { charactersAPI } from "@/features/characters/services/characters";
import type { CharacterDTO } from "@/types/characters";
import type { SkillDTO } from "@/types/skills";
import { translateCategory, translateSource } from "@/types/translations";
import { Source } from "@/types/enums";
import { useAuth } from "@/store/AuthContext";
import toast from "react-hot-toast";
import CharacterMenuDropdown from "@/components/modals/menus/CharacterMenuDropdown";
import SkillDetailModal from "@/features/skills/components/user/SkillDetailModal";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import SearchBar from "@/components/others/SearchBar";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

export default function CharacterSkillPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<SkillDTO | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [, setCharacter] = useState<CharacterDTO | null>(null);

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

  // Estados para filtrado, ordenación y búsqueda
  const [sortConfig, setSortConfig] = useState<{
    key: 'name';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });
  const [sourceFilter, setSourceFilter] = useState<Source | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { label: "Ficha de personaje", path: "" },
    { label: "Conjuros", path: "spells" },
    { label: "Inventario", path: "items" },
  ];

  // Función para cambiar el orden
  const requestSort = (key: 'name') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Habilidades filtradas, ordenadas y buscadas
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // Filtrar por fuente
    if (sourceFilter !== 'ALL') {
      result = result.filter(skill => skill.source === sourceFilter);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        (skill.descriptionTemplate && skill.descriptionTemplate.toLowerCase().includes(query)) ||
        (skill.summaryTemplate && skill.summaryTemplate.toLowerCase().includes(query))
      );
    }

    // Ordenar
    result.sort((a, b) => {
      if (sortConfig.key === 'name') {
        if (a.name < b.name) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a.name > b.name) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      return 0;
    });

    return result;
  }, [skills, sortConfig, sourceFilter, searchQuery]);

  // Actualizar usos de habilidad
  const updateSkillUses = async (skillId: number, newUses: number) => {
    try {
      await skillsAPI.updateSkillUses(skillId, id!, newUses);

      setSkills(skills.map(skill =>
        skill.id === skillId ? { ...skill, currentUses: newUses } : skill
      ));

      if (selectedSkill?.id === skillId) {
        setSelectedSkill({ ...selectedSkill, currentUses: newUses });
      }
    } catch (error) {
      toast.error("Error al actualizar usos de habilidad", {
        position: "top-center"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsResponse, characterResponse] = await Promise.all([
          skillsAPI.getSkillsByCharacter(id!),
          charactersAPI.getCharacter(Number(id))
        ]);
        setSkills(skillsResponse);
        setCharacter(characterResponse);
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 space-y-0" style={{
      backgroundImage: "url('/Scroll.png')",
      backgroundColor: '#f5e7d0',
    }}>
      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Barra de navegación superior */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          {/* Botón condicional para admin/normal */}
          {isAdmin ? (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al panel
            </button>
          ) : (
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          <h1 className="flex-grow text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-2 truncate min-w-0">
            Habilidades
          </h1>

          {/* Menú desplegable con corrección para móviles */}
          <CharacterMenuDropdown items={menuItems} />
        </div>


        {/* Controles de filtrado, ordenación y búsqueda */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch gap-4">
          {/* Contenedor para los filtros - siempre a la izquierda */}
          <div className="flex flex-wrap gap-4 items-center justify-start order-2 md:order-1">
            {/* Filtro por fuente */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-amber-900">Fuente:</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as Source | 'ALL')}
                className="border rounded-md px-2 py-1 bg-white text-sm"
              >
                <option value="ALL">Todas las fuentes</option>
                {Object.values(Source).map(source => (
                  <option key={source} value={source}>
                    {translateSource(source)}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenación por nombre */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-amber-900">Ordenar:</label>
              <button
                onClick={() => requestSort('name')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${sortConfig.key === 'name'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'hover:bg-amber-50'
                  }`}
              >
                Nombre
                {sortConfig.key === 'name' &&
                  (sortConfig.direction === 'asc' ? (
                    <ArrowUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3" />
                  ))}
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <SearchBar
            placeholder="Buscar habilidades..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="order-1 md:order-2"
          />

          {/* Espaciador invisible para desktop */}
          <div className="hidden md:block order-3 md:flex-1"></div>
        </div>


        {/* Contador de resultados */}
        {searchQuery && (
          <div className="mb-4 text-sm text-amber-700">
            {filteredSkills.length} habilidad{filteredSkills.length !== 1 ? 'es' : ''} encontrada{filteredSkills.length !== 1 ? 's' : ''} para "{searchQuery}"
          </div>
        )}

        {/* Lista de habilidades */}
        <div className="space-y-4">
          {filteredSkills.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500 italic">
                {searchQuery || sourceFilter !== 'ALL'
                  ? "No se encontraron habilidades con los filtros aplicados"
                  : "No hay habilidades disponibles"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map(skill => (
                <div
                  key={skill.id}
                  className="bg-white rounded-xl shadow-sm p-4 transition-all cursor-pointer hover:shadow-md"
                  onClick={() => {
                    setSelectedSkill(skill);
                    setIsSkillModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
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
                        <div className="flex gap-1 items-center">
                          <div className="text-sm flex flex-col">
                            <span>
                              {skill.maxUses === 0 ? "Pasiva" : `${skill.currentUses}/${skill.maxUses} usos`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mostrar fuente de la habilidad */}
                      <div className="mt-1">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                          {translateSource(skill.source as Source)}
                        </span>
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

        {/* Modal de detalle de la habilidad */}
        {isSkillModalOpen && selectedSkill && (
          <SkillDetailModal
            selectedSkill={selectedSkill}
            isOpen={isSkillModalOpen}
            onClose={() => setIsSkillModalOpen(false)}
            updateSkillUses={updateSkillUses}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
          />
        )}

      </div>
    </div>
  );
}