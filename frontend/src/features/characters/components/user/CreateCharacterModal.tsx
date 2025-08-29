import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import toast from "react-hot-toast";
import { charactersAPI } from "@/features/characters/services/characters";

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: () => void;
}

export default function CreateCharacterModal({ isOpen, onClose, onCharacterCreated }: CreateCharacterModalProps) {
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
        setLoading(true);
        await charactersAPI.createCharacter({ name: newName }); // Cambiado aquí
        setNewName("");
        onClose();
        toast.success("Personaje creado correctamente");
        onCharacterCreated();
      } catch (err) {
        toast.error("Error creando personaje");
      } finally {
        setLoading(false);
      }
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">Nuevo Personaje</h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleCreateCharacter} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del personaje
            </label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-amber-900"
              placeholder="Ingresa el nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? "Creando..." : "Crear Personaje"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}