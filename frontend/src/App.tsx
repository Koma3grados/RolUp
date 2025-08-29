import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/all/LandingPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import UserHomePage from "@/pages/user/UserHomePage";
import CharacterDetailPage from "@/pages/user/CharacterDetailPage";
import CharacterSpellPage from "@/pages/user/CharacterSpellPage";
import CharacterSkillPage from "@/pages/user/CharacterSkillPage";
import CharacterItemPage from "@/pages/user/CharacterItemPage";
import AdminHomePage from "@/pages/admin/AdminHomePage";
import AdminSpellPage from "./pages/admin/AdminSpellPage";
import AdminCharacterPage from "@/pages/admin/AdminCharacterPage";
import Notification from "@/components/others/Notification";
import NotFound from '@/pages/all/NotFound';
import AdminSkillPage from "@/pages/admin/AdminSkillPage";
import AdminItemPropertyPage from "@/pages/admin/AdminItemPropertyPage";
import AdminItemPage from "@/pages/admin/AdminItemPage";
import AdminAccountPage from "./pages/admin/AdminAccountPage";
import AdminFileStoragePage from "./pages/admin/AdminFileStoragePage";

function App() {
  return (
    <BrowserRouter>
    <Notification />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Rutas protegidas para usuarios */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <UserHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character/:id"
          element={
            <ProtectedRoute>
              <CharacterDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character/:id/spells"
          element={
            <ProtectedRoute>
              <CharacterSpellPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character/:id/skills"
          element={
            <ProtectedRoute>
              <CharacterSkillPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/character/:id/items"
          element={
            <ProtectedRoute>
              <CharacterItemPage />
            </ProtectedRoute>
          }
        />
        
        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/characters"
          element={
            <ProtectedRoute adminOnly>
              <AdminCharacterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/spells"
          element={
            <ProtectedRoute adminOnly>
              <AdminSpellPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/skills"
          element={
            <ProtectedRoute adminOnly>
              <AdminSkillPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/itemProperties"
          element={
            <ProtectedRoute adminOnly>
              <AdminItemPropertyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/items"
          element={
            <ProtectedRoute adminOnly>
              <AdminItemPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute adminOnly>
              <AdminAccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/file-manager"
          element={
            <ProtectedRoute adminOnly>
              <AdminFileStoragePage />
            </ProtectedRoute>
          }
        />

        {/* Ruta de fallback (404) */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;