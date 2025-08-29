import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { charactersAPI } from "@/features/characters/services/characters";
import { accountsAPI } from "@/features/accounts/services/accounts";
import { useAuth } from "@/store/AuthContext";
import type { CharacterSummaryDTO } from "@/types/characters";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { User, Plus, LogOut } from "lucide-react";
import EditAccountModal from "@/features/accounts/components/user/EditAccountModal";
import CreateCharacterModal from "@/features/characters/components/user/CreateCharacterModal";
import { useImageCache } from "@/features/fileStorage/context/ImageCacheContext";
import ImageThumbnail from "@/features/fileStorage/components/ImageThumbnail";

export default function UserHomePage() {
  const { token, logout } = useAuth();
  const [characters, setCharacters] = useState<CharacterSummaryDTO[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [loading] = useState(false);

  // Iconos
  const { imageCache, loadingImages, loadImageAsBase64 } = useImageCache();

  // Cargar imágenes de personajes
  useEffect(() => {
    const loadCharacterImages = async () => {
      const charactersWithImages = characters.filter(character =>
        character.iconUrl &&
        !character.iconUrl.startsWith('http') &&
        !imageCache[character.iconUrl]
      );

      for (const character of charactersWithImages) {
        if (character.iconUrl) {
          await loadImageAsBase64(character.iconUrl);
        }
      }
    };

    if (characters.length > 0) {
      loadCharacterImages();
    }
  }, [characters, imageCache, loadImageAsBase64]);


  const navigate = useNavigate();

  const loadCharacters = async () => {
    if (!token) return;
    try {
      const data = await charactersAPI.fetchCharacters();
      setCharacters(data);
    } catch (err) {
      toast.error("Error cargando personajes", {
        position: "top-center"
      });
    }
  };

  const loadAccountData = async () => {
    if (!token) return;
    try {
      const accountData = await accountsAPI.getMyAccount();
      setCurrentUsername(accountData.username);
    } catch (err) {
      toast.error("Error cargando datos de la cuenta", {
        position: "top-center"
      });
    }
  };

  useEffect(() => {
    loadCharacters();
    loadAccountData();
  }, [token]);

  const handleCardClick = (id: number) => {
    navigate(`/character/${id}`);
  };

  return (
    <div
      className="min-h-screen bg-fixed bg-cover font-serif p-6 relative"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
      }}
    >
      {/* Overlay entre fondo y contenido */}
      <div className="absolute inset-0 bg-parchment/70 z-0"></div>

      {/* Contenedor principal con contenido visible */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900">
            Personajes
          </h1>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors shadow-md hover:shadow-lg"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <User size={18} />
              <span className="hidden sm:inline">Mi Cuenta</span>
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div
          className="
            grid gap-6
            justify-items-center
            xl:justify-items-start
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {characters.map((char) => (
            <motion.div
              key={char.id}
              onClick={() => handleCardClick(char.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition-all
                border-2 border-gray-800 border-opacity-50 group relative overflow-hidden
                flex flex-col items-center justify-start aspect-[2/3]

                w-full
                max-w-[220px]   /* base: móviles (1 col) */
                sm:max-w-[230px] /* 2 col */
                md:max-w-[250px] /* 3 col */
                lg:max-w-[280px] /* 4 col */
                xl:max-w-[320px] /* 5 col */
              "
            >
              {/* Imagen */}
              <div className="relative w-full">
                {char.iconUrl ? (
                  <ImageThumbnail
                    file={{
                      isDirectory: false,
                      path: char.iconUrl,
                      name: char.name || "character",
                      extension: char.iconUrl.split(".").pop() || "",
                    }}
                    imageCache={imageCache}
                    loadingImages={loadingImages}
                    size="lg"
                    className="w-full h-[calc(100%-0px)] aspect-square object-cover rounded-t-xl border-b border-gray-300"

                  />
                ) : (
                  <div className="w-full aspect-square bg-amber-100 flex items-center justify-center text-6xl rounded-t-xl border-b border-gray-300">
                    👤
                  </div>
                )}

                {/* Nivel en esquina superior derecha */}
                <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow-md">
                  Nivel {char.level}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col items-center justify-center p-3 flex-1 w-full text-center bg-gray-100">
                <h2 className="text-[1.25rem] md:text-[1.5rem] font-bold text-gray-800 truncate">{char.name}</h2>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {char.characterClass} · {char.race}
                </p>
              </div>

            </motion.div>
          ))}

          {/* Crear Personaje */}
          <motion.div
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="
              cursor-pointer bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-all
              border-2 border-dashed border-gray-300 group hover:bg-gray-200
              flex flex-col items-center justify-center aspect-[2/3]

              w-full
              max-w-[220px]   /* base: móviles (1 col) */
              sm:max-w-[230px] /* 2 col */
              md:max-w-[250px] /* 3 col */
              lg:max-w-[280px] /* 4 col */
              xl:max-w-[320px] /* 5 col */
            "
          >
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl border-2 border-gray-300 group-hover:border-gray-400 transition-colors mb-3">
                <Plus size={24} className="text-gray-500 group-hover:text-gray-700" />
              </div>
              <h2 className="text-lg font-semibold text-center text-gray-600 group-hover:text-gray-800 transition-colors">
                Crear Personaje
              </h2>
            </div>
          </motion.div>
        </div>


        {/* Mensaje cuando no hay personajes (solo la tarjeta de crear) */}
        {characters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-amber-800 text-lg">No tienes personajes creados</p>
            <p className="text-amber-600">¡Usa la tarjeta de arriba para crear tu primer personaje!</p>
          </div>
        )}
      </div>

      {/* Modales */}
      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUsername={currentUsername}
      />

      <CreateCharacterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCharacterCreated={loadCharacters}
      />
    </div>
  );
}