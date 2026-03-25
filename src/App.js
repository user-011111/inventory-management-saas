import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import WarehouseDetail from "./pages/WarehouseDetail";
import Notifications from "./pages/Notifications";
import AddUser from "./pages/AddUser"; // 1. AJOUTER CET IMPORT

// COMPOSANTS
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/warehouses/:id" element={<WarehouseDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* 2. AJOUTER LA ROUTE ICI */}
          <Route path="/add-user" element={<AddUser />} /> 
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;