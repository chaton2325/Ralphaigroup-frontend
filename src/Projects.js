import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
  History,
  Monitor,
  Smartphone,
  ArrowLeft,
  Download,
  ExternalLink,
  Loader2,
  VideoOff,
  Layers,
  CheckSquare,
  Square,
  X,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import api from './services/api';

function Projects({ onNavigate }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [orientations, setOrientations] = useState({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

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

  const toggleSelectionMode = () => {
    if (!isSelectionMode) {
      setShowInstructionModal(true);
    }
    setIsSelectionMode(!isSelectionMode);
    setSelectedVideos([]);
  };

  const handleVideoSelect = (video) => {
    if (selectedVideos.find(v => v.id === video.id)) {
      setSelectedVideos(selectedVideos.filter(v => v.id !== video.id));
    } else {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const moveVideo = (index, direction) => {
    const newList = [...selectedVideos];
    if (direction === 'up' && index > 0) {
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setSelectedVideos(newList);
  };

  const removeVideoFromMerge = (index) => {
    const newList = [...selectedVideos];
    newList.splice(index, 1);
    setSelectedVideos(newList);
  };

  const executeMerge = async () => {
    if (merging || selectedVideos.length < 2) return;
    setMerging(true);
    setMergeProgress(0);

    try {
        const ffmpeg = ffmpegRef.current;
        const baseURL = '/ffmpeg';

        if (!ffmpeg.loaded) {
            await ffmpeg.load({
            coreURL: `${baseURL}/ffmpeg-core.js`,
            wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            worker: false,   // important pour Vercel
            thread: false    // désactive multi-threading pour plus de compatibilité
          });
        }

        ffmpeg.on('progress', ({ progress }) => {
            setMergeProgress(Math.round(progress * 100));
        });

        let fileListContent = '';
        for (let i = 0; i < selectedVideos.length; i++) {
            const video = selectedVideos[i];
            const fileName = `input${i}.mp4`;
            await ffmpeg.writeFile(fileName, await fetchFile(video.video_url));
            fileListContent += `file '${fileName}'\n`;
        }

        await ffmpeg.writeFile('filelist.txt', fileListContent);
        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-c', 'copy', 'output.mp4']);

        const data = await ffmpeg.readFile('output.mp4');
        const mergedBlob = new Blob([data.buffer], { type: 'video/mp4' });

        const formData = new FormData();
        formData.append('file', mergedBlob, 'merged_video.mp4');
        
        await api.post('/video/save-merged', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Rafraîchir l'historique
        const response = await api.get('/video/history');
        setVideos(response.data.history || []);
        
        setShowMergeModal(false);
        setIsSelectionMode(false);
        setSelectedVideos([]);
        alert("Fusion terminée ! La vidéo a été ajoutée à vos projets.");

    } catch (err) {
        console.error(err);
        alert("Erreur lors de la fusion.");
    } finally {
        setMerging(false);
        setMergeProgress(0);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    const orientation = orientations[video.id];
    if (!orientation) return true;
    return orientation === filter;
  });

  return (
    <div className="dashboard-wrapper">
      <style>{`
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 15px;
            height: auto !important;
          }
          .header-buttons-container {
            width: 100%;
            display: flex !important;
            flex-wrap: wrap;
            gap: 10px !important;
          }
          .header-buttons-container button {
            flex: 1;
            justify-content: center;
            padding: 10px !important;
            font-size: 0.9rem !important;
          }
          .filter-container button {
            flex: 1 0 auto;
            justify-content: center;
          }
        }
      `}</style>
      <div className="dashboard-header reveal">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={24} color="var(--accent)" />
            <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Mes Projets</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Bibliothèque haute performance de vos créations AI</p>
        </div>
        <div className="header-buttons-container" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-apple-secondary" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Dashboard
          </button>
        </div>
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
        {!isSelectionMode ? (
          <button className="btn-apple-secondary" onClick={toggleSelectionMode}>
            <Layers size={16} style={{ marginRight: '8px' }} />
            Fusionner
          </button>
        ) : (
          <>
            <button 
              className="btn-apple-primary" 
              onClick={() => setShowMergeModal(true)} 
              disabled={selectedVideos.length < 2}
              style={{ background: '#ec4899', borderColor: '#ec4899' }}
            >
              <Layers size={16} style={{ marginRight: '8px' }} />
              Fusionner ({selectedVideos.length})
            </button>
            <button className="btn-apple-secondary" onClick={toggleSelectionMode}>
              <X size={16} style={{ marginRight: '8px' }} />
              Annuler
            </button>
          </>
        )}
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
            const isSelected = selectedVideos.find(v => v.id === video.id);
            return (
                <div 
                key={video.id} 
                className={`project-card ${orientation} reveal`}
                style={{ 
                  border: isSelected ? '2px solid #ec4899' : '1px solid transparent',
                  transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  cursor: isSelectionMode ? 'pointer' : 'default'
                }}
                onClick={() => isSelectionMode && handleVideoSelect(video)}
              >
                <div className={`video-wrapper ${orientation}`}>
                  {isSelectionMode && (
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                      {isSelected ? <CheckSquare color="#ec4899" fill="white" size={24} /> : <Square color="white" fill="rgba(0,0,0,0.5)" size={24} />}
                    </div>
                  )}
                  {isSelectionMode && <div style={{ position: 'absolute', inset: 0, zIndex: 5 }} />}
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

      {showMergeModal && (
        <div className="modal-overlay reveal">
          <div className="modal-content glass reveal" style={{ maxWidth: '600px' }}>
            <button className="close-btn" onClick={() => setShowMergeModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h2 className="modal-title">Fusionner les séquences</h2>
              <p className="modal-subtitle">Organisez l'ordre de vos {selectedVideos.length} vidéos</p>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedVideos.map((video, idx) => (
                <div key={video.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', 
                  background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' 
                }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{idx + 1}</span>
                  <video src={video.video_url} style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', background: '#000' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.prompt || 'Sans titre'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(video.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => moveVideo(idx, 'up')} disabled={idx === 0} style={{ padding: '5px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => moveVideo(idx, 'down')} disabled={idx === selectedVideos.length - 1} style={{ padding: '5px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer', opacity: idx === selectedVideos.length - 1 ? 0.3 : 1 }}>
                      <ArrowDown size={16} />
                    </button>
                    <button onClick={() => removeVideoFromMerge(idx)} style={{ padding: '5px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-apple-primary w-full" 
                onClick={executeMerge} 
                disabled={merging || selectedVideos.length < 2}
                style={{ background: '#ec4899', justifyContent: 'center' }}
              >
                {merging ? (
                  <><Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} /> Fusion en cours {mergeProgress}%</>
                ) : (
                  <><Layers size={18} style={{ marginRight: '8px' }} /> Lancer la fusion</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showInstructionModal && (
        <div className="modal-overlay reveal" style={{ zIndex: 2000 }}>
          <div className="modal-content glass reveal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', marginBottom: '10px' }}>
              <h2 className="modal-title">Mode Fusion</h2>
            </div>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Sélectionnez vos vidéos en cochant les cases pour commencer la fusion.
            </p>
            <button 
              className="btn-apple-primary w-full" 
              onClick={() => setShowInstructionModal(false)}
              style={{ justifyContent: 'center' }}
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;