import React, { useState } from 'react';
import api from './services/api';

function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      // Sauvegarde du token et des infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        tokens: response.data.tokens
      }));

      onNavigate('dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container">
      <div className="auth-left reveal">
        <img src="/image/favicon.jpg" alt="ralp-ai logo" className="auth-brand-logo" />
        <h1 className="auth-brand-name">ralp-ai</h1>
        <p className="auth-brand-desc">Accédez à l'excellence technologique. Studio de création vidéo haute performance.</p>
      </div>

      <div className="auth-right reveal">
        <div className="auth-card-apple glass">
          <h2 className="auth-title">Connexion</h2>
          {error && <div className="error-pill">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group-apple">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group-apple">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-apple-primary w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="auth-footer-link">
            Pas encore de compte ? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('signup') }}>S'inscrire</a>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Login;