import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import BorrowPage from "./components/BorrowPage";
import LocationsTest from "./components/LocationsTest";


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
      <Route path="/login" element={<Login />} />
      <Route path="/locations-test" element={<LocationsTest />} />

      
      {/* Redirect to admin if already authenticated */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} 
      />


      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<HomePage />} />
        <Route path="/borrow" element={<BorrowPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
