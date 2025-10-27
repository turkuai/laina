import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Admin from "./components/Admin";
// import NavBar from "./components/NavBar"; // optional

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* <NavBar />  // keep if you want a global nav */}
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
