import { useEffect, useState } from "react";
import { School, Category } from "@/types/enums";
import { schoolTranslations, translateCategory, translateSchool } from "@/types/translations";
import type { SpellDTO } from "@/types/spells";
import toast from "react-hot-toast";
import { spellsAPI } from "@/features/spells/services/spells";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import ImageSelectorModal from "@/features/fileStorage/components/ImageSelectorModal";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";

interface CreateSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newSpell: SpellDTO) => void;
}

export default function CreateSpellModal({
  isOpen,
  onClose,
  onCreateSuccess
}: CreateSpellModalProps) {
  const [newSpell, setNewSpell] = useState<Partial<SpellDTO>>({
    name: "",
    level: 0,
    school: School.ABJURATION,
    descriptionTemplate: "",
    summaryTemplate: "",
    concentration: false,
    categories: []
  });
  const [showImageSelector, setShowImageSelector] = useState(false);

  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();
  useEffect(() => {
    if (newSpell.iconUrl && !imageCache[newSpell.iconUrl]) {
      loadImageAsBase64(newSpell.iconUrl);
    }
  }, [newSpell.iconUrl, imageCache, loadImageAsBase64]);

  useDisableScroll(isOpen);

  // Función para manejar cambios en los campos del formulario
  const handleFieldChange = <K extends keyof SpellDTO>(field: K, value: SpellDTO[K]) => {
    setNewSpell(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreate = async () => {
    try {
      const spellToCreate = {
        ...newSpell,
        school: newSpell.school?.toUpperCase(),
        categories: newSpell.categories?.map(c => c.toUpperCase())
      } as SpellDTO;

      const newSpellData = await spellsAPI.createSpell(spellToCreate);
      onCreateSuccess(newSpellData);
      onClose();

      setNewSpell({
        name: "",
        level: 0,
        school: School.ABJURATION,
        descriptionTemplate: "",
        summaryTemplate: "",
        concentration: false,
        categories: []
      });

      toast.success("Conjuro creado correctamente");
    } catch (error) {
      toast.error("Error al crear el conjuro");
    }
  };

  const handleSelectImage = (imagePath: string) => {
    handleFieldChange("iconUrl", imagePath);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] min-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-amber-900">
              Crear nuevo conjuro
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
                  value={newSpell.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel*</label>
                <select
                  value={newSpell.level}
                  onChange={(e) => handleFieldChange("level", parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl === 0 ? "Truco" : `Nivel ${lvl}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Escuela*</label>
                <select
                  value={newSpell.school}
                  onChange={(e) => handleFieldChange("school", e.target.value as School)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {Object.entries(schoolTranslations).map(([key]) => (
                    <option key={key} value={key.toUpperCase()}>
                      {translateSchool(key)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="new-concentration"
                  checked={newSpell.concentration || false}
                  onChange={(e) => handleFieldChange("concentration", e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="new-concentration" className="ml-2 block text-sm text-gray-700">
                  Concentración
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorías*</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`new-category-${category}`}
                      checked={newSpell.categories?.includes(category) || false}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...(newSpell.categories || []), category]
                          : (newSpell.categories || []).filter(c => c !== category);
                        handleFieldChange("categories", newCategories);
                      }}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`category-${category}`} className="ml-1 text-sm text-gray-700">
                      {translateCategory(category)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono (opcional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpell.iconUrl || ""}
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
              {newSpell.iconUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                  <ImageThumbnail
                    file={{
                      isDirectory: false,
                      path: newSpell.iconUrl,
                      name: newSpell.iconUrl.split('/').pop() || 'icon',
                      extension: newSpell.iconUrl.split('.').pop() || ''
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
                value={newSpell.descriptionTemplate || ""}
                onChange={(e) => handleFieldChange("descriptionTemplate", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (opcional)</label>
              <textarea
                value={newSpell.summaryTemplate || ""}
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
              onClick={handleCreate}
              disabled={!newSpell.name || !newSpell.school || !newSpell.descriptionTemplate || !newSpell.categories?.length}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              Crear conjuro
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