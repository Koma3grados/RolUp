import { useState } from "react";
import { ResetOn } from "@/types/enums";
import { resetOnTranslations } from "@/types/translations";
import type { ItemPropertyDTO } from "@/types/items";
import toast from "react-hot-toast";
import { itemPropertiesAPI } from "@/features/itemProperties/services/ItemProperty";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface CreateItemPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newProperty: ItemPropertyDTO) => void;
}

export default function CreateItemPropertyModal({
  isOpen,
  onClose,
  onCreateSuccess
}: CreateItemPropertyModalProps) {
  const [newProperty, setNewProperty] = useState<Partial<ItemPropertyDTO>>({
    name: "",
    description: "",
    baseMaxUses: 0,
    resetOn: ResetOn.LONG_REST,
  });
  const [isLoading, setIsLoading] = useState(false);

  useDisableScroll(isOpen);

  const handleCreateProperty = async () => {
    setIsLoading(true);
    try {
      const newPropertyData = await itemPropertiesAPI.createProperty(newProperty);
      onCreateSuccess(newPropertyData);
      onClose();
      toast.success("Propiedad creada correctamente", {
        position: "top-center"
      });
    } catch (error) {
      console.error("Error creando propiedad:", error);
      toast.error("Error creando la propiedad", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-amber-900">
            Crear nueva propiedad
          </h2>
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

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
              <input
                type="text"
                value={newProperty.name}
                onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en*</label>
              <select
                value={newProperty.resetOn}
                onChange={(e) => setNewProperty({...newProperty, resetOn: e.target.value as ResetOn})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                disabled={isLoading}
              >
                {Object.entries(resetOnTranslations).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos*</label>
              <input
                type="number"
                value={newProperty.baseMaxUses ?? 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setNewProperty({...newProperty, baseMaxUses: isNaN(value) ? 0 : value});
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min={0}
                required
                disabled={isLoading}
                onInvalid={(e) => {
                  e.currentTarget.setCustomValidity("Por favor ingresa un número válido (0 o mayor)");
                }}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción*</label>
            <textarea
              value={newProperty.description || ""}
              onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              required
              disabled={isLoading}
            />
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
            onClick={handleCreateProperty}
            disabled={
              !newProperty.name || 
              !newProperty.description || 
              newProperty.baseMaxUses === undefined || 
              newProperty.baseMaxUses < 0 ||
              isLoading
            }
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {isLoading ? "Creando..." : "Crear propiedad"}
          </button>
        </div>
      </div>
    </div>
  );
}