import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

function AddUser() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    assigned_warehouse: '' // ID de l'entrepôt
  });

  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 1. Récupérer les entrepôts de l'entreprise au chargement
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await api.get('/api/warehouses/'); // Vérifie l'URL avec Student A
        setWarehouses(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des entrepôts", err);
      }
    };
    fetchWarehouses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si on passe à 'manager', on vide l'entrepôt car Student A l'interdit
    if (name === 'role' && value === 'manager') {
      setFormData({ ...formData, [name]: value, assigned_warehouse: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Préparation des données pour le backend de Student A
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      assigned_warehouse: formData.role === 'employee' ? formData.assigned_warehouse : null
    };

    try {
      // Appel vers l'URL correcte du backend
      await api.post('/api/create-user/', dataToSend);
      
      setMessage({ type: 'success', text: "Utilisateur créé et assigné avec succès !" });
      setFormData({ username: '', email: '', password: '', role: 'employee', assigned_warehouse: '' });
    } catch (err) {
      // Capture les erreurs de validation spécifiques du backend
      const backendError = err.response?.data;
      let errorText = "Erreur lors de la création.";
      
      if (backendError) {
        // Affiche l'erreur de validation (ex: "Employee must be assigned to a warehouse")
        errorText = backendError.non_field_errors?.[0] || Object.values(backendError)[0];
      }
      
      setMessage({ type: 'danger', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow border-0" style={{ borderRadius: '15px' }}>
            <div className="card-body p-4">
              <h2 className="fw-bold mb-4 text-primary">Ajouter un collaborateur</h2>

              {message.text && (
                <div className={`alert alert-${message.type} fade show`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small">Nom d'utilisateur</label>
                    <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small">Email</label>
                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Mot de passe provisoire</label>
                  <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small">Rôle</label>
                    <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                      <option value="employee">Employé (Stock spécifique)</option>
                      <option value="manager">Manager (Tous les stocks)</option>
                    </select>
                  </div>

                  {/* Champ dynamique : visible uniquement pour les employés */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold small">Assigner à l'entrepôt</label>
                    <select 
                      name="assigned_warehouse" 
                      className="form-select" 
                      value={formData.assigned_warehouse} 
                      onChange={handleChange}
                      disabled={formData.role === 'manager'}
                      required={formData.role === 'employee'}
                    >
                      <option value="">-- Sélectionner --</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                    {formData.role === 'manager' && (
                      <small className="text-muted">Un manager gère toute l'entreprise.</small>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-4 py-2 fw-bold shadow-sm" disabled={loading}>
                  {loading ? "Création en cours..." : "Créer le compte"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUser;