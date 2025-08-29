import { useState } from "react";
import { loginRequest } from "@/features/auth/services/auth";
import { useAuth } from "@/store/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [galiano, setUsername] = useState(""); // Galiano es username
  const [password, setPassword] = useState("");
  const [, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { token, isAdmin } = await loginRequest(galiano, password);
      
      await login(token);
      toast.success(`¡Bienvenido, ${galiano}!`);
      navigate(isAdmin ? "/admin" : "/home");
    } catch (err: any) {
      const errorMessage = err.message;
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        duration: 4000
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          className="w-full p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white placeholder-gray-800/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Usuario"
          value={galiano}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
        />
      </div>
      
      <div>
        <input
          className="w-full p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white placeholder-gray-800/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
      </div>

      <button
        className="w-full bg-amber-600 px-4 py-2 rounded hover:bg-amber-700 text-white font-medium transition-colors"
        type="submit"
      >
        Iniciar sesión
      </button>
    </form>
  );
}