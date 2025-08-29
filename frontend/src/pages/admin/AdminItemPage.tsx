import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ItemDTO, ItemPropertyDTO } from "@/types/items";
import { CostUnit, ItemCategory } from "@/types/enums";
import { itemCategoryTranslations, translateCostUnit } from "@/types/translations";
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { charactersAPI } from "@/features/characters/services/characters";
import { itemsAPI } from "@/features/items/services/items";
import CreateItemModal from "@/features/items/components/admin/CreateItemModal";
import ItemDetailModal from "@/features/items/components/admin/ItemDetailModal";
import AssignItemsModal from "@/features/items/components/admin/AssignItemsModal";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

export default function AdminItemPage() {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [characterId] = useState<string>("");
  const [characters, setCharacters] = useState<any[]>([]);
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemDTO | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [properties, setProperties] = useState<ItemPropertyDTO[]>([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

  useEffect(() => {
    const loadItemImages = async () => {
      const itemsWithImages = items.filter(item =>
        item.iconUrl &&
        !item.iconUrl.startsWith('http') &&
        !imageCache[item.iconUrl]
      );

      for (const item of itemsWithImages) {
        if (item.iconUrl) {
          await loadImageAsBase64(item.iconUrl);
        }
      }
    };

    if (items.length > 0) {
      loadItemImages();
    }
  }, [items, imageCache, loadImageAsBase64]);

  // Estados para ordenación y filtrado
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'cost' | 'weight';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'ALL'>('ALL');

  // Función para cambiar el orden
  const requestSort = (key: 'name' | 'cost' | 'weight') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Ítems ordenados y filtrados
  const sortedItems = useMemo(() => {
    const sortableItems = [...items];

    // Filtrar por categoría
    const filteredItems = categoryFilter === 'ALL'
      ? sortableItems
      : sortableItems.filter(item => item.category === categoryFilter);

    // Ordenar
    filteredItems.sort((a, b) => {
      // Ordenar por nombre
      if (sortConfig.key === 'name') {
        if (a.name < b.name) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a.name > b.name) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }

      // Ordenar por coste
      if (sortConfig.key === 'cost') {
        const aValue = a.cost.quantity * getCurrencyMultiplier(a.cost.unit);
        const bValue = b.cost.quantity * getCurrencyMultiplier(b.cost.unit);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Ordenar por peso
      if (sortConfig.key === 'weight') {
        return sortConfig.direction === 'asc' ? a.weight - b.weight : b.weight - a.weight;
      }

      return 0;
    });

    return filteredItems;
  }, [items, sortConfig, categoryFilter]);

  // Multiplicador para ordenar por coste (convertir todo a cobre)
  const getCurrencyMultiplier = (unit: string) => {
    switch (unit.toLowerCase()) {
      case 'pp': return 1000;  // Platino
      case 'gp': return 100;   // Oro
      case 'ep': return 50;    // Electrum
      case 'sp': return 10;    // Plata
      default: return 1;       // Cobre (cp)
    }
  };

  // Obtener todos los personajes
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const charactersData = await charactersAPI.fetchCharacters();
        setCharacters(charactersData);
      } catch (error) {
        toast.error("Error cargando los personajes", {
          position: "top-center"
        });
      }
    };

    fetchCharacters();
  }, []);

  // Obtener todas las propiedades
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesData = await itemsAPI.getAllItemProperties();
        setProperties(propertiesData);
      } catch (error) {
        toast.error("Error cargando las propiedades", {
          position: "top-center"
        });
      }
    };

    fetchProperties();
  }, []);

  // Manejar modo selección múltiple con Ctrl
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isItemModalOpen || isCreateModalOpen) return;

      if (e.ctrlKey || e.metaKey) {
        setMultiSelectMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isItemModalOpen || isCreateModalOpen) return;

      if (e.key === 'Control' || e.key === 'Meta') {
        setMultiSelectMode(false);
        if (selectedItemIds.length > 0) {
          setIsAssignModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedItemIds, isItemModalOpen, isCreateModalOpen]);

  const handleItemSelection = (itemId: number) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Obtener todos los ítems
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsData = await itemsAPI.getAllItems();
        setItems(itemsData);
      } catch (error) {
        toast.error("Error cargando los ítems.", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isItemModalOpen]);

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
            Administrar Ítems
          </h1>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo ítem</span>
          </button>
        </div>

        {/* Controles de ordenación y filtrado */}
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          {/* Filtro por categoría */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-amber-900">Filtrar:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'ALL')}
              className="border border-amber-300 rounded-md px-2 py-1 bg-white text-sm"
            >
              <option value="ALL">Todas las categorías</option>
              {Object.values(ItemCategory).map(category => (
                <option key={category} value={category}>
                  {itemCategoryTranslations[category]}
                </option>
              ))}
            </select>
          </div>

          {/* Botones de ordenación */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-amber-900">Ordenar por:</label>
            <button
              onClick={() => requestSort('name')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${sortConfig.key === 'name'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'hover:bg-amber-50'
                }`}
            >
              Nombre
              {sortConfig.key === 'name' && (
                sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => requestSort('cost')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${sortConfig.key === 'cost'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'hover:bg-amber-50'
                }`}
            >
              Precio
              {sortConfig.key === 'cost' && (
                sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
              )}
            </button>
            <button
              onClick={() => requestSort('weight')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${sortConfig.key === 'weight'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'hover:bg-amber-50'
                }`}
            >
              Peso
              {sortConfig.key === 'weight' && (
                sortConfig.direction === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Lista de ítems */}
        <div className="space-y-4">
          {sortedItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-500 italic">No hay ítems disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedItems.map(item => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer ${selectedItemIds.includes(item.id) ? "ring-2 ring-amber-500 bg-amber-400" : ""
                    } ${multiSelectMode ? "hover:ring-1 hover:ring-gray-300" : ""
                    }`}
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey || multiSelectMode) {
                      e.preventDefault();
                      handleItemSelection(item.id);
                      return;
                    }

                    setSelectedItem(item);
                    setIsItemModalOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                      {item.iconUrl ? (
                        <ImageThumbnail
                          file={{
                            isDirectory: false,
                            path: item.iconUrl,
                            name: item.name || 'item',
                            extension: item.iconUrl.split('.').pop() || ''
                          }}
                          imageCache={imageCache}
                          loadingImages={loadingImages}
                          size="sm"
                        />
                      ) : (
                        <span className="text-lg">🎲</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {itemCategoryTranslations[item.category]}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                        <div>
                          {item.requiresAttunement && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                              Requiere sintonización
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span>{item.weight} lb</span>
                          <span>{item.cost.quantity} {translateCostUnit(item.cost.unit as CostUnit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear nuevo ítem */}
        <CreateItemModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          properties={properties}
          characterId={characterId}
          onCreateSuccess={(newItem) => {
            setItems([...items, newItem]);
          }}
        />

        {/* Modal de detalle/edición del ítem */}
        {isItemModalOpen && selectedItem && (
          <ItemDetailModal
            isOpen={isItemModalOpen}
            onClose={() => setIsItemModalOpen(false)}
            item={selectedItem}
            onDeleteSuccess={(deletedItemId) => {
              setItems(items.filter(item => item.id !== deletedItemId));
              setIsItemModalOpen(false);
            }}
            onUpdateSuccess={(updatedItem) => {
              setItems(items.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              ));
            }}
          />
        )}

        {/* Modal para asociar/desasociar ítems */}
        <AssignItemsModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedItemIds([]);
          }}
          selectedItemIds={selectedItemIds}
          characters={characters}
          onSuccess={() => {
            setSelectedItemIds([]);
            // Nota para el futuro: recargar items si es necesario
          }}
        />

      </div>
    </div>
  );
}