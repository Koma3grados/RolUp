import type { SkillDTO } from "@/types/skills";
import { ResetOn, Source } from "@/types/enums";
import { translateCategory, translateSource, translateResetOn } from "@/types/translations";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface SkillDetailModal {
  selectedSkill: SkillDTO;
  isOpen: boolean;
  onClose: () => void;
  updateSkillUses: (skillId: number, newUses: number) => Promise<void>;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
}

export default function SkillDetailModal({
  selectedSkill,
  isOpen,
  onClose,
  updateSkillUses,
  showSummary,
  setShowSummary,
}: SkillDetailModal) {
  if (!isOpen) return null;

  useDisableScroll(isOpen);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            {selectedSkill.iconUrl ? (
              <img 
                src={selectedSkill.iconUrl} 
                alt={selectedSkill.name} 
                className="w-10 h-10 rounded-full bg-amber-100 p-1"
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
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Contador de usos */}
          {selectedSkill.maxUses > 0 && (
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Usos disponibles</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newUses = Math.max(0, selectedSkill.currentUses - 1);
                    updateSkillUses(selectedSkill.id, newUses);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  -
                </button>
                <span className="font-medium">
                  {selectedSkill.currentUses}/{selectedSkill.maxUses}
                </span>
                <button
                  onClick={() => {
                    const newUses = selectedSkill.currentUses + 1;
                    updateSkillUses(selectedSkill.id, newUses);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {selectedSkill.maxUses === 0 ? (
            <div className="text-sm text-gray-500 italic">Pasiva</div>
          ) : selectedSkill.resetOn && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Se reinicia:</span> {translateResetOn(selectedSkill.resetOn as ResetOn)}
            </div>
          )}

          {/* Selector Descripción/Resumen */}
          {selectedSkill.summaryTemplate && (
            <div className="flex justify-center mt-4">
              <div className="relative flex items-center bg-gray-100 rounded-full p-1">
                <button
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    !showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => setShowSummary(false)}
                >
                  Descripción
                </button>
                <button
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => setShowSummary(true)}
                >
                  Resumen
                </button>
              </div>
            </div>
          )}

          {/* Contenido dinámico */}
          <div className="mt-4">
            {!showSummary ? (
              <>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Descripción</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {selectedSkill.descriptionTemplate || "No hay descripción disponible."}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Resumen</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {selectedSkill.summaryTemplate}
                </div>
              </>
            )}
          </div>

          {selectedSkill.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedSkill.categories.map(category => (
                <span
                  key={category}
                  className="text-[0.7rem] bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200"
                >
                  {translateCategory(category)}
                </span>
              ))}
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              <span className="font-medium">Fuente:</span> {translateSource(selectedSkill.source as Source) || "Desconocida"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}