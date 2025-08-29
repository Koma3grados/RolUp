import { useState, useEffect } from "react";
import { ResetOn, Category } from "@/types/enums";
import { resetOnTranslations, categoryTranslations } from "@/types/translations";
import type { SkillDTO } from "@/types/skills";
import toast from "react-hot-toast";
import { skillsAPI } from "@/features/skills/services/skills";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newSkill: SkillDTO) => void;
}

export default function CreateSkillModal({
  isOpen,
  onClose,
  onCreateSuccess
}: CreateSkillModalProps) {
  const [newSkill, setNewSkill] = useState<Partial<SkillDTO>>({
    name: "",
    descriptionTemplate: "",
    summaryTemplate: "",
    iconUrl: "",
    resetOn: ResetOn.LONG_REST,
    // currentUses: 0,
    maxUses: 1,
    autoCalculated: false,
    autoFormula: "",
    categories: []
  });

  const [showImageSelector, setShowImageSelector] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

  useDisableScroll(isOpen);

  // Cargar imagen cuando se selecciona una nueva
  useEffect(() => {
    if (newSkill.iconUrl && !newSkill.iconUrl.startsWith('http') && !imageCache[newSkill.iconUrl]) {
      loadImageAsBase64(newSkill.iconUrl);
    }
  }, [newSkill.iconUrl, imageCache, loadImageAsBase64]);

  const handleFieldChange = <K extends keyof SkillDTO>(field: K, value: SkillDTO[K]) => {
    setNewSkill(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };

  const handleCreateSkill = async () => {
    try {
      const skillToCreate = {
        ...newSkill,
        categories: newSkill.categories?.map(c => c.toUpperCase())
      } as SkillDTO;
      
      const response = await skillsAPI.createSkill(skillToCreate);
      onCreateSuccess(response);
      onClose();
      
      setNewSkill({
        name: "",
        descriptionTemplate: "",
        summaryTemplate: "",
        iconUrl: "",
        resetOn: ResetOn.LONG_REST,
        // currentUses: 0,
        maxUses: 1,
        autoCalculated: false,
        autoFormula: "",
        categories: []
      });
      
      toast.success("Habilidad creada correctamente");
    } catch (error) {
      toast.error("Error al crear la habilidad", {
        position: "top-center"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-900">
              Crear nueva habilidad
            </h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                <input
                  type="text"
                  value={newSkill.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Se reinicia en*</label>
                <select
                  value={newSkill.resetOn}
                  onChange={(e) => handleFieldChange("resetOn", e.target.value as ResetOn)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
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
                  value={newSkill.maxUses ?? 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    handleFieldChange("maxUses", isNaN(value) ? 0 : value);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min={0}
                  required
                  onInvalid={(e) => {
                    e.currentTarget.setCustomValidity("Por favor ingresa un número válido (0 o mayor)");
                  }}
                  onInput={(e) => e.currentTarget.setCustomValidity("")}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="new-autoCalculated"
                  checked={newSkill.autoCalculated || false}
                  onChange={(e) => handleFieldChange("autoCalculated", e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="new-autoCalculated" className="ml-2 block text-sm text-gray-700">
                  Cálculo automático
                </label>
              </div>

              {newSkill.autoCalculated && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fórmula</label>
                  <input
                    type="text"
                    value={newSkill.autoFormula || ""}
                    onChange={(e) => handleFieldChange("autoFormula", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ej: nivel + modificador"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorías*</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`new-category-${category}`}
                      checked={newSkill.categories?.includes(category) || false}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...(newSkill.categories || []), category]
                          : (newSkill.categories || []).filter(c => c !== category);
                        handleFieldChange("categories", newCategories);
                      }}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`new-category-${category}`} className="ml-1 text-sm text-gray-700">
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
                  value={newSkill.iconUrl || ""}
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
              {newSkill.iconUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                  <ImageThumbnail
                    file={{
                      isDirectory: false,
                      path: newSkill.iconUrl,
                      name: newSkill.iconUrl.split('/').pop() || 'icon',
                      extension: newSkill.iconUrl.split('.').pop() || ''
                    }}
                    imageCache={imageCache}
                    loadingImages={loadingImages}
                    size="md"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción completa*</label>
              <textarea
                value={newSkill.descriptionTemplate || ""}
                onChange={(e) => handleFieldChange("descriptionTemplate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
              <textarea
                value={newSkill.summaryTemplate || ""}
                onChange={(e) => handleFieldChange("summaryTemplate", e.target.value)}
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
              onClick={handleCreateSkill}
              disabled={
                !newSkill.name || 
                !newSkill.descriptionTemplate || 
                !newSkill.categories?.length || 
                newSkill.maxUses === undefined || 
                newSkill.maxUses < 0
              }
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              Crear habilidad
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