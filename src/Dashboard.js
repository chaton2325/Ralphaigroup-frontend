import React, { useState, useEffect } from 'react';
import api from './services/api';

function Dashboard({ onNavigate }) {
  // Récupération des infos utilisateur stockées lors du login
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // États pour la gestion des paiements
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentVideos, setRecentVideos] = useState([]);
  const [totalVideos, setTotalVideos] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('home');
  };

  // Charger l'historique récent et le solde de jetons
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Historique
        const historyResponse = await api.get('/video/history');
        const history = historyResponse.data.history || [];
        setTotalVideos(history.length);
        setRecentVideos(history.slice(0, 3));

        // 2. Solde de jetons
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

  // Récupérer les packs depuis l'API
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

  // Lancer le processus de paiement
  const handleBuyPackage = async (packageId) => {
    setLoading(true);
    try {
      const response = await api.post('/payment/create-session', { packageId, email: user.email });
      if (response.data.url) {
        window.location.href = response.data.url; // Redirection vers Stripe
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'initialisation du paiement.");
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* En-tête Simplifié */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Tableau de bord</h2>
        </div>
        
        <div className="header-right">
          <div className="credits-simple" onClick={handleRechargeClick}>
            <span className="credits-amount">{user.tokens || 0}</span>
            <span className="credits-label">crédits</span>
            <div className="credits-plus">+</div>
          </div>
          
          <button className="btn-logout-simple" onClick={handleLogout}>
             Déconnexion
          </button>
        </div>
      </div>

      {/* Grille de Statistiques & Actions */}
      <div className="dashboard-stats-grid">
        {/* Carte : Total Vidéos */}
        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-content">
            <h3>Vidéos Totales</h3>
            <p className="stat-value">{totalVideos}</p>
          </div>
        </div>

        {/* Carte : Crédits */}
        <div className="stat-card" onClick={handleRechargeClick} style={{cursor: 'pointer'}}>
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Crédits Dispo</h3>
            <p className="stat-value">{user.tokens || 0}</p>
          </div>
          <div style={{fontSize: '1.2rem', color: 'var(--primary)'}}>+</div>
        </div>

        {/* Carte : Nouvelle Création */}
        <div className="stat-card create-action" onClick={() => onNavigate('create')}>
          <div className="stat-icon">✨</div>
          <div className="stat-content">
            <h3>Nouvelle Création</h3>
            <p className="stat-desc">Générer une vidéo</p>
          </div>
          <div className="action-arrow">→</div>
        </div>
      </div>

      {/* Section Projets Récents */}
      <div className="projects-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>Vos projets récents</h3>
          <button className="btn btn-login" onClick={() => onNavigate('projects')} style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>Voir tout l'historique</button>
        </div>
        
        {recentVideos.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-muted)', 
            border: '2px dashed #e5e7eb', 
            borderRadius: '12px' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🎬</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Vous n'avez pas encore généré de vidéo.</p>
            <p style={{ fontSize: '0.9rem' }}>Vos futures créations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {recentVideos.map((video) => (
              <div key={video.id} className="project-card">
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

      {/* Modale de sélection des packs */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">Recharger vos crédits</h2>
              <p className="modal-subtitle">Choisissez le pack qui correspond à vos besoins</p>
            </div>
            
            <div className="packages-grid">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className={`package-card ${index === 1 ? 'popular' : ''}`}>
                  {index === 1 && <div className="popular-badge">Populaire</div>}
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-price">{(pkg.price / 100).toFixed(2)}€</div>
                  <div className="package-tokens">
                    <span className="token-icon">⚡</span>
                    {pkg.tokens} Jetons
                  </div>
                  <ul className="package-features">
                    <li>✅ Génération rapide</li>
                    <li>✅ Qualité HD</li>
                    <li>✅ Support prioritaire</li>
                  </ul>
                  <button className="btn-package-select" onClick={() => handleBuyPackage(pkg.id)} disabled={loading}>
                    {loading ? '...' : 'Choisir ce pack'}
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