import LoadingSpinner from "@/components/others/LoadingSpinner";
import { useAuth } from "@/store/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ 
  children,
  adminOnly = false 
}: { 
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/home" />;
  }

  return children;
}