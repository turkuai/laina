import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Admin from "./components/Admin";
import BorrowPage from "./components/BorrowPage";

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Navigate to="/login" replace />}
      />
      
      {/* Redirect to admin if already authenticated */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} 
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/borrow" element={<BorrowPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}