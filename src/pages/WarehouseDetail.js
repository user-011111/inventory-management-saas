import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Spinner, Table, Button, Alert } from "react-bootstrap";

function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FORMULAIRE SANS QUANTITÉ
  const [newProduct, setNewProduct] = useState({ name: "", sku: "" });

  const userRole = localStorage.getItem("userRole")?.toLowerCase();
  const isAdmin = userRole === "owner" || userRole === "manager";
  const isEmployee = userRole === "employee";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warRes, invRes] = await Promise.all([
        api.get(`/api/warehouses/${id}/`),
        api.get(`/api/warehouses/${id}/inventory/`)
      ]);
      setWarehouse(warRes.data);
      const data = invRes.data.results || invRes.data;
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // AJUSTEMENT DE STOCK (Méthode POST /adjust-stock/)
  const handleAdjustStock = async (productId, operation) => {
    try {
      await api.post("/api/adjust-stock/", {
        product_id: productId,
        quantity: 1, // On ajoute/retire 1
        operation: operation // "in" ou "out"
      });
      fetchData(); // Rafraîchir l'affichage
    } catch (err) {
      const msg = err.response?.data?.error || "Action impossible (vérifiez le stock)";
      alert(`⚠️ ${msg}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Envoi uniquement de name et sku (le stock commence à 0)
      await api.post("/api/products/", {
        name: newProduct.name,
        sku: newProduct.sku,
        warehouse: parseInt(id, 10)
      });
      setNewProduct({ name: "", sku: "" });
      fetchData(); 
    } catch (err) {
      alert("Erreur lors de l'ajout du produit.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Supprimer ce produit ?")) {
      try {
        await api.delete(`/api/products/${productId}/`);
        fetchData();
      } catch (err) { alert("Erreur suppression."); }
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📍 {warehouse?.name}</h2>
        <Button variant="outline-dark" className="rounded-pill" onClick={() => navigate("/warehouses")}>
          Retour
        </Button>
      </div>

      {isAdmin && (
        <div className="card shadow-sm p-4 mb-4 bg-light border-0" style={{ borderRadius: "15px" }}>
          <h5 className="fw-bold mb-3 text-primary">➕ Nouveau Produit (Fiche de base)</h5>
          <form onSubmit={handleAddProduct} className="row g-2">
            <div className="col-md-5">
              <input type="text" className="form-control" placeholder="Nom" value={newProduct.name} 
                onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            </div>
            <div className="col-md-5">
              <input type="text" className="form-control" placeholder="SKU" value={newProduct.sku} 
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})} required />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100 fw-bold">CRÉER</button>
            </div>
          </form>
        </div>
      )}

      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <Table hover align="middle" className="mb-0 text-center">
          <thead className="table-dark">
            <tr>
              <th className="text-start ps-4">PRODUIT</th>
              <th>SKU</th>
              <th>QUANTITÉ</th>
              <th>AJUSTEMENT STOCK</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? inventory.map((item) => (
              <tr key={item.id}>
                <td className="text-start ps-4 fw-bold">{item.name}</td>
                <td><code>{item.sku}</code></td>
                <td>
                  <span className={`badge ${item.quantity > 0 ? 'bg-primary' : 'bg-danger'} fs-6`}>
                    {item.quantity} unités
                  </span>
                </td>
                <td>
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    {isEmployee ? (
                      <div className="btn-group shadow-sm">
                        <Button variant="outline-danger" size="sm" onClick={() => handleAdjustStock(item.id, "out")}>−</Button>
                        <Button variant="outline-success" size="sm" onClick={() => handleAdjustStock(item.id, "in")}>+</Button>
                      </div>
                    ) : (
                      <span className="text-muted small">Action employé</span>
                    )}
                    {isAdmin && (
                      <Button variant="link" className="text-danger p-0 ms-2" onClick={() => handleDeleteProduct(item.id)}>
                        Supprimer
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-4 text-muted">L'entrepôt est vide.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default WarehouseDetail;