import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "", email: "", company_name: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name
      });

      alert("Compte créé avec succès ! Veuillez vous connecter.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.username) setError("Nom d'utilisateur : " + data.username[0]);
        else if (data.email) setError("Email : " + data.email[0]);
        else if (data.detail) setError(data.detail);
        else setError("Échec de l'inscription. Vérifiez vos données.");
      } else {
        setError("Problème de connexion au serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow">
        <div className="card-body">
          <h2 className="text-center mb-4">Créer un compte</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom d'utilisateur</label>
              <input type="text" name="username" className="form-control" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Nom de l'entreprise</label>
              <input type="text" name="company_name" className="form-control" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Mot de passe</label>
              <input type="password" name="password" className="form-control" onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirmer le mot de passe</label>
              <input type="password" name="confirmPassword" className="form-control" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? "Création..." : "S'inscrire"}
            </button>
          </form>
          <p className="text-center mt-3">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
