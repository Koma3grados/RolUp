import { XMarkIcon } from "@heroicons/react/24/outline";
import { resetOnTranslations } from "@/types/translations";
import type { ItemPropertyDTO } from "@/types/items";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface ItemPropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: ItemPropertyDTO;
}

export default function ItemPropertyDetailModal({
  isOpen,
  onClose,
  property,
}: ItemPropertyDetailModalProps) {

  useDisableScroll(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">
            Detalles de la propiedad
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {property.name}
            </div>
          </div>

          {/* Descripción - CAMBIO PRINCIPAL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 min-h-[100px] max-h-60 overflow-y-auto">
              {property.description || "Sin descripción"}
            </div>
          </div>

          {/* Usos máximos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos</label>
            <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {property.baseMaxUses > 0 ? property.baseMaxUses : "Ilimitados"}
            </div>
          </div>

          {/* Se reinicia en */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en</label>
            <div className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {resetOnTranslations[property.resetOn]}
            </div>
          </div>

          {/* ID (información adicional) */}
          <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              <span className="font-medium">ID:</span> {property.id}
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}