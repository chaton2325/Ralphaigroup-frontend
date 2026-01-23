import React, { useState } from 'react';
import api from './services/api';

function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem'}}>Créer un compte</h2>
        {error && <div style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom complet</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Jean Dupont" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-signup" disabled={loading} style={{width: '100%', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: loading ? 0.7 : 1}}>
            {loading ? 'Inscription...' : 'S\'inscrire gratuitement'}
          </button>
        </form>
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          Déjà un compte ? <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('login')}} style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: '600'}}>Se connecter</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;