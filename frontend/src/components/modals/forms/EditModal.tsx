import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { useState } from "react";

type Props<T> = {
  isOpen: boolean;
  title: string;
  initialValue: T;
  type: "text" | "number";
  onSave: (value: T) => void;
  onClose: () => void;
};

export default function EditModal<T>({ isOpen, title, initialValue, type, onSave, onClose }: Props<T>) {
  const [value, setValue] = useState<T>(initialValue);
  
  useDisableScroll(isOpen);

  const handleNumberChange = (delta: number) => {
    if (typeof value === "number") {
      const newValue = value + delta;
      setValue(Math.max(0, newValue) as T); // No permite valores menores a 0
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-black rounded-xl p-6 w-[90%] max-w-md space-y-4 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>
        {type === "number" ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleNumberChange(-1)} 
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={value as number}
              onChange={(e) => {
                const newValue = parseInt(e.target.value) || 0;
                setValue(Math.max(0, newValue) as T);
              }}
              className="border p-1 w-24 text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
            />
            <button 
              onClick={() => handleNumberChange(1)} 
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={value as string}
            onChange={(e) => setValue(e.target.value as T)}
            className="border p-2 w-full"
          />
        )}
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(value)} 
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}