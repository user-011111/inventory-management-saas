import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import WarehouseDetail from "./pages/WarehouseDetail"; // La nouvelle page de stock
import Notifications from "./pages/Notifications";
// COMPOSANTS
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection automatique vers le login au démarrage */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées (Nécessitent un Token) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/warehouses" element={<Warehouses />} />
          {/* Route dynamique pour voir les produits d'un entrepôt spécifique */}
          <Route path="/warehouses/:id" element={<WarehouseDetail />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* Gestion du 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;