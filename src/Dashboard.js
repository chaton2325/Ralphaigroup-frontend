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
        // On prend les 3 dernières vidéos
        setRecentVideos((historyResponse.data.history || []).slice(0, 3));

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
      {/* En-tête Pro avec Profil et Jetons */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Tableau de bord</h2>
          <p>Heureux de vous revoir, {user.username || 'Utilisateur'}</p>
        </div>
        
        <div className="header-right">
          {/* Groupe Crédits & Achat */}
          <div className="credits-group">
            <div className="credits-info">
              <span className="credits-amount">{user.tokens || 0}</span>
              <span className="credits-label">crédits</span>
            </div>
            <button className="btn-recharge" onClick={handleRechargeClick}>
              + Recharger
            </button>
          </div>
          
          <div className="header-separator"></div>

          {/* Profil & Logout */}
          <div className="user-profile-group">
             <div className="avatar-small">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
             </div>
             <button className="btn btn-login" onClick={handleLogout} style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>
                Déconnexion
             </button>
          </div>
        </div>
      </div>

      {/* Section Action Principale (Hero) */}
      <div className="create-section">
         <h3>Prêt à créer quelque chose d'unique ?</h3>
         <p>Générez des vidéos publicitaires professionnelles en quelques secondes grâce à notre IA.</p>
         <button className="btn-create-big" onClick={() => onNavigate('create')}>
            + Créer une nouvelle vidéo
         </button>
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
            <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>Recharger vos crédits</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Choisissez le pack qui correspond à vos besoins</p>
            
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <h3 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>{pkg.name}</h3>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{(pkg.price / 100).toFixed(2)}€</div>
                  <div style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '600', margin: '1rem 0' }}>{pkg.tokens} Jetons</div>
                  <button className="btn btn-signup" onClick={() => handleBuyPackage(pkg.id)} style={{ width: '100%', marginTop: '1rem' }}>Choisir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;