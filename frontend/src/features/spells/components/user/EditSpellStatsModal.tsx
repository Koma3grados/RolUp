import { useEffect, useState } from "react";
import { spellStatTranslations } from "@/types/translations";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface EditSpellStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: any) => void;
  title: string;
  type: "text" | "number" | "skill" | "spellStat";
  initialValue: any;
}

export default function EditSpellStatsModal({
  isOpen,
  onClose,
  onSave,
  title,
  type,
  initialValue,
}: EditSpellStatsModalProps) {
  const [value, setValue] = useState(initialValue);

  useDisableScroll(isOpen);
  
  // Sincroniza el estado interno cuando cambian las props
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md max-h-[80vh] overflow-y-auto sm:max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">{title}</h3>
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
          {type === "spellStat" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atributo
              </label>
              <select
                value={value.stat}
                onChange={(e) =>
                  setValue({
                    ...value,
                    stat: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Seleccionar</option>
                {Object.entries(spellStatTranslations).map(([key, translation]) => (
                  <option key={key} value={key}>{translation}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setValue({
                        ...value,
                        value: value.value - 1,
                      })
                    }
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    aria-label="Disminuir valor"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    value={value.value}
                    onChange={(e) =>
                      setValue({
                        ...value,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="border p-1 w-24 text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button
                    onClick={() =>
                      setValue({
                        ...value,
                        value: value.value + 1,
                      })
                    }
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    aria-label="Aumentar valor"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isManual"
                  checked={value.isManual}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      isManual: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="isManual" className="ml-2 block text-sm text-gray-700">
                  Usar valor manual
                </label>
              </div>
            </>
          )}
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
            onClick={() => onSave(value)}
            className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}