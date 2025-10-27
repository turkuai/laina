import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // not logged in → send to login
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
