import { useEffect, useState } from "react";
import { School, Category } from "@/types/enums";
import { schoolTranslations, translateCategory, translateSchool } from "@/types/translations";
import type { SpellDTO } from "@/types/spells";
import { schoolStyles } from "@/types/spells";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";
import { showConfirmDialog } from "@/components/others/Notification";
import { spellsAPI } from "@/features/spells/services/spells";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";

interface SpellDetailModalProps {
  isOpen: boolean;
  spell: SpellDTO;
  onClose: () => void;
  onDeleteSuccess: (deletedId: number) => void;
  onUpdateSuccess: (updatedSpell: SpellDTO) => void;
}

export default function SpellDetailModal({
  isOpen,
  spell: initialSpell,
  onClose,
  onDeleteSuccess,
  onUpdateSuccess
}: SpellDetailModalProps) {

  const [selectedSpell, setSelectedSpell] = useState<Partial<SpellDTO>>({
    id: initialSpell.id,
    name: initialSpell.name,
    level: initialSpell.level,
    school: initialSpell.school,
    descriptionTemplate: initialSpell.descriptionTemplate,
    summaryTemplate: initialSpell.summaryTemplate,
    iconUrl: initialSpell.iconUrl,
    concentration: initialSpell.concentration,
    categories: initialSpell.categories
  });

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();
  useEffect(() => {
    if (selectedSpell.iconUrl && !selectedSpell.iconUrl.startsWith('http') && !imageCache[selectedSpell.iconUrl]) {
      loadImageAsBase64(selectedSpell.iconUrl);
    }
  }, [selectedSpell.iconUrl, imageCache]);

  useDisableScroll(isOpen);

  const [isLoading, setIsLoading] = useState(false);

  const handleFieldChange = <K extends keyof SpellDTO>(field: K, value: SpellDTO[K]) => {
    setSelectedSpell(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateSpell = async (id: number, spellData: Partial<SpellDTO>) => {
    setIsLoading(true);
    try {
      const dataToSend = {
        ...spellData,
        school: spellData.school?.toUpperCase(),
        categories: spellData.categories?.map(c => c.toUpperCase())
      } as Partial<SpellDTO>;

      const updatedSpell = await spellsAPI.updateSpell(id, dataToSend);
      onUpdateSuccess(updatedSpell);
      toast.success("Conjuro actualizado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar el conjuro");
    } finally {
      setIsLoading(false);
    }
  };

  const [showImageSelector, setShowImageSelector] = useState(false);

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };

  const handleDeleteSpell = async (id: number) => {
    const confirmed = await showConfirmDialog("¿Estás seguro de que quieres eliminar este conjuro?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await spellsAPI.deleteSpell(id);
      onDeleteSuccess(id);
      onClose();
      toast.success("Conjuro eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el conjuro");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Obtener estilos de la escuela del conjuro
  const schoolKey = (selectedSpell.school ?? School.ABJURATION).toLowerCase() as keyof typeof schoolStyles;
  const schoolStyle = schoolStyles[schoolKey] || schoolStyles.default;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {selectedSpell.iconUrl ? (
              <ImageThumbnail
                file={{
                  isDirectory: false,
                  path: selectedSpell.iconUrl,
                  name: selectedSpell.name || 'icon',
                  extension: selectedSpell.iconUrl.split('.').pop() || ''
                }}
                imageCache={imageCache}
                loadingImages={loadingImages}
                size="sm"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${schoolStyle.bgColor} flex items-center justify-center text-xl`}>
                {schoolStyle.icon}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedSpell.name}
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!selectedSpell?.id) {
                  toast.error("Error: ID de conjuro no disponible", {
                    position: "top-center"
                  });
                  return;
                }
                handleDeleteSpell(selectedSpell.id);
              }}
              className="p-2 text-red-500 hover:text-red-700"
              title="Eliminar conjuro"
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
                value={selectedSpell.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
              <select
                value={selectedSpell.level}
                onChange={(e) => handleFieldChange("level", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl === 0 ? "Truco" : `Nivel ${lvl}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
              <select
                value={selectedSpell.school ?? ''}
                onChange={(e) => handleFieldChange("school", e.target.value as School)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isLoading}
              >
                {Object.entries(schoolTranslations).map(([key]) => (
                  <option key={key} value={key}>{translateSchool(key)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="concentration"
                checked={selectedSpell.concentration}
                onChange={(e) => handleFieldChange("concentration", e.target.checked)}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="concentration" className="ml-2 block text-sm text-gray-700">
                Concentración
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(Category).map(category => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={(selectedSpell.categories || []).includes(category)}
                    onChange={(e) => {
                      const currentCategories = selectedSpell.categories || [];
                      const newCategories = e.target.checked
                        ? [...currentCategories, category]
                        : currentCategories.filter(c => c !== category);
                      handleFieldChange("categories", newCategories);
                    }}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <label htmlFor={`category-${category}`} className="ml-1 text-sm text-gray-700">
                    {translateCategory(category)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL del icono</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedSpell.iconUrl || ""}
                onChange={(e) => handleFieldChange("iconUrl", e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://ejemplo.com/imagen.png"
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
            {selectedSpell.iconUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                <ImageThumbnail
                  file={{
                    isDirectory: false,
                    path: selectedSpell.iconUrl,
                    name: selectedSpell.iconUrl.split('/').pop() || 'icon',
                    extension: selectedSpell.iconUrl.split('.').pop() || ''
                  }}
                  imageCache={imageCache}
                  loadingImages={loadingImages}
                  size="md"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción completa</label>
            <textarea
              value={selectedSpell.descriptionTemplate}
              onChange={(e) => handleFieldChange("descriptionTemplate", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
            <textarea
              value={selectedSpell.summaryTemplate || ""}
              onChange={(e) => handleFieldChange("summaryTemplate", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              placeholder="Versión resumida para mostrar en la vista previa"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              <span className="font-medium">ID:</span> {selectedSpell.id}
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
            onClick={() => {
              if (!selectedSpell?.id) {
                toast.error("Error: ID de conjuro no disponible", {
                  position: "top-center"
                });
                return;
              }
              handleUpdateSpell(selectedSpell.id, selectedSpell);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
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