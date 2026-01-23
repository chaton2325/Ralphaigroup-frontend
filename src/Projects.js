import React, { useState, useEffect } from 'react';
import api from './services/api';

function Projects({ onNavigate }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Mes Projets</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Retrouvez et téléchargez vos vidéos générées</p>
        </div>
        <button className="btn btn-login" onClick={() => onNavigate('dashboard')}>Retour au Dashboard</button>
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
          {videos.map((video) => (
            <div key={video.id} className="project-card">
              <div className="video-wrapper">
                <video controls src={video.video_url} width="100%" height="100%" style={{ objectFit: 'cover' }} />
              </div>
              <div className="project-info">
                <p className="project-date">{new Date(video.created_at).toLocaleDateString()} à {new Date(video.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="project-prompt" title={video.prompt}>{video.prompt}</p>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-login" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none' }}>
                  Télécharger / Voir
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;