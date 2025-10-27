import React, { useState } from 'react';
import Grid from './components/Grid';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Admin from "./components/Admin";

const initialData = [
  { id: 1, name: 'Mikko', email: 'mikko@tai.fi', role: 'admin' },
  { id: 2, name: 'Ville', email: 'ville@tai.fi', role: 'student' },
  { id: 3, name: 'Sanna', email: 'sanna@tai.fi', role: 'teacher' },
  { id: 4, name: 'Aino', email: 'aino@tai.fi', role: 'viewer' },
];

export default function App() {
  const [data, setData] = useState(initialData);
  const { isAuthenticated } = useAuth();

  const handleDataChange = (updatedData) => {
    console.log('Data updated:', updatedData);
    setData(updatedData);
  };

  const handleEditRow = (row) => {
    console.log('Edited row:', row);
  };

  const handleDeleteRow = (row) => {
    if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
      const updated = data.filter((r) => r.id !== row.id);
      setData(updated);
    }
  };

  return (
    <>
    <div style={{ padding: 24 }}>
      <Grid
        columns={['name', 'email', 'role']}
        data={data}
        allowEditing={true}
        pageSize={10}
        height="450px"
        onDataChange={handleDataChange}
        onEditRow={handleEditRow}
        onDeleteRow={handleDeleteRow}
        
      />
    </div>
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

// import NavBar from "./components/NavBar"; // optional
  ); };