import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { useState, useEffect } from "react";

interface ValueOrManualModalProps {
  isOpen: boolean;
  title: string;
  initialValue: number;
  initialIsManual: boolean;
  autoValue: number;
  valueLabel?: string;
  autoValueLabel?: string;
  onSave: (value: { value: number; isManual: boolean }) => void;
  onClose: () => void;
}

export default function ValueOrManualModal({
  isOpen,
  title,
  initialValue,
  initialIsManual,
  autoValue,
  valueLabel = "Valor",
  autoValueLabel = "Valor automático",
  onSave,
  onClose,
}: ValueOrManualModalProps) {
  const [value, setValue] = useState(initialValue);
  const [isManual, setIsManual] = useState(initialIsManual);

  useEffect(() => {
    setValue(initialValue);
    setIsManual(initialIsManual);
  }, [initialValue, initialIsManual]);

  const handleSave = () => {
    onSave({ value, isManual });
    onClose();
  };

  useDisableScroll(isOpen);

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-black rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {valueLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setValue(v => Math.max(0, v - 1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                −
              </button>

              <input
                type="number"
                value={value}
                onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                className="border p-1 w-24 text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              <button
                onClick={() => setValue(v => v + 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isManual}
              onChange={(e) => setIsManual(e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Usar valor manual
            </label>
          </div>

          {!isManual && (
            <p className="text-sm text-gray-500">
              {autoValueLabel}: {autoValue >= 0 ? '+' : ''}{autoValue}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}