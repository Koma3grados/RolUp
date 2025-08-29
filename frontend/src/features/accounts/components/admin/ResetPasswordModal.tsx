import { useState } from "react";
import { accountsAPI } from "@/features/accounts/services/accounts";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { AccountResponseDTO } from "@/types/accounts";
import { useDisableScroll } from "@/components/hooks/useDisableScroll";

interface ResetPasswordModalProps {
  isOpen: boolean;
  account: AccountResponseDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ isOpen, account, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useDisableScroll(isOpen);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    setLoading(true);
    try {
      await accountsAPI.resetPassword(account.username, newPassword);
      onSuccess();
      setNewPassword("");
    } catch (error) {
      toast.error("Error actualizando la contraseña", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-semibold text-amber-900 mb-6">
          Resetear Contraseña de {account.username}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}