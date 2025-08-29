import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub: string;
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  user: { username: string; isAdmin: boolean } | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setUser({ 
          username: decoded.username || decoded.sub,
          isAdmin: decoded.isAdmin 
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode<JwtPayload>(newToken);
    setToken(newToken);
    setUser({ 
      username: decoded.username || decoded.sub,
      isAdmin: decoded.isAdmin 
    });
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        isAuthenticated: !!token, 
        user, 
        login, 
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};