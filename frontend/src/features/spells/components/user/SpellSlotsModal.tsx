import { useEffect, useState } from "react";
import type { SpellSlot } from "@/types/characters";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface SpellSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slots: SpellSlot[]) => void;
  initialSpellSlots: SpellSlot[];
}

export default function SpellSlotsModal({
  isOpen,
  onClose,
  onSave,
  initialSpellSlots,
}: SpellSlotsModalProps) {
  const [editingSpellSlots, setEditingSpellSlots] = useState(initialSpellSlots);

  useDisableScroll(isOpen);
  
  // Sincroniza el estado interno cuando cambian las props
  useEffect(() => {
    setEditingSpellSlots(initialSpellSlots);
  }, [initialSpellSlots]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md max-h-[80vh] overflow-y-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Huecos de Conjuro por Nivel</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {editingSpellSlots.map((slot, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium flex-1">
                {slot.level === 0 ? "Trucos" : `Nivel ${slot.level}`}
              </label>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const newSlots = [...editingSpellSlots];
                    newSlots[index] = {
                      ...newSlots[index],
                      maxSlots: Math.max(0, slot.maxSlots - 1)
                    };
                    setEditingSpellSlots(newSlots);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label={`Reducir huecos de nivel ${slot.level}`}
                >
                  <span className="text-lg">−</span>
                </button>
                
                <input
                  type="number"
                  min="0"
                  value={slot.maxSlots}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    const newSlots = [...editingSpellSlots];
                    newSlots[index] = {
                      ...newSlots[index],
                      maxSlots: Math.max(0, newValue)
                    };
                    setEditingSpellSlots(newSlots);
                  }}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-center text-sm appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                <button
                  onClick={() => {
                    const newSlots = [...editingSpellSlots];
                    newSlots[index] = {
                      ...newSlots[index],
                      maxSlots: slot.maxSlots + 1
                    };
                    setEditingSpellSlots(newSlots);
                  }}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                  aria-label={`Aumentar huecos de nivel ${slot.level}`}
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
            onClick={() => onSave(editingSpellSlots)}
            className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}