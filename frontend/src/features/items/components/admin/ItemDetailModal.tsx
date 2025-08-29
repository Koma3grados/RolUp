import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { ItemDTO, ItemPropertyDTO } from "@/types/items";
import { CostUnit, ItemCategory, Rarity } from "@/types/enums";
import { costUnitTranslations, itemCategoryTranslations, rarityTranslations } from "@/types/translations";
import { showConfirmDialog } from "@/components/others/Notification";
import ItemPropertyDetailModal from "./ItemPropertyDetailModal";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemsAPI } from "@/features/items/services/items";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDTO;
  onDeleteSuccess: (deletedItemId: number) => void;
  onUpdateSuccess: (updatedItem: ItemDTO) => void;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  item: initialItem,
  onDeleteSuccess,
  onUpdateSuccess,
}: ItemDetailModalProps) {

  useDisableScroll(isOpen);

  const [currentItem, setCurrentItem] = useState<Partial<ItemDTO>>({
    id: initialItem.id,
    name: initialItem.name,
    category: initialItem.category,
    rarity: initialItem.rarity,
    weight: initialItem.weight,
    cost: initialItem.cost,
    resetOn: initialItem.resetOn,
    requiresAttunement: initialItem.requiresAttunement,
    stackable: initialItem.stackable,
    maxUsesAutoCalculated: initialItem.maxUsesAutoCalculated,
    maxUses: initialItem.maxUses,
    maxUsesFormula: initialItem.maxUsesFormula,
    range: initialItem.range,
    damage: initialItem.damage,
    armorClassFormula: initialItem.armorClassFormula,
    iconUrl: initialItem.iconUrl,
    descriptionTemplate: initialItem.descriptionTemplate,
    summaryTemplate: initialItem.summaryTemplate,
    propertyDTOList: initialItem.propertyDTOList
  });

  const [selectedProperty, setSelectedProperty] = useState<ItemPropertyDTO | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [showImageSelector, setShowImageSelector] = useState(false);
  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

  useEffect(() => {
    if (currentItem.iconUrl && !currentItem.iconUrl.startsWith('http') && !imageCache[currentItem.iconUrl]) {
      loadImageAsBase64(currentItem.iconUrl);
    }
  }, [currentItem.iconUrl, imageCache, loadImageAsBase64]);

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };


  const handleFieldChange = <K extends keyof ItemDTO>(field: K, value: ItemDTO[K]) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateItem = async () => {
    if (!currentItem.id) {
      toast.error("Error: ID de ítem no disponible", { position: "top-center" });
      return;
    }

    setIsLoading(true);
    try {
      const updatedItem = await itemsAPI.updateItem(currentItem.id, currentItem);
      toast.success("Ítem actualizado correctamente", { position: "top-center" });
      onUpdateSuccess(updatedItem);
      onClose();
    } catch (error) {
      toast.error("Error actualizando el ítem", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem.id) return;

    const confirmed = await showConfirmDialog("¿Estás seguro de que quieres eliminar este ítem?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await itemsAPI.deleteItem(currentItem.id);
      toast.success("Ítem eliminado correctamente", { position: "top-center" });
      onDeleteSuccess(currentItem.id);
      onClose();
    } catch (error) {
      toast.error("Error eliminando el ítem", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentItem.iconUrl ? (
              <img
                src={currentItem.iconUrl}
                alt={currentItem.name}
                className="w-10 h-10 rounded-full bg-amber-100 p-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                🎲
              </div>
            )}
            <h2 className="text-2xl font-bold text-amber-900">
              {currentItem.name}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDeleteItem}
              className="p-2 text-red-500 hover:text-red-700"
              title="Eliminar ítem"
              disabled={isLoading}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={currentItem.name || ''}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={currentItem.category || ''}
                onChange={(e) => handleFieldChange("category", e.target.value as ItemCategory)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Rareza</label>
              <select
                value={currentItem.rarity || ''}
                onChange={(e) => handleFieldChange("rarity", e.target.value as Rarity)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (lb)</label>
              <input
                type="number"
                value={currentItem.weight || 0}
                onChange={(e) => handleFieldChange("weight", parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
                step="0.1"
                disabled={isLoading}
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currentItem.cost?.quantity || 0}
                  onChange={(e) => handleFieldChange("cost", {
                    quantity: parseFloat(e.target.value) || 0,
                    unit: currentItem.cost?.unit || CostUnit.GP
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={0}
                  disabled={isLoading}
                />
                <select
                  value={currentItem.cost?.unit || CostUnit.GP}
                  onChange={(e) => handleFieldChange("cost", {
                    quantity: currentItem.cost?.quantity || 0,
                    unit: e.target.value as CostUnit
                  })}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  disabled={isLoading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en</label>
              <select
                value={currentItem.resetOn || 'NONE'}
                onChange={(e) => handleFieldChange("resetOn", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
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
                id="requiresAttunement"
                checked={currentItem.requiresAttunement || false}
                onChange={(e) => handleFieldChange("requiresAttunement", e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="requiresAttunement" className="ml-2 block text-sm text-gray-700">
                Requiere sintonización
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="stackable"
                checked={currentItem.stackable || false}
                onChange={(e) => handleFieldChange("stackable", e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="stackable" className="ml-2 block text-sm text-gray-700">
                Apilable
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="maxUsesAutoCalculated"
                checked={currentItem.maxUsesAutoCalculated || false}
                onChange={(e) => handleFieldChange("maxUsesAutoCalculated", e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="maxUsesAutoCalculated" className="ml-2 block text-sm text-gray-700">
                Usos máximos calculados
              </label>
            </div>
          </div>

          {/* Usos máximos (condicional) */}
          {currentItem.maxUsesAutoCalculated ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula</label>
              <input
                type="text"
                value={currentItem.maxUsesFormula || ""}
                onChange={(e) => handleFieldChange("maxUsesFormula", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ej: nivel + modificador"
                disabled={isLoading}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
              <input
                type="number"
                value={currentItem.maxUses || 0}
                onChange={(e) => handleFieldChange("maxUses", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Campos específicos por categoría */}
          {currentItem.category === ItemCategory.WEAPON && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcance</label>
                <input
                  type="text"
                  value={currentItem.range || ""}
                  onChange={(e) => handleFieldChange("range", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="5 pies"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daño</label>
                <input
                  type="text"
                  value={currentItem.damage || ""}
                  onChange={(e) => handleFieldChange("damage", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="1d6"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {currentItem.category === ItemCategory.ARMOR && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clase de Armadura</label>
              <input
                type="text"
                value={currentItem.armorClassFormula || ""}
                onChange={(e) => handleFieldChange("armorClassFormula", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="10 + modificador de Destreza"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Icono (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icono (opcional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentItem.iconUrl || ""}
                onChange={(e) => handleFieldChange("iconUrl", e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ruta de la imagen"
                readOnly
                disabled={isLoading}
              />
              <button
                onClick={() => setShowImageSelector(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Seleccionar
              </button>
            </div>
            {currentItem.iconUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                <ImageThumbnail
                  file={{
                    isDirectory: false,
                    path: currentItem.iconUrl,
                    name: currentItem.iconUrl.split('/').pop() || 'icon',
                    extension: currentItem.iconUrl.split('.').pop() || ''
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción completa</label>
            <textarea
              value={currentItem.descriptionTemplate || ""}
              onChange={(e) => handleFieldChange("descriptionTemplate", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              disabled={isLoading}
            />
          </div>

          {/* Resumen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
            <textarea
              value={currentItem.summaryTemplate || ""}
              onChange={(e) => handleFieldChange("summaryTemplate", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              placeholder="Versión resumida para mostrar en la vista previa"
              disabled={isLoading}
            />
          </div>

          {/* Propiedades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propiedades</label>
            <div className="space-y-2">
              {currentItem.propertyDTOList?.length ? (
                <div className="flex flex-wrap gap-2">
                  {currentItem.propertyDTOList?.map(prop => (
                    <button
                      key={prop.id}
                      onClick={() => {
                        setSelectedProperty(prop);
                        setIsPropertyModalOpen(true);
                      }}
                      className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-sm flex items-center hover:bg-amber-100 transition-colors"
                    >
                      <span>{prop.name}</span>
                      {prop.baseMaxUses > 0 && (
                        <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1 rounded">
                          {prop.baseMaxUses} usos
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Este ítem no tiene propiedades asignadas</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              <span className="font-medium">ID:</span> {currentItem.id}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdateItem}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <ItemPropertyDetailModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        property={selectedProperty!}
      />

      <ImageSelectorModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelectImage={handleSelectImage}
      />

    </div>
  );
}