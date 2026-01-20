import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      // Correspond à votre curl POST /api/auth/register
      const response = await api.post('/auth/register', formData);
      setMessage(response.data.message); // "Utilisateur créé avec succès"
      
      // Redirection vers le login après 2 secondes
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Gestion de l'erreur "Nom d'utilisateur ou email déjà utilisé"
      setError(err.response?.data?.message || "Une erreur est survenue");
    }
  };

  return (
    <div className="container">
      <h2>INSCRIPTION</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>

      <button onClick={() => navigate('/login')} className="secondary">
        Déjà un compte ? Se connecter
      </button>
    </div>
  );
};

export default Register;
