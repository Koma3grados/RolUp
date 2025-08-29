import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ItemDTO, ItemPropertyDTO } from "@/types/items";
import { itemCategoryTranslations, rarityTranslations, translateCostUnit } from "@/types/translations";
import { ResetOn, ItemCategory, CostUnit } from "@/types/enums";
import { translateResetOn } from "@/types/translations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ItemPropertyDetailModal from "../../../itemProperties/components/user/ItemPropertyDetailModal";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemsAPI } from "@/features/items/services/items";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDTO | null;
  onItemUpdate?: (item: ItemDTO) => void;
}

export default function ItemDetailModal({
  isOpen,
  onClose,
  item,
  onItemUpdate
}: ItemDetailModalProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [localItem, setLocalItem] = useState(item);
  const [updatingUses, setUpdatingUses] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ItemPropertyDTO | null>(null);

  useDisableScroll(isOpen);

  useEffect(() => {
    if (isOpen && item) {
      setLocalItem(item);
    }
  }, [isOpen, item]);


  if (!isOpen || !localItem) return null;

  const updateCharacterItem = async (updatedData: Partial<ItemDTO>) => {
    try {
      // Llamamos a la API, pero no confiamos en que devuelva el objeto completo
      await itemsAPI.updateCharacterItem(localItem!.id, updatedData);

      // Fabricamos el nuevo objeto fusionando el viejo con los cambios
      const updatedItem = { ...localItem!, ...updatedData };

      setLocalItem(updatedItem);
      if (onItemUpdate) {
        onItemUpdate(updatedItem);
      }
      return updatedItem;
    } catch (error) {
      toast.error("Error al actualizar ítem");
      throw error;
    }
  };


  const updateProperty = (updatedProperty: ItemPropertyDTO) => {
    setLocalItem({
      ...localItem,
      propertyDTOList: localItem.propertyDTOList.map(prop =>
        prop.id === updatedProperty.id ? updatedProperty : prop
      )
    });
  };

  const updateAttunement = async (attuned: boolean) => {
    try {
      const updatedItem = await updateCharacterItem({ attuned });
      setLocalItem(updatedItem);
    } catch (error) {
      console.error("Error updating attunement:", error);
    }
  };

  const updateEquipped = async (equipped: boolean) => {
    try {
      const updatedItem = await updateCharacterItem({ equipped });
      setLocalItem(updatedItem);
    } catch (error) {
      console.error("Error updating equipped status:", error);
    }
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    try {
      const updatedItem = await updateCharacterItem({ quantity: newQuantity });
      setLocalItem(updatedItem);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const updateUses = async (newUses: number) => {
    if (newUses < 0 || (localItem.maxUses > 0 && newUses > localItem.maxUses)) return;

    setUpdatingUses(true);
    try {
      await updateCharacterItem({ currentUses: newUses });
    } finally {
      setUpdatingUses(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto relative">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-amber-900 absolute left-1/2 transform -translate-x-1/2">
              {localItem.name}
            </h2>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 p-1"
            >
              <XMarkIcon className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 space-y-6">
          {/* Etiquetas */}
          <div className="flex flex-wrap items-center gap-2 mt-0">
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              {itemCategoryTranslations[localItem.category]}
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              {rarityTranslations[localItem.rarity]}
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              {localItem.weight} lb
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              {localItem.cost.quantity} {translateCostUnit(localItem.cost.unit as CostUnit)}
            </span>
          </div>

          {/* Controles de estado */}
          <div className="flex flex-wrap gap-6">
            {/* Sintonización - Solo mostrar si el ítem requiere sintonización */}
            {localItem.requiresAttunement && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
                <span className="font-medium">Sintonizado</span>
                <button
                  onClick={async () => updateAttunement(!localItem.attuned)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localItem.attuned ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${localItem.attuned ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            )}

            {/* Equipado */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
              <span className="font-medium">Equipado</span>
              <button
                onClick={async () => updateEquipped(!localItem.equipped)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${localItem.equipped ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${localItem.equipped ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Cantidad (solo si es stackable) */}
          {localItem.stackable && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="font-medium">Cantidad</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(Math.max(0, localItem.quantity - 1))}
                  disabled={localItem.quantity <= 0}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                >
                  -
                </button>
                <input
                  type="number"
                  value={localItem.quantity}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (!isNaN(newValue) && newValue >= 0) {
                      updateQuantity(newValue);
                    }
                  }}
                  className="w-16 text-center border border-gray-300 rounded-md px-2 py-1  appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                />
                <button
                  onClick={() => updateQuantity(localItem.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Usos disponibles del ítem */}
          {localItem.maxUses > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="font-medium">Usos disponibles</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateUses(Math.max(0, localItem.currentUses - 1))}
                  disabled={updatingUses || localItem.currentUses <= 0}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                >
                  -
                </button>
                <span className="font-medium">
                  {localItem.currentUses}/{localItem.maxUses}
                </span>
                <button
                  onClick={() => updateUses(localItem.currentUses + 1)}
                  disabled={updatingUses || localItem.currentUses >= localItem.maxUses}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Reset info */}
          {localItem.maxUses === 0 ? (
            <div className="text-sm text-gray-500 italic">Sin usos limitados</div>
          ) : localItem.resetOn && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Se reinicia:</span> {translateResetOn(localItem.resetOn as ResetOn)}
            </div>
          )}

          {/* Selector Descripción/Resumen */}
          {localItem.summaryTemplate && (
            <div className="flex justify-center mt-6">
              <div className="relative flex items-center bg-gray-100 rounded-full p-1">
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${!showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                    }`}
                  onClick={() => setShowSummary(false)}
                >
                  Descripción
                </button>
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                    }`}
                  onClick={() => setShowSummary(true)}
                >
                  Resumen
                </button>
              </div>
            </div>
          )}

          {/* Contenido dinámico */}
          <div className="mt-6">
            {!showSummary ? (
              <>
                <h3 className="text-xl font-semibold text-amber-800 mb-4">Descripción</h3>
                <div className="prose prose-base max-w-none text-gray-700 whitespace-pre-line break-words overflow-wrap-anywhere">
                  {localItem.descriptionTemplate || "No hay descripción disponible."}
                </div>

              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-amber-800 mb-4">Resumen</h3>
                <div className="prose prose-base max-w-none text-gray-700 whitespace-pre-line break-words overflow-wrap-anywhere">
                  {localItem.summaryTemplate}
                </div>
              </>
            )}
          </div>

          {/* Propiedades específicas */}
          {localItem.category === ItemCategory.WEAPON && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-amber-800">Propiedades de arma</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daño</label>
                  <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
                    {localItem.damage || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alcance</label>
                  <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
                    {localItem.range || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {localItem.category === ItemCategory.ARMOR && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-amber-800">Propiedades de armadura</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clase de Armadura</label>
                <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
                  {localItem.armorClassFormula || "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* Propiedades */}
          {localItem.propertyDTOList?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-amber-800 mb-4">Propiedades del objeto</h3>
              <div className="flex flex-wrap gap-2">
                {localItem.propertyDTOList.map(prop => (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-sm hover:bg-amber-100 transition-colors"
                  >
                    {prop.name}
                    {prop.baseMaxUses > 0 && (
                      <span className="ml-1 text-xs bg-amber-100 text-amber-800 px-1 rounded">
                        {prop.currentUses || 0}/{prop.baseMaxUses}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles de propiedad */}
      {selectedProperty && (
        <ItemPropertyDetailModal
          isOpen={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
          property={selectedProperty}
          onUpdate={updateProperty}
        />
      )}
    </div>
  );
}