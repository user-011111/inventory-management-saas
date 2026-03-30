import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import api from "../api/axiosConfig";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // États Gestion Entrepôts (Admin uniquement)
  const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", location: "" });

  const userRole = localStorage.getItem("userRole")?.toLowerCase();
  const isAdmin = userRole === "owner" || userRole === "manager";

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer l'ID assigné via le profil utilisateur
      const userRes = await api.get("/api/user/");
      const assignedId = userRes.data.assigned_warehouse;

      const res = await api.get("/api/warehouses/");
      const wData = res.data.results || res.data;

      if (userRole === "employee") {
        // Filtrage strict par ID (en String pour éviter les erreurs de type)
        setWarehouses(wData.filter(w => String(w.id) === String(assignedId)));
      } else {
        setWarehouses(Array.isArray(wData) ? wData : []);
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [userRole]);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/warehouses/", newWarehouse);
      setNewWarehouse({ name: "", location: "" });
      fetchData();
    } catch (err) { alert("Erreur lors de la création."); }
  };

  const handleUpdateWarehouse = async (id) => {
    try {
      await api.patch(`/api/warehouses/${id}/`, editData);
      setEditingId(null);
      fetchData();
    } catch (err) { alert("Erreur de modification."); }
  };

  const handleDeleteWarehouse = async (id) => {
    if (window.confirm("Supprimer cet entrepôt ?")) {
      try {
        await api.delete(`/api/warehouses/${id}/`);
        fetchData();
      } catch (err) { alert("Erreur de suppression."); }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{isAdmin ? "🏢 GESTION DES ENTREPÔTS" : "🏠 MON ENTREPÔT ASSIGNÉ"}</h2>
      </div>

      {isAdmin && (
        <div className="card shadow-sm p-4 mb-4 bg-light border-0">
          <h5 className="fw-bold mb-3 text-primary">➕ Ajouter un entrepôt</h5>
          <form onSubmit={handleCreateWarehouse} className="row g-2">
            <div className="col-md-5"><input type="text" className="form-control" placeholder="Nom" value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} required /></div>
            <div className="col-md-5"><input type="text" className="form-control" placeholder="Localisation" value={newWarehouse.location} onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} required /></div>
            <div className="col-md-2"><button type="submit" className="btn btn-primary w-100 fw-bold">CRÉER</button></div>
          </form>
        </div>
      )}

      <div className="row">
        {warehouses.length > 0 ? warehouses.map((w) => (
          <div key={w.id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0 p-3 text-center" style={{ borderRadius: "20px" }}>
              {editingId === w.id ? (
                <>
                  <input className="form-control mb-2" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  <input className="form-control mb-2" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} />
                  <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdateWarehouse(w.id)}>Sauvegarder</button>
                  <button className="btn btn-light btn-sm" onClick={() => setEditingId(null)}>Annuler</button>
                </>
              ) : (
                <>
                  <div className="display-6 mb-2">📍</div>
                  <h5 className="fw-bold">{w.name}</h5>
                  <p className="text-muted small">{w.location}</p>
                  <button onClick={() => navigate(`/warehouses/${w.id}`)} className="btn btn-dark w-100 rounded-pill mb-2">Ouvrir le stock</button>
                  {isAdmin && (
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingId(w.id); setEditData({name: w.name, location: w.location}); }}>Modifier</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteWarehouse(w.id)}>Supprimer</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="col-12"><Alert variant="info">Aucun entrepôt trouvé.</Alert></div>
        )}
      </div>
    </div>
  );
}
export default Warehouses;