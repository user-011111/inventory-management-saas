import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, warehouses: 0 });
  const [loading, setLoading] = useState(true);
  
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole")?.toLowerCase();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (userRole === "employee") {
          const userRes = await api.get("/api/user/");
          const warehouseId = userRes.data.assigned_warehouse;
          const inventoryRes = await api.get(`/api/warehouses/${warehouseId}/inventory/`);
          
          setStats({
            products: inventoryRes.data.filter(item => item.quantity > 0).length,
            warehouses: 1 
          });
        } else {
          const [prodRes, warRes] = await Promise.all([
            api.get("/api/products/"),
            api.get("/api/warehouses/")
          ]);
          setStats({
            products: (prodRes.data.results || prodRes.data).length,
            warehouses: (warRes.data.results || warRes.data).length
          });
        }
      } catch (err) {
        console.error("Erreur Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userRole]);

  if (loading) return <div className="text-center mt-5">Chargement...</div>;

  return (
    <div className="container mt-4">
      <h1 className="fw-bold mb-5 text-uppercase border-bottom pb-3">TABLEAU DE BORD - {username}</h1>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-5 text-center" style={{ borderRadius: "20px" }}>
            <h2 className="display-1 fw-bold text-primary">{stats.products}</h2>
            <p className="text-muted fw-bold text-uppercase">Produits en Stock</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-5 text-center" style={{ borderRadius: "20px" }}>
            <h2 className="display-1 fw-bold text-success">{stats.warehouses}</h2>
            <p className="text-muted fw-bold text-uppercase">{userRole === "employee" ? "Entrepôt Assigné" : "Entrepôts Actifs"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;