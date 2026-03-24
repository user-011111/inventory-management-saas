import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Correction de la ligne qui causait l'erreur "Initialization"
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Appel au backend pour obtenir le Token
      const response = await api.post('/api/token/', { 
        username: username, 
        password: password 
      });
      
      const token = response.data.access;
      
      // On sauvegarde le token et le nom immédiatement
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      try {
        // 2. Appel au profil (URL corrigée par Student A : /api/user/)
        const userRes = await api.get('/api/user/');
        
        // On récupère le rôle (ex: 'owner' ou 'employee')
        const role = userRes.data.role || 'employee';
        localStorage.setItem('userRole', role);
        
        console.log("Profil récupéré avec succès. Rôle :", role);
      } catch (profileErr) {
        console.warn("L'API /api/user/ a échoué, utilisation du rôle par défaut.");
        // Si le profil échoue (ex: 404), on met 'employee' pour ne pas bloquer
        localStorage.setItem('userRole', 'employee');
      }

      // 3. Tout est bon, on va vers le Dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError("Identifiants incorrects ou serveur injoignable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f0f2f5' }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: '#0d6efd' }}>Connexion</h2>
          <p className="text-muted small">Inventaire SaaS - Portail Riyad</p>
        </div>
        
        {error && (
          <div className="alert alert-danger text-center py-2 small shadow-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold small">Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control form-control-lg border-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="riyad"
              required
              style={{ borderRadius: '10px', fontSize: '1rem' }}
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-bold small">Mot de passe</label>
            <input
              type="password"
              className="form-control form-control-lg border-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ borderRadius: '10px', fontSize: '1rem' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-100 fw-bold py-2 shadow"
            disabled={loading}
            style={{ borderRadius: '10px', transition: '0.3s' }}
          >
            {loading ? (
              <span><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;