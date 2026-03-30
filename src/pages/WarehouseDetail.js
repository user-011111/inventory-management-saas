import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Spinner, Table, Button, Modal, Form } from "react-bootstrap";

function WarehouseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newProduct, setNewProduct] = useState({ name: "", sku: "" });

  // États pour le transfert
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ productId: "", productName: "", qty: 1, toId: "" });

  const userRole = localStorage.getItem("userRole")?.toLowerCase();
  const isAdmin = userRole === "owner" || userRole === "manager";
  const isEmployee = userRole === "employee";

  const fetchData = async () => {
    try {
      setLoading(true);
      const [warRes, invRes, allWarRes] = await Promise.all([
        api.get(`/api/warehouses/${id}/`),
        api.get(`/api/warehouses/${id}/inventory/`),
        api.get("/api/warehouses/")
      ]);
      setWarehouse(warRes.data);
      setInventory(invRes.data.results || invRes.data);
      // Filtrer pour ne pas transférer vers le même entrepôt
      setAllWarehouses((allWarRes.data.results || allWarRes.data).filter(w => String(w.id) !== String(id)));
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAdjustStock = async (productId, operation) => {
    try {
      await api.post("/api/adjust-stock/", { product_id: productId, quantity: 1, operation });
      fetchData();
    } catch (err) { alert("⚠️ Action impossible"); }
  };

  const handleCreateTransfer = () => {
    const pending = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    const newTransfer = {
      id: Date.now(),
      productId: transferData.productId,
      productName: transferData.productName,
      qty: transferData.qty,
      fromId: id,
      fromName: warehouse.name,
      toId: transferData.toId,
      toName: allWarehouses.find(w => String(w.id) === String(transferData.toId))?.name,
      status: "EN_ATTENTE_DEPART"
    };
    localStorage.setItem("pending_transfers", JSON.stringify([...pending, newTransfer]));
    setShowTransfer(false);
    alert("Transfert initialisé ! Validez la sortie dans les notifications.");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/products/", { ...newProduct, warehouse: parseInt(id, 10) });
      setNewProduct({ name: "", sku: "" });
      fetchData(); 
    } catch (err) { alert("Erreur ajout produit."); }
  }

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📍 {warehouse?.name}</h2>
        <Button variant="outline-dark" className="rounded-pill" onClick={() => navigate("/warehouses")}>Retour</Button>
      </div>

      {isAdmin && (
        <div className="card shadow-sm p-4 mb-4 bg-light border-0">
          <h5 className="fw-bold mb-3 text-primary">➕ Nouveau Produit</h5>
          <form onSubmit={handleAddProduct} className="row g-2">
            <div className="col-md-5"><input type="text" className="form-control" placeholder="Nom" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required /></div>
            <div className="col-md-5"><input type="text" className="form-control" placeholder="SKU" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} required /></div>
            <div className="col-md-2"><button type="submit" className="btn btn-primary w-100 fw-bold">CRÉER</button></div>
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
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? inventory.map((item) => (
              <tr key={item.id}>
                <td className="text-start ps-4 fw-bold">{item.name}</td>
                <td><code>{item.sku}</code></td>
                <td><span className={`badge ${item.quantity > 0 ? 'bg-primary' : 'bg-danger'} fs-6`}>{item.quantity} unités</span></td>
                <td>
                  <div className="d-flex justify-content-center gap-2">
                    {isAdmin && (
                      <Button variant="warning" size="sm" className="fw-bold shadow-sm" 
                        onClick={() => { setTransferData({ ...transferData, productId: item.id, productName: item.name }); setShowTransfer(true); }}>
                        🔄 Transférer
                      </Button>
                    )}
                    {isEmployee && (
                      <div className="btn-group">
                        <Button variant="outline-danger" size="sm" onClick={() => handleAdjustStock(item.id, "out")}>−</Button>
                        <Button variant="outline-success" size="sm" onClick={() => handleAdjustStock(item.id, "in")}>+</Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="4" className="py-4 text-muted">L'entrepôt est vide.</td></tr>}
          </tbody>
        </Table>
      </div>

      <Modal show={showTransfer} onHide={() => setShowTransfer(false)} centered>
        <Modal.Header closeButton><Modal.Title>Transférer {transferData.productName}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Entrepôt de destination</Form.Label>
              <Form.Select onChange={e => setTransferData({...transferData, toId: e.target.value})}>
                <option value="">Sélectionner un entrepôt...</option>
                {allWarehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control type="number" min="1" value={transferData.qty} onChange={e => setTransferData({...transferData, qty: e.target.value})} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTransfer(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleCreateTransfer} disabled={!transferData.toId}>Confirmer le transfert</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default WarehouseDetail;