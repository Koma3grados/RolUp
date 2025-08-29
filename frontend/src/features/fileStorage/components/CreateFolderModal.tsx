import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import { useState } from "react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

export default function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");

  useDisableScroll(isOpen);

  if (!isOpen) return null;

  const handleCreate = () => {
    onCreate(folderName);
    setFolderName("");
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Crear nueva carpeta</h3>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Nombre de la carpeta"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreate();
            }
          }}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={!folderName.trim()}
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}