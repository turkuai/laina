import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyPopup from "./components/VerifyPopup";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import BorrowPage from "./pages/BorrowPage";
import VerifyEmail from "./pages/VerifyEmail";
import LocationsTest from "./components/LocationsTest";
import InfiniteTest from './pages/InfiniteTest';

export default function App() {
  const { isAuthenticated, emailVerified, loading } = useAuth();

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
    <>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/infinite-test" element={<InfiniteTest />} />
        <Route path="/infinite-test" element={<InfiniteTest />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/borrow" element={<BorrowPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && !emailVerified && <VerifyPopup />}
    </>
  );
}
