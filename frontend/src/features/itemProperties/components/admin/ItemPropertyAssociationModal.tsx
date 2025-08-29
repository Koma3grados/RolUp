import { useState } from "react";
import type { ItemDTO } from "@/types/items";
import toast from "react-hot-toast";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { itemPropertiesAPI } from "@/features/itemProperties/services/ItemProperty";

interface ItemPropertyAssociationModalProps {
  isOpen: boolean;
  selectedPropertyIds: number[];
  items: ItemDTO[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ItemPropertyAssociationModal({
  isOpen,
  selectedPropertyIds,
  items,
  onClose,
  onSuccess
}: ItemPropertyAssociationModalProps) {
  const [itemId, setItemId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useDisableScroll(isOpen);

  const handleAssociate = async () => {
    if (!itemId) return;

    setIsLoading(true);
    try {
      await itemPropertiesAPI.associatePropertiesToItem(selectedPropertyIds, parseInt(itemId));
      toast.success("Propiedades asociadas correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al asociar propiedades", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisassociate = async () => {
    if (!itemId) return;

    setIsLoading(true);
    try {
      await itemPropertiesAPI.removePropertiesFromItem(selectedPropertyIds, parseInt(itemId));
      toast.success("Propiedades desasociadas correctamente", {
        position: "top-center"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al desasociar propiedades", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedPropertyIds.length > 1
            ? `Gestionar ${selectedPropertyIds.length} propiedades`
            : `Gestionar 1 propiedad`}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar ítem</label>
            {items.length === 0 ? (
              <p className="text-gray-500 italic">No hay ítems registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 transition-all hover:shadow-md cursor-pointer ${itemId === item.id.toString()
                        ? "ring-2 ring-amber-500 bg-amber-50"
                        : "bg-white border-gray-200"
                      }`}
                    onClick={() => setItemId(item.id.toString())}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                        {item.iconUrl ? (
                          <img src={item.iconUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">🎲</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            onClick={handleDisassociate}
            disabled={!itemId || selectedPropertyIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
          >
            {isLoading ? "Procesando..." : "Desasociar"}
          </button>

          <button
            onClick={handleAssociate}
            disabled={!itemId || selectedPropertyIds.length === 0 || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300"
          >
            {isLoading ? "Procesando..." : "Asociar"}
          </button>
        </div>
      </div>
    </div>
  );
}