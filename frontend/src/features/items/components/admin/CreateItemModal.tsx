import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { ItemDTO, ItemPropertyDTO } from "@/types/items";
import { CostUnit, ItemCategory, Rarity } from "@/types/enums";
import { costUnitTranslations, itemCategoryTranslations, rarityTranslations } from "@/types/translations";
import type { CharacterDTO } from "@/types/characters";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemsAPI } from "@/features/items/services/items";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

export interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: ItemPropertyDTO[];
  onCreateSuccess: (newItem: ItemDTO) => void;
  characterId?: string;
  initialCharacter?: CharacterDTO;
}

export default function CreateItemModal({
  isOpen,
  onClose,
  onCreateSuccess,
  characterId,
}: CreateItemModalProps) {

  useDisableScroll(isOpen);

  const [newItem, setNewItem] = useState<Partial<ItemDTO>>({
    name: "",
    descriptionTemplate: "",
    summaryTemplate: "",
    iconUrl: "",
    resetOn: "LONG_REST",
    cost: { quantity: 0, unit: CostUnit.GP },
    rarity: Rarity.COMMON,
    weight: 0,
    category: ItemCategory.OTHER,
    requiresAttunement: false,
    maxUses: 0,
    maxUsesAutoCalculated: false,
    maxUsesFormula: "",
    stackable: true,
    propertyDTOList: [],
  });


  const [showImageSelector, setShowImageSelector] = useState(false); // Estado para modal selector
  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache(); // Contexto de imágenes

  // Cargar imagen cuando se selecciona una nueva
  useEffect(() => {
    if (newItem.iconUrl && !newItem.iconUrl.startsWith('http') && !imageCache[newItem.iconUrl]) {
      loadImageAsBase64(newItem.iconUrl);
    }
  }, [newItem.iconUrl, imageCache, loadImageAsBase64]);

  const handleFieldChange = <K extends keyof ItemDTO>(field: K, value: ItemDTO[K]) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };
  
  const handleCreateItem = async () => {
    if (!newItem.name || !newItem.descriptionTemplate) {
      toast.error("Nombre y descripción son requeridos", {
        position: "top-center",
      });
      return;
    }

    try {
      const newItemData = await itemsAPI.createItem(newItem);
      toast.success("Ítem creado correctamente", { position: "top-center" });
      onCreateSuccess(newItemData);

      if (characterId) {
        try {
          await itemsAPI.addItemToCharacter(parseInt(characterId), newItemData.id, {
            quantity: 1,
            equipped: false,
          });
          toast.success("Ítem asignado al personaje", { position: "top-center" });
        } catch (error) {
          toast.error("Error asignando el ítem al personaje", { position: "top-center" });
        }
      }

      onClose();
    } catch (error) {
      console.error("Error creando ítem:", error);
      toast.error("Error creando el ítem", { position: "top-center" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-amber-900">Crear nuevo ítem</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría*</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                {Object.values(ItemCategory).map(category => (
                  <option key={category} value={category}>
                    {itemCategoryTranslations[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* Rareza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rareza*</label>
              <select
                value={newItem.rarity}
                onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as Rarity })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                {Object.values(Rarity).map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarityTranslations[rarity]}
                  </option>
                ))}
              </select>
            </div>

            {/* Peso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (lb)*</label>
              <input
                type="number"
                value={newItem.weight || 0}
                onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
                step="0.1"
                required
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio*</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newItem.cost?.quantity || 0}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    cost: {
                      ...newItem.cost || { quantity: 0, unit: CostUnit.GP },
                      quantity: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={0}
                  required
                />
                <select
                  value={newItem.cost?.unit || CostUnit.GP}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    cost: {
                      ...newItem.cost || { quantity: 0, unit: CostUnit.GP },
                      unit: e.target.value as CostUnit
                    }
                  })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.values(CostUnit).map(unit => (
                    <option key={unit} value={unit}>
                      {costUnitTranslations[unit]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Se reinicia en */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en*</label>
              <select
                value={newItem.resetOn || "NONE"}
                onChange={(e) => setNewItem({ ...newItem, resetOn: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="LONG_REST">Descanso largo</option>
                <option value="SHORT_REST">Descanso corto</option>
                <option value="SPECIAL">Especial</option>
                <option value="NONE">Ninguno</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 py-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-requiresAttunement"
                checked={newItem.requiresAttunement || false}
                onChange={(e) => setNewItem({ ...newItem, requiresAttunement: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="new-requiresAttunement" className="ml-2 block text-sm text-gray-700">
                Requiere sintonización
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-stackable"
                checked={newItem.stackable ?? true}
                onChange={(e) => setNewItem({ ...newItem, stackable: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="new-stackable" className="ml-2 block text-sm text-gray-700">
                Apilable
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-maxUsesAutoCalculated"
                checked={newItem.maxUsesAutoCalculated || false}
                onChange={(e) => setNewItem({ ...newItem, maxUsesAutoCalculated: e.target.checked })}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="new-maxUsesAutoCalculated" className="ml-2 block text-sm text-gray-700">
                Usos máximos calculados
              </label>
            </div>
          </div>

          {/* Usos máximos (condicional) */}
          {newItem.maxUsesAutoCalculated ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula</label>
              <input
                type="text"
                value={newItem.maxUsesFormula || ""}
                onChange={(e) => setNewItem({ ...newItem, maxUsesFormula: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ej: nivel + modificador"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
              <input
                type="number"
                value={newItem.maxUses || 0}
                onChange={(e) => setNewItem({ ...newItem, maxUses: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
              />
            </div>
          )}

          {/* Campos específicos por categoría */}
          {newItem.category === ItemCategory.WEAPON && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcance</label>
                <input
                  type="text"
                  value={newItem.range || ""}
                  onChange={(e) => setNewItem({ ...newItem, range: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="5 pies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daño</label>
                <input
                  type="text"
                  value={newItem.damage || ""}
                  onChange={(e) => setNewItem({ ...newItem, damage: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="1d6"
                />
              </div>
            </div>
          )}

          {newItem.category === ItemCategory.ARMOR && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clase de Armadura</label>
              <input
                type="text"
                value={newItem.armorClassFormula || ""}
                onChange={(e) => setNewItem({ ...newItem, armorClassFormula: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="10 + modificador de Destreza"
              />
            </div>
          )}

          {/* Icono (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItem.iconUrl || ""}
                  onChange={(e) => handleFieldChange("iconUrl", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ruta de la imagen"
                  readOnly
                />
                <button
                  onClick={() => setShowImageSelector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Seleccionar
                </button>
              </div>
              {newItem.iconUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                  <ImageThumbnail
                    file={{
                      isDirectory: false,
                      path: newItem.iconUrl,
                      name: newItem.iconUrl.split('/').pop() || 'icon',
                      extension: newItem.iconUrl.split('.').pop() || ''
                    }}
                    imageCache={imageCache}
                    loadingImages={loadingImages}
                    size="md"
                  />
                </div>
              )}
            </div>

          {/* Descripción completa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción completa*</label>
            <textarea
              value={newItem.descriptionTemplate || ""}
              onChange={(e) => setNewItem({ ...newItem, descriptionTemplate: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              required
            />
          </div>

          {/* Resumen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
            <textarea
              value={newItem.summaryTemplate || ""}
              onChange={(e) => setNewItem({ ...newItem, summaryTemplate: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              placeholder="Versión resumida para mostrar en la vista previa"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateItem}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Crear ítem
          </button>
        </div>
      </div>

      {/* Modal selector de imágenes */}
      <ImageSelectorModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelectImage={handleSelectImage}
      />
    </div>
  );
}