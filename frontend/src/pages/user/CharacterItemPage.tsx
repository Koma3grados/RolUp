import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { ItemDTO } from "@/types/items";
import { CostUnit, ItemCategory } from "@/types/enums";
import { itemCategoryTranslations, translateCostUnit } from "@/types/translations";
import toast from "react-hot-toast";
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ItemDetailModal from "@/features/items/components/user/ItemDetailModal";
import { itemsAPI } from "@/features/items/services/items";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import PageHeader from "@/components/others/PageHeader";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { charactersAPI } from "@/features/characters/services/characters";
import type { CharacterDTO } from "@/types/characters";
import ValueOrManualModal from "@/components/modals/forms/ValueOrManualModal";

export default function CharacterItemPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<ItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemDTO | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [character, setCharacter] = useState<CharacterDTO | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

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

  // Estados para ordenación, filtrado y búsqueda
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'cost' | 'weight';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState(''); // Nuevo estado para búsqueda

  const menuItems = [
    { label: "Ficha de personaje", path: "" },
    { label: "Habilidades", path: "skills" },
    { label: "Conjuros", path: "spells" },
  ];

  // Función para cambiar el orden
  const requestSort = (key: 'name' | 'cost' | 'weight') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Multiplicador para ordenar por coste (convertir todo a cobre)
  const getCurrencyMultiplier = (unit: CostUnit) => {
    switch (unit) {
      case CostUnit.PP: return 1000;
      case CostUnit.GP: return 100;
      case CostUnit.EP: return 50;
      case CostUnit.SP: return 10;
      case CostUnit.CP: return 1;
      default: return 1;
    }
  };

  // Calcular peso actual
  const actualWeight = useMemo(() => {
    return items.reduce((total, item) => total + (item.weight * (item.quantity || 1)), 0);
  }, [items]);

  // Calcular peso máximo
  const maxWeight = useMemo(() => {
    if (!character) return 0;
    return character.maxWeightManual ? character.maxWeight : (character.strength * 5);
  }, [character]);

  // Ítems filtrados por búsqueda
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.descriptionTemplate && item.descriptionTemplate.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Ítems ordenados y filtrados por categoría
  const sortedItems = useMemo(() => {
    const sortableItems = [...filteredItems];

    // Filtrar por categoría
    const categoryFilteredItems = categoryFilter === 'ALL'
      ? sortableItems
      : sortableItems.filter(item => item.category === categoryFilter);

    // Ordenar
    categoryFilteredItems.sort((a, b) => {
      if (sortConfig.key === 'name') {
        if (a.name < b.name) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a.name > b.name) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }

      if (sortConfig.key === 'cost') {
        const aValue = a.cost.quantity * getCurrencyMultiplier(a.cost.unit);
        const bValue = b.cost.quantity * getCurrencyMultiplier(b.cost.unit);
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortConfig.key === 'weight') {
        return sortConfig.direction === 'asc' ? a.weight - b.weight : b.weight - a.weight;
      }

      return 0;
    });

    return categoryFilteredItems;
  }, [filteredItems, sortConfig, categoryFilter]);

  // Obtener ítems equipados
  const equippedItems = useMemo(() => {
    return sortedItems.filter(item => item.equipped);
  }, [sortedItems]);

  // Obtener ítems no equipados
  const nonEquippedItemsByCategory = useMemo(() => {
    return sortedItems.filter(item => !item.equipped);
  }, [sortedItems]);

  // Obtener todos los ítems del personaje y datos del personaje
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          toast.error("ID de personaje no proporcionado", {
            position: "top-center"
          });
          setLoading(false);
          return;
        }

        const characterId = parseInt(id);
        const [itemsResponse, characterResponse] = await Promise.all([
          itemsAPI.getCharacterItems(id),
          charactersAPI.getCharacter(characterId)
        ]);

        setItems(itemsResponse);
        setCharacter(characterResponse);
      } catch (error: any) {
        let errorMessage = "Error cargando el inventario";

        if (error.response) {
          errorMessage = error.response.data.message || errorMessage;
        }

        toast.error(errorMessage, {
          position: "top-center"
        });
        console.error("Error loading inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleItemUpdate = (updatedItem: ItemDTO) => {
    setItems(prevItems =>
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  };

  const handleWeightSave = async ({ value, isManual }: { value: number; isManual: boolean }) => {
    if (!character || !id) return;

    const newCharacterState = {
      ...character,
      maxWeight: Number(value) || 0,
      maxWeightManual: isManual,
    };

    // Actualizamos inmediatamente en la UI
    setCharacter(newCharacterState);

    try {
      const characterId = parseInt(id);
      await charactersAPI.updateCharacter(characterId, {
        maxWeight: newCharacterState.maxWeight,
        maxWeightManual: isManual
      });

      toast.success("Peso máximo actualizado", { position: "top-center" });
    } catch (error: any) {
      toast.error("Error actualizando el peso máximo", { position: "top-center" });
      console.error(error);
    }
  };


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

        <PageHeader
          title="Inventario"
          menuItems={menuItems}
        />

        {/* Contenedor principal de controles */}
        <div className="mb-6 space-y-4">

          {/* Primera fila: Búsqueda y Peso */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar objetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md w-full bg-white text-sm focus:outline-none focus:border-amber-500 h-full"
              />
            </div>

            {/* Peso actual/máximo y botón de configuración */}
            <div className="flex items-center gap-2 justify-center sm:justify-end bg-white rounded-md px-4 py-2 border border-white shadow-sm">
              <div className="text-sm font-medium text-amber-900 whitespace-nowrap">
                Peso: {actualWeight.toFixed(1)}/{isNaN(maxWeight) ? '0.0' : maxWeight.toFixed(1)} lb
              </div>
              <button
                onClick={() => setIsWeightModalOpen(true)}
                className="p-1 text-amber-600 hover:text-amber-800"
                title="Configurar peso máximo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Segunda fila: Filtros y Ordenación */}
          <div className="flex flex-col md:flex-row gap-4 items-start bg-white rounded-md p-4 border border-white shadow-sm">

            {/* Filtro por categoría */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-medium text-amber-900 whitespace-nowrap">Filtrar:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | 'ALL')}
                className="border border-amber-300 rounded-md px-2 py-1 bg-white text-sm w-full md:w-auto"
              >
                <option value="ALL">Todas las categorías</option>
                {Object.values(ItemCategory).map(category => (
                  <option key={category} value={category}>
                    {itemCategoryTranslations[category]}s
                  </option>
                ))}
              </select>
            </div>

            {/* Botones de ordenación */}
            <div className="flex flex-col xs:flex-row gap-2 w-full md:w-auto">
              <label className="text-sm font-medium text-amber-900 whitespace-nowrap pt-1">Ordenar por:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => requestSort('name')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm border transition-colors ${sortConfig.key === 'name'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                >
                  Nombre
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="h-3 w-3" /> :
                      <ArrowDownIcon className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('cost')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm border transition-colors ${sortConfig.key === 'cost'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                >
                  Precio
                  {sortConfig.key === 'cost' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="h-3 w-3" /> :
                      <ArrowDownIcon className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('weight')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm border transition-colors ${sortConfig.key === 'weight'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-amber-50'
                    }`}
                >
                  Peso
                  {sortConfig.key === 'weight' && (
                    sortConfig.direction === 'asc' ?
                      <ArrowUpIcon className="h-3 w-3" /> :
                      <ArrowDownIcon className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        {searchQuery && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 rounded-md px-4 py-2 border border-amber-200">
            {sortedItems.length} objeto{sortedItems.length !== 1 ? 's' : ''} encontrado{sortedItems.length !== 1 ? 's' : ''} para "{searchQuery}"
          </div>
        )}

        {/* Lista de ítems agrupados por categoría */}
        <div className="space-y-6">
          {/* Sección para objetos equipados */}
          {equippedItems.length > 0 && (
            <div key="equipped" className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-xl font-bold text-amber-900 mb-4">
                Equipados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equippedItems.map(item => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer"
                    onClick={() => {
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
                          <div className="flex gap-2">
                            {item.attuned && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                Sintonizado
                              </span>
                            )}
                            {item.stackable && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                          <div>
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                              Equipado
                            </span>
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
            </div>
          )}

          {Object.values(ItemCategory).map(category => {
            const categoryItems = nonEquippedItemsByCategory.filter(item => item.category === category);
            if (categoryItems.length === 0 && categoryFilter !== 'ALL') return null;

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm p-4">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2 flex justify-between items-center">
                  {itemCategoryTranslations[category]}s
                </h2>

                {categoryItems.length === 0 ? (
                  <p className="text-gray-500 italic">No hay ítems en esta categoría</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 transition-all hover:shadow-md bg-white border-gray-200 cursor-pointer"
                        onClick={() => {
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
                              <div className="flex gap-2">
                                {item.attuned && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                    Sintonizado
                                  </span>
                                )}
                                {item.stackable && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    x{item.quantity}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                              <div>
                                {/* Div vacío para mantener layout */}
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
            );
          })}
        </div>
      </div>

      {/* Modal de detalle del ítem */}
      <ItemDetailModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        item={selectedItem}
        onItemUpdate={handleItemUpdate}
      />

      {/* Modal de configuración de peso */}
      {isWeightModalOpen && character && (
        <ValueOrManualModal
          isOpen={isWeightModalOpen}
          title="Configurar peso máximo"
          initialValue={character.maxWeight}
          initialIsManual={character.maxWeightManual}
          autoValue={character.strength * 5}
          valueLabel="Peso máximo manual"
          autoValueLabel="Peso automático (Fuerza × 5)"
          onSave={handleWeightSave}
          onClose={() => setIsWeightModalOpen(false)}
        />
      )}
    </div>
  );
}