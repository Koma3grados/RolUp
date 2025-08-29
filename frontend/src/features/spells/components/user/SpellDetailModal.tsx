import { useState, useEffect } from "react";
import { schoolStyles } from "@/types/spells";
import { translateCategory, translateSource, schoolTranslations } from "@/types/translations";
import type { SpellDTO } from "@/types/spells";
import TextFormat from "@/components/others/TextFormat";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface SpellDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  spell: SpellDTO;
  onTogglePrepared: (spellId: number, newPreparedState: boolean) => void; // El padre maneja la lógica
}

export default function SpellDetailModal({
  isOpen,
  onClose,
  spell,
  onTogglePrepared,
}: SpellDetailModalProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [currentSpell, setCurrentSpell] = useState(spell);

  useDisableScroll(isOpen);
  
  useEffect(() => {
    setCurrentSpell(spell);
    setShowSummary(false);
  }, [spell]);

  if (!isOpen) return null;

  const handleTogglePrepared = () => {
    const newPreparedState = !currentSpell.prepared;
    setCurrentSpell({
      ...currentSpell,
      prepared: newPreparedState
    });
    onTogglePrepared(currentSpell.id, newPreparedState); // Notificar al padre
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[95vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 z-30">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-3">
              <span className="font-medium">Preparado</span>
              <button
                onClick={handleTogglePrepared}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  currentSpell.prepared ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    currentSpell.prepared ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <h2 className="text-3xl font-bold text-amber-900 absolute left-1/2 transform -translate-x-1/2">
              {currentSpell.name}
            </h2>

            <div className="w-[150px]"></div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${
              schoolStyles[currentSpell.school?.toLowerCase() as keyof typeof schoolStyles]?.bgColor || 'bg-gray-100'
            } ${
              schoolStyles[currentSpell.school?.toLowerCase() as keyof typeof schoolStyles]?.textColor || 'text-gray-800'
            }`}>
              {schoolStyles[currentSpell.school?.toLowerCase() as keyof typeof schoolStyles]?.icon || "✨"}
              {schoolTranslations[currentSpell.school?.toLowerCase() as keyof typeof schoolTranslations] || currentSpell.school}
            </span>
            
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-800">
              Nivel {currentSpell.level}
            </span>
            
            {currentSpell.concentration && (
              <span className="text-sm flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <span>⏳</span>
                <span>Concentración</span>
              </span>
            )}
            
            {currentSpell.categories?.map(category => (
              <span
                key={category}
                className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200"
              >
                {translateCategory(category)}
              </span>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {currentSpell.summaryTemplate && (
            <div className="flex justify-center mt-6">
              <div className="relative flex items-center bg-gray-100 rounded-full p-1">
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    !showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => setShowSummary(false)}
                >
                  Descripción
                </button>
                <button
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    showSummary ? 'bg-amber-600 text-white' : 'text-gray-600'
                  }`}
                  onClick={() => setShowSummary(true)}
                >
                  Resumen
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            {!showSummary ? (
              <>
                <h3 className="text-xl font-semibold text-amber-800 mb-4">Descripción</h3>
                <div className="prose prose-base max-w-none text-gray-700 whitespace-pre-line">
                  <TextFormat text={currentSpell.descriptionTemplate || "No hay descripción disponible."} />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-amber-800 mb-4">Resumen</h3>
                <div className="prose prose-base max-w-none text-gray-700 whitespace-pre-line">
                  {currentSpell.summaryTemplate}
                </div>
              </>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200 text-base text-gray-500">
            <p>
              <span className="font-medium">Fuente:</span> {translateSource(currentSpell.source) || "Desconocida"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}