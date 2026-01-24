import React, { useState, useEffect } from 'react';
import api from './services/api';

function Projects({ onNavigate }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'landscape', 'portrait'
  const [orientations, setOrientations] = useState({}); // Stocke l'orientation par ID de vidéo

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/video/history');
        // L'API renvoie { history: [...] }
        setVideos(response.data.history || []);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Détecte si la vidéo est portrait ou paysage lors du chargement des métadonnées
  const handleMetadata = (id, e) => {
    const { videoWidth, videoHeight } = e.target;
    const orientation = videoWidth < videoHeight ? 'portrait' : 'landscape';
    setOrientations(prev => ({ ...prev, [id]: orientation }));
  };

  // Filtre les vidéos
  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    const orientation = orientations[video.id];
    // Si l'orientation n'est pas encore détectée (chargement), on l'affiche par défaut
    if (!orientation) return true;
    return orientation === filter;
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Mes Projets</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Retrouvez et téléchargez vos vidéos générées</p>
        </div>
        <button className="btn btn-login" onClick={() => onNavigate('dashboard')}>Retour au Dashboard</button>
      </div>

      {/* Filtres */}
      <div className="filter-container" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
          onClick={() => setFilter('all')}
        >
          Tout voir
        </button>
        <button 
          className={`filter-btn ${filter === 'landscape' ? 'active' : ''}`} 
          onClick={() => setFilter('landscape')}
        >
          📺 Paysage (16:9)
        </button>
        <button 
          className={`filter-btn ${filter === 'portrait' ? 'active' : ''}`} 
          onClick={() => setFilter('portrait')}
        >
          📱 Portrait (9:16)
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-muted)' }}>Chargement de vos vidéos...</p>
      ) : videos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Vous n'avez pas encore généré de vidéo.</p>
          <button className="btn btn-signup" onClick={() => onNavigate('dashboard')} style={{ marginTop: '1rem' }}>Créer ma première vidéo</button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredVideos.map((video) => {
            const orientation = orientations[video.id] || 'landscape'; // Par défaut landscape avant chargement
            return (
            <div key={video.id} className={`project-card ${orientation}`}>
              <div className={`video-wrapper ${orientation}`}>
                <video 
                  controls 
                  preload="metadata"
                  src={video.video_url} 
                  width="100%" 
                  height="100%" 
                  onLoadedMetadata={(e) => handleMetadata(video.id, e)}
                />
              </div>
              <div className="project-info">
                <p className="project-date">{new Date(video.created_at).toLocaleDateString()} à {new Date(video.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="project-prompt" title={video.prompt}>{video.prompt}</p>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-login" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
                  Télécharger / Voir
                </a>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;