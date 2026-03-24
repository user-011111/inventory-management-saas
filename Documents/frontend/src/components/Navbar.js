import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Utilisateur";
  const userRole = localStorage.getItem("userRole")?.toUpperCase() || "USER";

  const checkNotifications = () => {
    const all = JSON.parse(localStorage.getItem("pending_transfers") || "[]");
    setNotifCount(all.length);
  };

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 shadow">
      <div className="container-fluid">
        <Link to="/dashboard" className="navbar-brand fw-bold">📦 INVENTORY SAAS</Link>
        
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/dashboard">Tableau de bord</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/warehouses">Mes Entrepôts</Link></li>
          </ul>

          <div className="d-flex align-items-center">
            <Link to="/notifications" className="nav-link text-white me-4 position-relative">
              <span style={{ fontSize: "1.2rem" }}>🔔</span>
              {notifCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifCount}
                </span>
              )}
            </Link>

            <div className="d-flex align-items-center border-start ps-3">
              <div className="text-end me-3">
                <div className="text-white small fw-bold">{username}</div>
                <span className="badge bg-warning text-dark" style={{ fontSize: "0.6rem" }}>{userRole}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">Déconnexion</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;