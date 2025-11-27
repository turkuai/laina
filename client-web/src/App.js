import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Admin from "./components/Admin";
import BorrowPage from "./components/BorrowPage";
import LocationsTest from "./components/LocationsTest";


export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/locations-test" element={<LocationsTest />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/borrow" element={<BorrowPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
      

    </Routes>
  );
}
