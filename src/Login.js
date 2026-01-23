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
    <div className="auth-container">
      <div className="auth-card">
        <h2 style={{textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem'}}>Connexion</h2>
        {error && <div style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-signup" disabled={loading} style={{width: '100%', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: loading ? 0.7 : 1}}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)'}}>
          Pas encore de compte ? <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('signup')}} style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: '600'}}>S'inscrire</a>
        </p>
      </div>
    </div>
  );
}

export default Login;