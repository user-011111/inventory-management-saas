import axios from 'axios';

const api = axios.create({
  // Remplace bien par le DERNIER lien que Student A t'a donné
  baseURL: 'https://unpersonalizing-enormously-kaliyah.ngrok-free.dev', 
  headers: {
    'Content-Type': 'application/json',
    // CE HEADER SAUTE LA PAGE D'AVERTISSEMENT NGROK
    'ngrok-skip-browser-warning': 'true' 
  }
});

// Cet intercepteur ajoute le Token de connexion à chaque appel API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
