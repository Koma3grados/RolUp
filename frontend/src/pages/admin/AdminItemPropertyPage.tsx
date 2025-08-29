import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ItemPropertyDTO } from "@/types/items";
import { ResetOn } from "@/types/enums";
import { resetOnTranslations } from "@/types/translations";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import type { ItemDTO } from "@/types/items";
import ItemPropertyDetailModal from "@/features/itemProperties/components/admin/ItemPropertyDetailModal";
import CreateItemPropertyModal from "@/features/itemProperties/components/admin/CreateItemPropertyModal";
import ItemPropertyAssociationModal from "@/features/itemProperties/components/admin/ItemPropertyAssociationModal";
import { itemPropertiesAPI } from "@/features/itemProperties/services/ItemProperty";
import { itemsAPI } from "@/features/items/services/items";
import LoadingSpinner from "@/components/others/LoadingSpinner";

export default function AdminItemPropertyPage() {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<number[]>([]);
  const [items, setItems] = useState<ItemDTO[]>([]);
  const navigate = useNavigate();
  const [properties, setProperties] = useState<ItemPropertyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<ItemPropertyDTO | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Nuevo estado para la ordenación
  const [sortConfig, setSortConfig] = useState<{
    key: 'name';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });

  // Función para cambiar el orden
  const requestSort = () => {
    setSortConfig(prev => ({
      key: 'name',
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Propiedades ordenadas
  const sortedProperties = useMemo(() => {
    const sortableItems = [...properties];
    sortableItems.sort((a, b) => {
      if (a.name < b.name) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a.name > b.name) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [properties, sortConfig]);

  // Obtener todos los ítems
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemsAPI.getAllItems();
        setItems(response);
      } catch (error) {
        toast.error("Error cargando los ítems", {
          position: "top-center"
        });
      }
    };

    fetchItems();
  }, []);

  // Manejar modo selección múltiple con Ctrl
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPropertyModalOpen || isCreateModalOpen) return;

      if (e.ctrlKey || e.metaKey) {
        setMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {

      if (isPropertyModalOpen || isCreateModalOpen) return;

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
  }, [isPropertyModalOpen, isCreateModalOpen]);

  const handlePropertySelection = (propertyId: number) => {
    setSelectedPropertyIds(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Obtener todas las propiedades
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await itemPropertiesAPI.getAllProperties();
        setProperties(response);
      } catch (error) {
        toast.error("Error cargando las propiedades.", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
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
            Administrar Propiedades de Ítems
          </h1>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva propiedad
          </button>
        </div>

        {/* Nuevo: Botón de ordenación */}
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={requestSort}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md transition-colors border border-amber-200"
          >
            Ordenar por nombre
            <span className="text-amber-600">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          </button>

          {/* Espacio a la derecha para futuros elementos */}
          <div></div>
        </div>

        {/* Lista de propiedades */}
        <div className="space-y-4">
          {sortedProperties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 italic">No hay propiedades disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProperties.map(property => (
                <div
                  key={property.id}
                  className={`border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer ${selectedPropertyIds.includes(property.id) ? "ring-2 ring-amber-500 bg-amber-400" : ""
                    } ${multiSelectMode ? "hover:ring-1 hover:ring-gray-300" : ""
                    }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || multiSelectMode) {
                      e.preventDefault();
                      handlePropertySelection(property.id);
                      return;
                    }

                    setSelectedProperty(property);
                    setIsPropertyModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">
                      <span>🏷️</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg truncate">{property.name}</h3>
                        <div className="text-sm flex flex-col">
                          <span>
                            {property.baseMaxUses === 0 ? "Pasiva" : `${property.baseMaxUses} usos máximos`}
                          </span>
                          {property.baseMaxUses > 0 && (
                            <span>
                              {resetOnTranslations[property.resetOn as ResetOn]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear nueva propiedad */}
        <CreateItemPropertyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateSuccess={(newProperty) => {
            setProperties([...properties, newProperty]);
            setIsCreateModalOpen(false);
          }}
        />

        {/* Modal de detalle/edición de la propiedad */}
        <ItemPropertyDetailModal
          isOpen={isPropertyModalOpen}
          property={selectedProperty}
          onClose={() => {
            setIsPropertyModalOpen(false);
            setSelectedProperty(null); // Limpiar la propiedad seleccionada
          }}
          onDeleteSuccess={(deletedId) => {
            setProperties(properties.filter(prop => prop.id !== deletedId));
            setIsPropertyModalOpen(false);
          }}
          onUpdateSuccess={(updatedProperty) => {
            setProperties(properties.map(prop =>
              prop.id === updatedProperty.id ? updatedProperty : prop
            ));
            setIsPropertyModalOpen(false);
          }}
        />

        {/* Modal para asociar/desasociar propiedades */}
        <ItemPropertyAssociationModal
          isOpen={selectedPropertyIds.length > 0 && !multiSelectMode}
          selectedPropertyIds={selectedPropertyIds}
          items={items}
          onClose={() => {
            setMultiSelectMode(false);
            setSelectedPropertyIds([]);
          }}
          onSuccess={() => {
            setMultiSelectMode(false);
            setSelectedPropertyIds([]);
          }}
        />

      </div>
    </div>
  );
}