import React, { useState } from 'react';
import api from './services/api';

function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({ username: '', email: '', emailConfirm: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Vérification que les deux emails sont identiques
    if (formData.email !== formData.emailConfirm) {
      setError("Les emails ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      alert('Compte créé avec succès ! Veuillez vous connecter.');
      onNavigate('login');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-left reveal">
        <img src="/image/favicon.jpg" alt="ralp-ai logo" className="auth-brand-logo" />
        <h1 className="auth-brand-name">ralp-ai</h1>
        <p className="auth-brand-desc">Rejoignez l'élite créative. Des vidéos professionnelles à la portée de votre imagination.</p>
      </div>

      <div className="auth-right reveal">
        <div className="auth-card-apple glass">
          <h2 className="auth-title">Créer un compte</h2>
          {error && <div className="error-pill">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-apple">
              <label>Nom complet</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Jean Dupont" required />
            </div>
            <div className="form-group-apple">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
            </div>
            <div className="form-group-apple">
              <label>Confirmer Email</label>
              <input type="email" name="emailConfirm" value={formData.emailConfirm} onChange={handleChange} placeholder="Retapez votre email" required />
            </div>
            <div className="form-group-apple">
              <label>Mot de passe</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-apple-primary w-full" disabled={loading}>
              {loading ? 'Inscription...' : 'S\'inscrire gratuitement'}
            </button>
          </form>
          <div className="auth-footer-link">
            Déjà un compte ? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login') }}>Se connecter</a>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Signup;
