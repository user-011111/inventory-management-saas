import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";

function Warehouses() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le Modal de Transfert
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ 
    productId: "", 
    fromId: "", 
    toId: "", 
    qty: 1 
  });

  // RÉCUPÉRATION DES DONNÉES (Pour ne rien perdre à l'écran)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [wRes, pRes] = await Promise.all([
        api.get("/api/warehouses/"),
        api.get("/api/products/")
      ]);
      setWarehouses(wRes.data.results || wRes.data);
      setAllProducts(pRes.data.results || pRes.data);
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTransfer = () => {
    if (!transferData.productId || !transferData.fromId || !transferData.toId || !transferData.qty) {
      return alert("Veuillez remplir tous les champs.");
    }

    const product = allProducts.find(p => p.id == transferData.productId);
    const fromW = warehouses.find(w => w.id == transferData.fromId);
    const toW = warehouses.find(w => w.id == transferData.toId);

    const newEntry = { 
      id: Date.now(), 
      ...transferData, 
      productName: product?.name,
      fromName: fromW?.name,
      toName: toW?.name,
      status: "EN_ATTENTE_DEPART" 
    };
    
    const current = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    localStorage.setItem("pending_transfers", JSON.stringify([...current, newEntry]));
    
    setShowTransfer(false);
    setTransferData({ productId: "", fromId: "", toId: "", qty: 1 });
    alert("Demande de transfert envoyée aux notifications !");
  };

  if (loading) return <div className="text-center mt-5">Chargement des entrepôts...</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">🏢 GESTION DES ENTREPÔTS</h2>
        <Button variant="warning" className="fw-bold shadow-sm" onClick={() => setShowTransfer(true)}>
          🚀 Transférer du Stock
        </Button>
      </div>

      {/* AFFICHAGE DES CARTES D'ENTREPÔTS (Comme sur ton image) */}
      <Row>
        {warehouses.map((w) => (
          <Col key={w.id} md={4} className="mb-4">
            <Card className="shadow-sm border-0 text-center p-3" style={{ borderRadius: "15px" }}>
              <div style={{ fontSize: "2rem" }}>📍</div>
              <Card.Body>
                <Card.Title className="fw-bold">{w.name}</Card.Title>
                <Card.Text className="text-muted small">{w.location || "Aucune adresse"}</Card.Text>
                <Button 
                  variant="dark" 
                  className="w-100 rounded-pill mt-2"
                  onClick={() => navigate(`/warehouses/${w.id}`)}
                >
                  Ouvrir le stock
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* MODAL DE TRANSFERT COMPLET */}
      <Modal show={showTransfer} onHide={() => setShowTransfer(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>Nouveau Transfert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-bold">Produit</label>
            <select 
              className="form-select" 
              value={transferData.productId}
              onChange={(e) => setTransferData({...transferData, productId: e.target.value})}
            >
              <option value="">Choisir un produit...</option>
              {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          
          <Row>
            <Col className="mb-3">
              <label className="form-label fw-bold">Départ</label>
              <select 
                className="form-select" 
                value={transferData.fromId}
                onChange={(e) => setTransferData({...transferData, fromId: e.target.value})}
              >
                <option value="">Source...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Col>
            <Col className="mb-3">
              <label className="form-label fw-bold">Destination</label>
              <select 
                className="form-select" 
                value={transferData.toId}
                onChange={(e) => setTransferData({...transferData, toId: e.target.value})}
              >
                <option value="">Cible...</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </Col>
          </Row>

          <div className="mb-3">
            <label className="form-label fw-bold">Quantité à transférer</label>
            <input 
              type="number" 
              className="form-control" 
              min="1"
              value={transferData.qty} 
              onChange={(e) => setTransferData({...transferData, qty: e.target.value})} 
            />
          </div>

          <Button variant="primary" className="w-100 fw-bold py-2 mt-3" onClick={handleCreateTransfer}>
            LANCER LE MOUVEMENT
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Warehouses;