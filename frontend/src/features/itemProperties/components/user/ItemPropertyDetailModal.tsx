import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { ItemPropertyDTO } from "@/types/items";
import { resetOnTranslations } from "@/types/translations";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemsAPI } from "@/features/items/services/items";

interface ItemPropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: ItemPropertyDTO;
  onUpdate: (updatedProperty: ItemPropertyDTO) => void;
}

export default function ItemPropertyDetailModal({
  isOpen,
  onClose,
  property,
  onUpdate,
}: ItemPropertyDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localCurrentUses, setLocalCurrentUses] = useState(property.currentUses || 0);

  useDisableScroll(isOpen);

  // Sincronizar localCurrentUses con property cuando cambie la prop (ej. al abrir modal o recibir nueva propiedad)
  useEffect(() => {
    setLocalCurrentUses(property.currentUses || 0);
  }, [property.currentUses]);

  const handleUpdateUses = async (newUses: number) => {
    if (newUses < 0 || newUses > property.baseMaxUses) return;

    setIsUpdating(true);
    setLocalCurrentUses(newUses);

    try {
      const updatedProperty = {
        ...property,
        currentUses: newUses,
      };
      onUpdate(updatedProperty);

      await itemsAPI.updateCharacterItemProperty(property.id, {
        currentUses: newUses,
      });

      toast.success("Usos actualizados");
    } catch (error) {
      setLocalCurrentUses(property.currentUses || 0);
      onUpdate({
        ...property,
        currentUses: property.currentUses,
      });
      toast.error("Error al actualizar usos");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  const isPassive = property.baseMaxUses === 0;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">{property.name}</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 min-h-[100px]">
              {property.description || "Sin descripción"}
            </div>
          </div>

          {/* Usos disponibles - Solo mostrar si no es pasiva */}
          {!isPassive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Usos disponibles</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleUpdateUses(localCurrentUses - 1)}
                  disabled={isUpdating || localCurrentUses <= 0}
                  className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 text-xl"
                >
                  -
                </button>

                <div className="text-center">
                  <div className="text-3xl font-bold">{localCurrentUses}</div>
                  <div className="text-sm text-gray-500">de {property.baseMaxUses} usos</div>
                </div>

                <button
                  onClick={() => handleUpdateUses(localCurrentUses + 1)}
                  disabled={isUpdating || localCurrentUses >= property.baseMaxUses}
                  className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50 text-xl"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Mostrar "Pasiva" solo si es una propiedad pasiva */}
          {isPassive && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="italic text-gray-500">
                Pasiva
              </div>
            </div>
          )}

          {/* Reset info - Solo mostrar si no es NONE */}
          {property.resetOn !== 'NONE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en</label>
              <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
                {resetOnTranslations[property.resetOn]}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Cerrar
          </button>
          {!isPassive && (
            <button
              onClick={() => handleUpdateUses(property.baseMaxUses)}
              disabled={isUpdating || localCurrentUses >= property.baseMaxUses}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Restaurar todos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}