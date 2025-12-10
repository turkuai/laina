// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import BorrowPage from './components/BorrowPage';

import Home, {
  UsersTab,
  ProductsTab,
  HistoryTab,
  MyHistoryTab,
} from './components/Admin';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public login route */}
      <Route path="/login" element={<Login />} />

      {/* Everything else is protected */}
      <Route element={<ProtectedRoute />}>
        {/* Root layout with header, tabs, and <Outlet /> */}
        <Route path="/" element={<Home />}>
          {/* Default tab when visiting "/" */}
          <Route index element={<HistoryTab />} />

          {/* Nested routes (relative to "/") */}
          <Route path="lend" element={<BorrowPage />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="products" element={<ProductsTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="my-history" element={<MyHistoryTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Route>

        {/* Keep old /admin URL working (optional) */}
        <Route path="/admin" element={<Navigate to="/" replace />} />
      </Route>

      {/* Fallback: if URL is unknown, go either to / or /login */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/' : '/login'} replace />
        }
      />
    </Routes>
  );
}
