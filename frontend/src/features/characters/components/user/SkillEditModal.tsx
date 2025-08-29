import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import type { CharacterAbilityStatsValue } from "@/types/characters";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  skill: CharacterAbilityStatsValue;
  onSave: (newSkill: CharacterAbilityStatsValue) => void;
  onClose: () => void;
};

export default function SkillEditModal({ isOpen, title, skill, onSave, onClose }: Props) {
  const [localSkill, setLocalSkill] = useState<CharacterAbilityStatsValue>(skill);

  useDisableScroll(isOpen);
  
  const handleValueChange = (delta: number) => {
    setLocalSkill({
      ...localSkill,
      value: (localSkill.value || 0) + delta
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || val === "-") {
      setLocalSkill({ ...localSkill, value: val as any }); // temporal
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num)) {
        setLocalSkill({ ...localSkill, value: num });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-black rounded-xl p-6 w-[90%] max-w-sm space-y-4 shadow-xl">
        <h2 className="text-lg font-bold">{title}</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Valor manual</label>
            <div className="flex items-center gap-2 mt-1">
              <button 
                onClick={() => handleValueChange(-1)} 
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={localSkill.value ?? ""}
                onChange={handleInputChange}
                className="border p-1 w-24 text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button 
                onClick={() => handleValueChange(1)} 
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localSkill.manual}
              onChange={(e) => setLocalSkill({
                ...localSkill,
                manual: e.target.checked
              })}
            />
            <label>Usar valor manual</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localSkill.proficient}
              onChange={(e) => setLocalSkill({
                ...localSkill,
                proficient: e.target.checked
              })}
            />
            <label>Competente</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
            Cancelar
          </button>
          <button
            onClick={() => onSave({ ...localSkill, value: Number(localSkill.value) })}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
