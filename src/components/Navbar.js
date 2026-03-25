import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole')?.toLowerCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <span className="text-primary">Stock</span>Master
        </Link>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Tableau de bord</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/warehouses">Entrepôts</Link>
            </li>
            {userRole === 'owner' && (
              <li className="nav-item">
                <Link className="nav-link fw-bold text-warning" to="/add-user">
                  ➕ Gérer les Membres
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {/* ICONE DE NOTIFICATION AJOUTÉE ICI */}
            <Link to="/notifications" className="nav-link text-light me-4 position-relative">
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                !
              </span>
            </Link>

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