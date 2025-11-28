// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import BorrowPage from './components/BorrowPage';

import Admin, {
  UsersTab,
  ProductsTab,
  HistoryTab,
  MyHistoryTab,
  SettingsTab,
} from './components/Admin';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* public login */}
      <Route path="/login" element={<Login />} />

      {/* everything else is protected */}
      <Route element={<ProtectedRoute />}>
        {/* root layout with tabs + Outlet */}
        <Route path="/" element={<Admin />}>
          {/* default: / → /history */}
          <Route index element={<Navigate to="history" replace />} />

          {/* nested sub-routes */}
          <Route path="lend" element={<BorrowPage />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="products" element={<ProductsTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="my-history" element={<MyHistoryTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/history' : '/login'} replace />
        }
      />
    </Routes>
  );
}
