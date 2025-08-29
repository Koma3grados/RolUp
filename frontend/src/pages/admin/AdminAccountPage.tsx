import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { accountsAPI } from "@/features/accounts/services/accounts";
import type { AccountResponseDTO } from "@/types/accounts";
import { PlusIcon, ArrowLeftIcon, TrashIcon, KeyIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ResetPasswordModal from "@/features/accounts/components/admin/ResetPasswordModal";
import CreateAccountModal from "@/features/accounts/components/admin/CreateAccountModal";
import { showConfirmDialog } from "@/components/others/Notification";
import LoadingSpinner from "@/components/others/LoadingSpinner";

export default function AdminAccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponseDTO | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/admin");
      return;
    }

    fetchAccounts();
  }, [user, navigate]);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAllAccounts();
      setAccounts(response);
    } catch (error) {
      toast.error("Error cargando las cuentas", {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (username: string) => {
    const isConfirmed = await showConfirmDialog(
      `¿Estás seguro de que quieres eliminar la cuenta de ${username}?`
    );
    
    if (!isConfirmed) return;

    try {
      await accountsAPI.deleteAccount(username);
      toast.success("Cuenta eliminada correctamente", {
        position: "top-center"
      });
      fetchAccounts(); // Recargar la lista
    } catch (error) {
      toast.error("Error eliminando la cuenta", {
        position: "top-center"
      });
    }
  };

  const handleResetPassword = (account: AccountResponseDTO) => {
    setSelectedAccount(account);
    setIsResetPasswordModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 relative" 
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
      }}
    >
      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">
        {/* Barra de navegación superior */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver al panel
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-2">
            Administrar Cuentas
          </h1>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva cuenta
          </button>
        </div>

        {/* Lista de cuentas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{account.id}</td>
                    <td className="py-3 px-4 font-medium">{account.username}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        account.admin 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {account.admin ? "Administrador" : "Usuario"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetPassword(account)}
                          className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                          title="Resetear contraseña"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                        {account.username !== user?.username && (
                          <button
                            onClick={() => handleDeleteAccount(account.username)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar cuenta"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {accounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay cuentas registradas
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear nueva cuenta */}
        {isCreateModalOpen && (
          <CreateAccountModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateSuccess={() => {
              fetchAccounts();
              setIsCreateModalOpen(false);
            }}
          />
        )}

        {/* Modal para resetear contraseña */}
        {isResetPasswordModalOpen && selectedAccount && (
          <ResetPasswordModal
            isOpen={isResetPasswordModalOpen}
            account={selectedAccount}
            onClose={() => {
              setIsResetPasswordModalOpen(false);
              setSelectedAccount(null);
            }}
            onSuccess={() => {
              setIsResetPasswordModalOpen(false);
              setSelectedAccount(null);
              toast.success("Contraseña actualizada correctamente", {
                position: "top-center"
              });
            }}
          />
        )}
      </div>
    </div>
  );
}