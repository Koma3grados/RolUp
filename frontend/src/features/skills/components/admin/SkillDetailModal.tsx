import { useState, useEffect } from "react";
import { ResetOn, Category } from "@/types/enums";
import { resetOnTranslations, categoryTranslations } from "@/types/translations";
import type { SkillDTO } from "@/types/skills";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";
import { showConfirmDialog } from "@/components/others/Notification";
import { skillsAPI } from "@/features/skills/services/skills";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail"; // Importar componente
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal"; // Importar modal selector
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

interface SkillDetailModalProps {
  isOpen: boolean;
  skill: SkillDTO;
  onClose: () => void;
  onDeleteSuccess: (deletedId: number) => void;
  onUpdateSuccess: (updatedSkill: SkillDTO) => void;
}

export default function SkillDetailModal({
  isOpen,
  skill: initialSkill,
  onClose,
  onDeleteSuccess,
  onUpdateSuccess
}: SkillDetailModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillDTO>(initialSkill);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false); // Estado para modal selector

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache(); // Usar contexto

  useDisableScroll(isOpen);

  // Cargar imagen cuando se selecciona una nueva
  useEffect(() => {
    if (selectedSkill.iconUrl && !selectedSkill.iconUrl.startsWith('http') && !imageCache[selectedSkill.iconUrl]) {
      loadImageAsBase64(selectedSkill.iconUrl);
    }
  }, [selectedSkill.iconUrl, imageCache, loadImageAsBase64]);

  const handleFieldChange = <K extends keyof SkillDTO>(field: K, value: SkillDTO[K]) => {
    setSelectedSkill(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };

  const handleUpdateSkill = async (id: number, skillData: SkillDTO) => {
    setIsLoading(true);
    try {
      if (!id || isNaN(id)) {
        throw new Error("ID de habilidad inválido");
      }

      // Procesar los datos como en la versión original
      const { id: _, ...skillDataWithoutId } = skillData;
      const skillToUpdate = {
        ...skillDataWithoutId,
        categories: skillData.categories.map(c => c.toUpperCase())
      };

      const response = await skillsAPI.updateSkill(id, skillToUpdate);
      onUpdateSuccess(response);
      toast.success("Habilidad actualizada correctamente", {
        position: "top-center"
      });
    } catch (error) {
      console.error("Error actualizando habilidad:", error);
      toast.error("Error al actualizar la habilidad", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!id || isNaN(id)) {
      toast.error("ID de habilidad inválido", {
        position: "top-center"
      });
      return;
    }

    const confirmed = await showConfirmDialog("¿Estás seguro de que quieres eliminar esta habilidad?");
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      await skillsAPI.deleteSkill(id);
      onDeleteSuccess(id);
      onClose();
      toast.success("Habilidad eliminada correctamente", {
        position: "top-center"
      });
    } catch (error) {
      toast.error("Error al eliminar la habilidad", {
        position: "top-center"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Reemplazar el icono simple por ImageThumbnail */}
              {selectedSkill.iconUrl ? (
                <ImageThumbnail
                  file={{
                    isDirectory: false,
                    path: selectedSkill.iconUrl,
                    name: selectedSkill.name || 'skill',
                    extension: selectedSkill.iconUrl.split('.').pop() || ''
                  }}
                  imageCache={imageCache}
                  loadingImages={loadingImages}
                  size="sm"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                  ⚡
                </div>
              )}
              <h2 className="text-2xl font-bold text-amber-900">
                {selectedSkill.name}
              </h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!selectedSkill?.id) {
                    toast.error("Error: ID de habilidad no disponible", {
                      position: "top-center"
                    });
                    return;
                  }
                  handleDeleteSkill(selectedSkill.id);
                }}
                className="p-2 text-red-500 hover:text-red-700"
                title="Eliminar habilidad"
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
                  value={selectedSkill.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en</label>
                <select
                  value={selectedSkill.resetOn}
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
                  value={selectedSkill.maxUses}
                  onChange={(e) => handleFieldChange("maxUses", parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={1}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCalculated"
                  checked={selectedSkill.autoCalculated}
                  onChange={(e) => handleFieldChange("autoCalculated", e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="autoCalculated" className="ml-2 block text-sm text-gray-700">
                  Cálculo automático
                </label>
              </div>

              {selectedSkill.autoCalculated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula</label>
                  <input
                    type="text"
                    value={selectedSkill.autoFormula}
                    onChange={(e) => handleFieldChange("autoFormula", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ej: nivel + modificador"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorías</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={selectedSkill.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...selectedSkill.categories, category]
                          : selectedSkill.categories.filter(c => c !== category);
                        handleFieldChange("categories", newCategories);
                      }}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor={`category-${category}`} className="ml-1 text-sm text-gray-700">
                      {categoryTranslations[category]}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Icono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedSkill.iconUrl || ""}
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
              {selectedSkill.iconUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                  <ImageThumbnail
                    file={{
                      isDirectory: false,
                      path: selectedSkill.iconUrl,
                      name: selectedSkill.iconUrl.split('/').pop() || 'icon',
                      extension: selectedSkill.iconUrl.split('.').pop() || ''
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
                value={selectedSkill.descriptionTemplate}
                onChange={(e) => handleFieldChange("descriptionTemplate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
              <textarea
                value={selectedSkill.summaryTemplate || ""}
                onChange={(e) => handleFieldChange("summaryTemplate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                placeholder="Versión resumida para mostrar en la vista previa"
                disabled={isLoading}
              />
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
              <p>
                <span className="font-medium">ID:</span> {selectedSkill.id}
              </p>
              <p>
                <span className="font-medium">Fuente:</span> {selectedSkill.source || "Desconocida"}
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
                if (!selectedSkill?.id) {
                  toast.error("Error: ID de habilidad no disponible", {
                    position: "top-center"
                  });
                  return;
                }
                handleUpdateSkill(selectedSkill.id, selectedSkill);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal selector de imágenes */}
      <ImageSelectorModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelectImage={handleSelectImage}
      />
    </>
  );
}