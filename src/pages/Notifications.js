import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";

function Notifications() {
  const [transfers, setTransfers] = useState([]);
  const userRole = localStorage.getItem("userRole")?.toLowerCase();
  const assignedWarehouse = localStorage.getItem("assignedWarehouse");

  const loadTransfers = () => {
    const all = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    setTransfers(all);
  };

  useEffect(() => { loadTransfers(); }, []);

  const handleProcess = async (t, action) => {
    try {
      const prodRes = await api.get(`/api/products/${t.productId}/`);
      const p = prodRes.data;

      if (action === "DEPART") {
        await api.put(`/api/products/${t.productId}/`, {
          name: p.name, sku: p.sku, quantity: p.quantity - parseInt(t.qty), warehouse: t.fromId
        });
        updateStatus(t.id, "EN_TRANSIT");
        alert(`✅ CONFIRMÉ : La sortie de ${t.qty} x ${t.productName} de l'entrepôt ${t.fromName} est validée.`);
      } else {
        await api.put(`/api/products/${t.productId}/`, {
          name: p.name, sku: p.sku, quantity: (p.quantity || 0) + parseInt(t.qty), warehouse: t.toId
        });
        removeTransfer(t.id);
        alert(`✅ BIEN REÇU : ${t.qty} x ${t.productName} ont été ajoutés au stock de ${t.toName}.`);
      }
      loadTransfers();
    } catch (err) { alert("Erreur lors de la mise à jour."); }
  };

  const updateStatus = (id, status) => {
    const all = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    localStorage.setItem("pending_transfers", JSON.stringify(all.map(item => item.id === id ? { ...item, status } : item)));
  };

  const removeTransfer = (id) => {
    const all = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    localStorage.setItem("pending_transfers", JSON.stringify(all.filter(item => item.id !== id)));
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">🔔 Mouvements de Stock</h2>
      {transfers.length === 0 ? <p className="text-muted text-center">Aucune notification.</p> : transfers.map(t => (
        <div key={t.id} className="card mb-3 shadow-sm border-0 border-start border-4 border-primary">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold">{t.productName} (x{t.qty})</h5>
              <p className="small mb-0 text-muted">De: {t.fromName} ➔ Vers: {t.toName}</p>
              <span className="badge bg-warning text-dark mt-2">{t.status.replace(/_/g, ' ')}</span>
            </div>
            <div>
              {t.status === "EN_ATTENTE_DEPART" && (userRole !== "employee" || String(assignedWarehouse) === String(t.fromId)) && (
                <button className="btn btn-dark btn-sm" onClick={() => handleProcess(t, "DEPART")}>Confirmer Sortie</button>
              )}
              {t.status === "EN_TRANSIT" && (userRole !== "employee" || String(assignedWarehouse) === String(t.toId)) && (
                <button className="btn btn-success btn-sm" onClick={() => handleProcess(t, "ARRIVEE")}>Confirmer Entrée</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default Notifications;