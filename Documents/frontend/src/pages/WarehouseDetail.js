import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- TON LOGIQUE (GARDÉE À 100%) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const warRes = await api.get(`/api/warehouses/${id}/`);
      setWarehouse(warRes.data);
      const invRes = await api.get(`/api/warehouses/${id}/inventory/`);
      setInventory(invRes.data.results || invRes.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <div className="p-10 text-center fw-bold">Loading system data...</div>;

  return (
    <div style={{ backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      
      {/* 1. NAVBAR (Style Harry : Slate 900) */}
      <nav className="navbar navbar-dark bg-slate-900 shadow-lg px-4 py-3" style={{ backgroundColor: "#0f172a" }}>
        <div className="container d-flex justify-content-between">
          <h1 className="navbar-brand fw-bold mb-0 fs-4">
            <span className="text-purple-400" style={{ color: "#a78bfa" }}>Inventory</span> Manager
          </h1>
          <button onClick={() => navigate("/warehouses")} className="btn btn-outline-light btn-sm rounded-1">
            Back to Warehouses
          </button>
        </div>
      </nav>

      <div className="container mt-5">
        
        {/* 2. TITRE DE LA PAGE */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: "#1e293b" }}>{warehouse?.name}</h2>
          <p className="text-muted small">Location: {warehouse?.location}</p>
        </div>

        {/* 3. TABLEAU (Style Minimaliste CodeWithHarry) */}
        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "8px" }}>
          <div className="card-header bg-white py-3 border-bottom">
            <h5 className="mb-0 fw-bold">Current Stock Inventory</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-slate-50" style={{ backgroundColor: "#f8fafc" }}>
                <tr>
                  <th className="px-4 py-3 text-uppercase small text-muted">Product Name</th>
                  <th className="text-center text-uppercase small text-muted">SKU Code</th>
                  <th className="text-end px-4 text-uppercase small text-muted">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="px-4 py-3 fw-semibold text-slate-700">{item.name}</td>
                    <td className="text-center text-muted small">{item.sku}</td>
                    <td className="text-end px-4">
                      <span className={`fw-bold ${item.quantity > 5 ? 'text-dark' : 'text-danger'}`}>
                        {item.quantity} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. ACTION (Bouton Violet Signature) */}
        <div className="mt-4 text-end">
          <button 
            className="btn btn-primary px-5 py-2 fw-bold shadow-sm border-0" 
            style={{ backgroundColor: "#7c3aed", borderRadius: "6px" }}
            onClick={() => alert("Synchronizing with Database...")}
          >
            Update Inventory
          </button>
        </div>

      </div>
    </div>
  );
}

export default WarehouseDetail;