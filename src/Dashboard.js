import React, { useState, useEffect } from 'react';
import {
  Video,
  Zap,
  Sparkles,
  ArrowRight,
  Plus,
  History,
  X,
  CheckCircle2,
  Trophy,
  LogOut
} from 'lucide-react';
import api from './services/api';

function Dashboard({ onNavigate }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentVideos, setRecentVideos] = useState([]);
  const [totalVideos, setTotalVideos] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_pending_data');
    onNavigate('home');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyResponse = await api.get('/video/history');
        const history = historyResponse.data.history || [];
        setTotalVideos(history.length);
        setRecentVideos(history.slice(0, 3));

        const balanceResponse = await api.get('/users/balance');
        if (balanceResponse.data.tokens !== undefined) {
          setUser(prevUser => {
            const updatedUser = { ...prevUser, tokens: balanceResponse.data.tokens };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      } catch (err) {
        console.error("Erreur chargement données dashboard", err);
      }
    };
    fetchData();
  }, []);

  const handleRechargeClick = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payment/packages');
      setPackages(response.data);
      setShowModal(true);
    } catch (err) {
      alert("Impossible de charger les offres pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = async (packageId) => {
    setLoading(true);
    try {
      const response = await api.post('/payment/create-session', { packageId, email: user.email });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'initialisation du paiement.");
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header reveal">
        <div className="header-left">
          <h2>Tableau de bord</h2>
        </div>

        <div className="header-right">
          <div className="credits-simple reveal" onClick={handleRechargeClick}>
            <span className="credits-amount">{user.tokens || 0}</span>
            <span className="credits-label">jetons</span>
            <div className="credits-plus"><Plus size={14} /></div>
          </div>

          <button className="btn-logout-simple" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card reveal">
          <div className="stat-icon"><Video size={24} /></div>
          <div className="stat-content">
            <h3>Vidéos Totales</h3>
            <p className="stat-value">{totalVideos}</p>
          </div>
        </div>

        <div className="stat-card reveal" onClick={handleRechargeClick} style={{ cursor: 'pointer' }}>
          <div className="stat-icon"><Zap size={24} /></div>
          <div className="stat-content">
            <h3>Jetons Dispo</h3>
            <p className="stat-value">{user.tokens || 0}</p>
          </div>
          <Plus size={18} color="var(--accent)" />
        </div>

        <div className="stat-card create-action reveal" onClick={() => onNavigate('create')}>
          <div className="stat-icon"><Sparkles size={24} /></div>
          <div className="stat-content">
            <h3>Studio Créatif</h3>
            <p className="stat-desc">Générer une vidéo</p>
          </div>
          <div className="action-arrow"><ArrowRight size={20} /></div>
        </div>
      </div>

      <div className="projects-section reveal" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>Projets récents</h3>
          <button className="btn-apple-secondary sm" onClick={() => onNavigate('projects')}>
            <History size={16} style={{ marginRight: '8px' }} />
            Historique complet
          </button>
        </div>

        {recentVideos.length === 0 ? (
          <div className="empty-state reveal">
            <Video size={48} strokeWidth={1} opacity={0.3} style={{ marginBottom: '1rem' }} />
            <p>Aucune vidéo pour le moment.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {recentVideos.map((video) => (
              <div key={video.id} className="project-card reveal">
                <div className="video-wrapper">
                  <video controls src={video.video_url} width="100%" height="100%" style={{ objectFit: 'cover' }} />
                </div>
                <div className="project-info">
                  <p className="project-date">{new Date(video.created_at).toLocaleDateString()}</p>
                  <p className="project-prompt" title={video.prompt}>{video.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay reveal">
          <div className="modal-content glass reveal">
            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h2 className="modal-title">Recharger vos jetons</h2>
              <p className="modal-subtitle">Propulsez vos projets avec nos packs haute performance</p>
            </div>

            <div className="packages-grid">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className={`package-card reveal ${index === 1 ? 'popular' : ''}`}>
                  {index === 1 && <div className="popular-badge"><Trophy size={12} style={{ marginRight: '4px' }} /> Populaire</div>}
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-price">{(pkg.price / 100).toFixed(2)}€</div>
                  <div className="package-tokens">
                    <Zap size={18} className="token-icon" style={{ fill: 'currentColor' }} />
                    {pkg.tokens} Jetons
                  </div>
                  <ul className="package-features">
                    <li><CheckCircle2 size={16} color="var(--accent)" /> Génération priorité</li>
                    <li><CheckCircle2 size={16} color="var(--accent)" /> Qualité Ultra HD</li>
                    <li><CheckCircle2 size={16} color="var(--accent)" /> Support Expert</li>
                  </ul>
                  <button className="btn-package-select" onClick={() => handleBuyPackage(pkg.id)} disabled={loading}>
                    {loading ? 'Traitement...' : 'Choisir ce pack'}
                  </button>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-close-bottom" onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;