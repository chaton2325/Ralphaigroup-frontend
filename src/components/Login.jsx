import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Correspond à votre curl POST /api/auth/login
      const response = await api.post('/auth/login', formData);
      
      // response.data contient { message: "...", token: "..." }
      if (response.data.token) {
        login(response.data.token);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la connexion");
    }
  };

  return (
    <div className="container">
      <h2>LOGIN</h2>
      {error && <p className="error">{error}</p>}
      
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Se connecter</button>
      </form>

      <button onClick={() => navigate('/register')} className="secondary">
        Pas de compte ? S'inscrire
      </button>
    </div>
  );
};

export default Login;
