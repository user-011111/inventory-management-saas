import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  // On récupère les infos stockées lors du Login
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole')?.toLowerCase(); // owner, manager, employee

  const handleLogout = () => {
    localStorage.clear(); // Efface le token et le rôle
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        {/* Logo / Nom du projet */}
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <span className="text-primary">Stock</span>Master
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Tableau de bord</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/warehouses">Entrepôts</Link>
            </li>

            {/* SECTION OWNER UNIQUEMENT */}
            {userRole === 'owner' && (
              <li className="nav-item">
                <Link className="nav-link fw-bold text-warning" to="/add-user">
                  ➕ Gérer les Membres
                </Link>
              </li>
            )}
          </ul>

          {/* Profil et Déconnexion */}
          <div className="d-flex align-items-center">
            <span className="navbar-text me-3 text-light">
              Bonjour, <strong className="text-info">{username}</strong> 
              <span className="badge bg-secondary ms-2 text-uppercase" style={{fontSize: '0.7rem'}}>
                {userRole}
              </span>
            </span>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;