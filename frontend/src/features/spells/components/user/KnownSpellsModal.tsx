import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { useEffect, useState } from "react";

interface KnownSpellsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (knownSpells: number[]) => void;
  initialKnownSpells: number[];
}

export default function KnownSpellsModal({
  isOpen,
  onClose,
  onSave,
  initialKnownSpells,
}: KnownSpellsModalProps) {
  const [editingKnownSpells, setEditingKnownSpells] = useState(initialKnownSpells);

  useDisableScroll(isOpen);
  
  useEffect(() => {
    setEditingKnownSpells(initialKnownSpells);
  }, [initialKnownSpells]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md max-h-[80vh] overflow-y-auto sm:max-h-[90vh]">
        {/* Cabecera */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Conjuros Conocidos por Nivel</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          {editingKnownSpells.map((count, level) => (
            <div key={level} className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium flex-1">
                {level === 0 ? "Trucos" : `Nivel ${level}`}
              </label>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newValue = Math.max(0, count - 1);
                    const newKnownSpells = [...editingKnownSpells];
                    newKnownSpells[level] = newValue;
                    setEditingKnownSpells(newKnownSpells);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label={`Reducir conjuros de nivel ${level}`}
                >
                  <span className="text-lg">−</span>
                </button>
                
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    const newKnownSpells = [...editingKnownSpells];
                    newKnownSpells[level] = Math.max(0, newValue);
                    setEditingKnownSpells(newKnownSpells);
                  }}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                <button
                  onClick={() => {
                    const newValue = count + 1;
                    const newKnownSpells = [...editingKnownSpells];
                    newKnownSpells[level] = newValue;
                    setEditingKnownSpells(newKnownSpells);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label={`Aumentar conjuros de nivel ${level}`}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(editingKnownSpells)}
            className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}