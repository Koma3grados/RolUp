import { XMarkIcon, TrashIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/store/AuthContext";
import { accountsAPI, type AccountRequestDTO } from "@/features/accounts/services/accounts";
import { showConfirmDialog } from "@/components/others/Notification";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
}

export default function EditAccountModal({ isOpen, onClose, currentUsername }: EditAccountModalProps) {
  const { logout, user, login } = useAuth();
  const [editUsername, setEditUsername] = useState(currentUsername);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditUsername(currentUsername);
      setCurrentPassword("");
      setNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen, currentUsername]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!currentPassword) {
        toast.error("Debes ingresar tu contraseña actual");
        return;
      }

      const updateData: AccountRequestDTO = {
        currentPassword: currentPassword
      };
      
      // Solo enviar username si es diferente al actual y no está vacío
      if (editUsername.trim() && editUsername !== user?.username) {
        updateData.username = editUsername;
      }
      
      // Solo enviar nueva contraseña si no está vacía
      if (newPassword.trim()) {
        updateData.newPassword = newPassword;
      }
      
      // El backend devuelve un nuevo token en la respuesta
      const updatedAccount = await accountsAPI.updateMyAccount(updateData);
      
      // Actualizar el token con el nuevo que devuelve el backend
      if (updatedAccount.token) {
        await login(updatedAccount.token);
        toast.success("Cuenta actualizada correctamente");
      }
      
      // Resetear formulario
      setCurrentPassword("");
      setNewPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      onClose();
      
    } catch (err: any) {
      console.error("Error actualizando la cuenta:", err);
      if (err.response?.status === 401) {
        toast.error("Contraseña actual incorrecta");
      } else if (err.response?.status === 400) {
        toast.error(err.response.data?.message || "Error en la solicitud");
      } else {
        toast.error("Error actualizando la cuenta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirmDialog("¿Estás seguro de que quieres desaparecer de nuestros grimorios? ¡No existe conjuro que revierta tal osadía!");
    
    if (confirmed) {
      try {
        setLoading(true);
        await accountsAPI.deleteMyAccount();
        toast.success("Cuenta eliminada correctamente");
        logout();
      } catch (err) {
        toast.error("Error eliminando la cuenta");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">Mi Cuenta</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
              title="Eliminar cuenta"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose} 
              className="p-1 text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdateAccount} className="p-6 space-y-6">
          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              disabled={loading}
              placeholder="Nuevo nombre de usuario"
            />
          </div>
          
          {/* Contraseña actual (requerida) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña actual *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Ingresa tu contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva contraseña (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
              <span className="text-xs text-gray-500 ml-1">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Dejar vacío para no cambiar"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
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
              disabled={loading || !currentPassword}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}