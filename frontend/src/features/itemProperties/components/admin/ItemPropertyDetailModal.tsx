import { useState, useEffect } from "react";
import { ResetOn } from "@/types/enums";
import { resetOnTranslations } from "@/types/translations";
import type { ItemPropertyDTO } from "@/types/items";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";
import { showConfirmDialog } from "@/components/others/Notification";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemPropertiesAPI } from "@/features/itemProperties/services/ItemProperty";

interface ItemPropertyDetailModalProps {
  isOpen: boolean;
  property: ItemPropertyDTO | null;
  onClose: () => void;
  onDeleteSuccess: (deletedId: number) => void;
  onUpdateSuccess: (updatedProperty: ItemPropertyDTO) => void;
}

export default function ItemPropertyDetailModal({
  isOpen,
  property: initialProperty,
  onClose,
  onDeleteSuccess,
  onUpdateSuccess
}: ItemPropertyDetailModalProps) {
  const [selectedProperty, setSelectedProperty] = useState<ItemPropertyDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useDisableScroll(isOpen);

  // Sincronizar el estado interno cuando cambia la propiedad inicial
  useEffect(() => {
    if (initialProperty) {
      setSelectedProperty(initialProperty);
    }
  }, [initialProperty]);

  const handleFieldChange = <K extends keyof ItemPropertyDTO>(field: K, value: ItemPropertyDTO[K]) => {
    if (!selectedProperty) return;

    setSelectedProperty(prev => ({
      ...prev!,
      [field]: value
    }));
  };

  const handleUpdateProperty = async () => {
    if (!selectedProperty?.id) {
      toast.error("Error: ID de propiedad inválido", { position: "top-center" });
      return;
    }

    setIsLoading(true);
    try {
      const { id, ...propertyDataWithoutId } = selectedProperty;
      const updatedProperty = await itemPropertiesAPI.updateProperty(id, propertyDataWithoutId);

      toast.success("Propiedad actualizada correctamente", { position: "top-center" });
      onUpdateSuccess(updatedProperty);
    } catch (error) {
      console.error("Error actualizando propiedad:", error);
      toast.error("Error actualizando la propiedad", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!selectedProperty?.id) return;

    const confirmed = await showConfirmDialog("¿Estás seguro de que quieres eliminar esta propiedad?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await itemPropertiesAPI.deleteProperty(selectedProperty.id);
      toast.success("Propiedad eliminada correctamente", { position: "top-center" });
      onDeleteSuccess(selectedProperty.id);
      onClose();
    } catch (error) {
      toast.error("Error eliminando la propiedad", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !selectedProperty) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
              🏷️
            </div>
            <h2 className="text-2xl font-bold text-amber-900">
              {selectedProperty.name}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDeleteProperty}
              className="p-2 text-red-500 hover:text-red-700"
              title="Eliminar propiedad"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={selectedProperty.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en</label>
              <select
                value={selectedProperty.resetOn}
                onChange={(e) => handleFieldChange("resetOn", e.target.value as ResetOn)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              >
                {Object.entries(resetOnTranslations).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
              <input
                type="number"
                value={selectedProperty.baseMaxUses}
                onChange={(e) => handleFieldChange("baseMaxUses", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={selectedProperty.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              <span className="font-medium">ID:</span> {selectedProperty.id}
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
            onClick={handleUpdateProperty}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}