import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserCreation, setShowUserCreation] = useState(false);

  if (!user?.isAdmin) {
    return <div className="p-6 text-red-500">Acceso no autorizado</div>;
  }

  const adminButtons = [
    {
      title: "Administrar Cuentas",
      description: "Gestiona todas las cuentas de usuario",
      icon: "👥",
      action: () => navigate("/admin/accounts"),
    },
    {
      title: "Personajes",
      description: "Gestiona todos los personajes",
      icon: "👤",
      action: () => navigate("/admin/characters"),
    },
    {
      title: "Conjuros",
      description: "Administra los conjuros",
      icon: "✨",
      action: () => navigate("/admin/spells"),
    },
    {
      title: "Habilidades",
      description: "Gestiona habilidades",
      icon: "⚔️",
      action: () => navigate("/admin/skills"),
    },
    {
      title: "Objetos",
      description: "Administra objetos del juego",
      icon: "🎒",
      action: () => navigate("/admin/items"),
    },
    {
      title: "Propiedades de Objetos",
      description: "Administra propiedades de objetos del juego",
      icon: "📜",
      action: () => navigate("/admin/itemProperties"),
    },
    {
      title: "Gestión de Archivos",
      description: "Administra imágenes y recursos",
      icon: "🖼️",
      action: () => navigate("/admin/file-manager"),
    }
  ];

  const handleCancelCreation = () => {
    setShowUserCreation(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 relative"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
      }}
    >

      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900">
              Panel del Dungeon Master
            </h1>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Cerrar sesión
          </button>
        </div>

        {/* Modal para creación de usuarios (refactorizar en el futuro) */}
        {showUserCreation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-xl p-8 w-full max-w-md relative">
              <button
                onClick={handleCancelCreation}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-amber-900">Crear Usuario</h2>
              </div>


            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {adminButtons.map((button, index) => {
            const delay = index * 0.5;
            const duration = 5 + index * 0.3;

            return (
              <motion.button
                key={index}
                onClick={button.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border flex flex-col items-center text-center"
              >
                <motion.span
                  className="text-4xl mb-3"
                  animate={{
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: delay,
                  }}
                >
                  {button.icon}
                </motion.span>
                <h2 className="text-xl font-semibold mb-1 text-amber-900">{button.title}</h2>
                <p className="text-gray-600 text-sm">{button.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}