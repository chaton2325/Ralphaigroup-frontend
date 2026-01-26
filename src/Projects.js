import React, { useState, useEffect } from 'react';
import {
  History,
  Monitor,
  Smartphone,
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  VideoOff
} from 'lucide-react';
import api from './services/api';

function Projects({ onNavigate }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [orientations, setOrientations] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/video/history');
        setVideos(response.data.history || []);
      } catch (err) {
        console.error("Erreur lors du chargement de l'historique", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleMetadata = (id, e) => {
    const { videoWidth, videoHeight } = e.target;
    const orientation = videoWidth < videoHeight ? 'portrait' : 'landscape';
    setOrientations(prev => ({ ...prev, [id]: orientation }));
  };

  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    const orientation = orientations[video.id];
    if (!orientation) return true;
    return orientation === filter;
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header reveal">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={24} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Mes Projets</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Bibliothèque haute performance de vos créations AI</p>
        </div>
        <button className="btn-apple-secondary" onClick={() => onNavigate('dashboard')}>
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Dashboard
        </button>
      </div>

      <div className="filter-container reveal" style={{ marginBottom: '3rem', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
          <Monitor size={14} style={{ marginRight: '8px' }} />
          Paysage
        </button>
        <button
          className={`filter-btn ${filter === 'portrait' ? 'active' : ''}`}
          onClick={() => setFilter('portrait')}
        >
          <Smartphone size={14} style={{ marginRight: '8px' }} />
          Portrait
        </button>
      </div>

      {loading ? (
        <div className="loading-state reveal">
          <Loader2 size={32} className="animate-spin" color="var(--accent)" />
          <p>Chargement de votre bibliothèque...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state reveal">
          <VideoOff size={48} strokeWidth={1} opacity={0.3} style={{ marginBottom: '1.5rem' }} />
          <p className="empty-title">Bibliothèque vide</p>
          <p className="empty-subtitle">Vos futures créations seront archivées automatiquement ici.</p>
          <button className="btn-apple-primary" onClick={() => onNavigate('create')} style={{ marginTop: '2rem' }}>
            Créer ma première vidéo
          </button>
        </div>
      ) : (
        <div className="projects-grid reveal">
          {filteredVideos.map((video) => {
            const orientation = orientations[video.id] || 'landscape';
            return (
              <div key={video.id} className={`project-card ${orientation} reveal`}>
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
                  <p className="project-date">{new Date(video.created_at).toLocaleDateString()}</p>
                  <p className="project-prompt" title={video.prompt}>{video.prompt}</p>
                  <div className="project-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="btn-apple-primary sm w-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ExternalLink size={14} style={{ marginRight: '6px' }} />
                      Voir / Télécharger
                    </a>
                  </div>
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