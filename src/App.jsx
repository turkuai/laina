import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Default route: send user to admin if logged in, otherwise to login */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route path="/login" element={<Login />} />

      {/* Protected admin section */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
