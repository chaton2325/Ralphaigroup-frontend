import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
  Bot,
  User,
  Send,
  Image as ImageIcon,
  X,
  Zap,
  Download,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  Trophy,
  Loader2,
  Sparkles,
  Film,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';
import api from './services/api';

function CreateVideo({ onNavigate, isActive }) {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState('pc');
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [error, setError] = useState('');
  const [mergeList, setMergeList] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [{
      id: 'welcome',
      type: 'bot',
      content: "Bienvenue dans le Studio Créatif. 👋 \n\nJe suis prêt à donner vie à vos idées. Décrivez votre concept, envoyez une photo de référence si vous le souhaitez, et je génère votre vidéo 8k haute performance.",
    }];
  });
  const messagesEndRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [pendingData, setPendingData] = useState(() => {
    const saved = localStorage.getItem('chat_pending_data');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (pendingData) {
      localStorage.setItem('chat_pending_data', JSON.stringify(pendingData));
    } else {
      localStorage.removeItem('chat_pending_data');
    }
  }, [pendingData]);

  // État pour suivre si l'utilisateur a fait défiler manuellement
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Gestionnaire de défilement pour détecter quand l'utilisateur fait défiler manuellement
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const atBottom = scrollHeight - scrollTop <= clientHeight + 1;
    setIsScrolledToBottom(atBottom);
  };

  useEffect(() => {
    // Ne faire défiler automatiquement que si l'utilisateur est déjà en bas
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages, loading, optimizing, previewUrl, isScrolledToBottom]);

  useEffect(() => {
    if (isActive) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
      setTimeout(scrollToBottom, 100);
    }
  }, [isActive]);

  // Liste des vidéos générées dans la session courante (pour la fusion)
  const generatedVideos = messages.filter(m => m.videoUrl && !m.isError && !m.isMerged);

  const handleExtendVideo = async (videoUrl) => {
    if (uploadingImage || loading) return;
    
    setUploadingImage(true);
    try {
      // Création d'un élément vidéo pour capturer la frame
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous'; // Nécessaire pour éviter le tainting du canvas
      video.src = videoUrl;
      video.muted = true;
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          // Se positionner à la fin (moins 0.1s pour être sûr d'avoir une image)
          video.currentTime = Math.max(0, video.duration - 0.1);
        };
        video.onseeked = () => resolve();
        video.onerror = (e) => reject(new Error('Erreur chargement vidéo'));
        setTimeout(() => reject(new Error('Timeout extraction frame')), 10000);
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
            setUploadingImage(false);
            return;
        }
        const file = new File([blob], "frame_suite.jpg", { type: "image/jpeg" });
        setImageFile(file);
        
        const formDataImage = new FormData();
        formDataImage.append('file', file);

        try {
            const uploadRes = await fetch('https://service.ralp-ai.site/upload', {
              method: 'POST',
              body: formDataImage
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const uploadData = await uploadRes.json();
            setPreviewUrl(`${uploadData.url}?t=${Date.now()}`);
            setCloudinaryUrl(uploadData.url);
            setPrompt("Suite de la vidéo : ");
            document.querySelector('.chat-textarea')?.focus();
        } catch (err) {
            setError("Erreur upload frame.");
        } finally {
            setUploadingImage(false);
        }
      }, 'image/jpeg');
      
    } catch (err) {
      console.error(err);
      setError("Impossible d'extraire la frame (CORS?).");
      setUploadingImage(false);
    }
  };

  const handleMergeVideos = () => {
    if (merging || generatedVideos.length < 2) return;

    setMergeList([...generatedVideos]);

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content: `🎬 **Fusion de Séquences**\n\nOrganisez vos scènes avant la fusion finale.`,
      isMergeConfirmation: true
    }]);
    setTimeout(scrollToBottom, 100);
  };

  const cancelMerge = () => {
    setMessages(prev => prev.map(msg => 
      msg.isMergeConfirmation ? { ...msg, isMergeConfirmation: false, content: "Fusion annulée." } : msg
    ));
  };

  const moveVideo = (index, direction) => {
    const newList = [...mergeList];
    if (direction === 'up' && index > 0) {
        [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
        [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setMergeList(newList);
  };

  const removeVideoFromMerge = (index) => {
    const newList = [...mergeList];
    newList.splice(index, 1);
    setMergeList(newList);
  };

  const executeMerge = async () => {
    setMessages(prev => prev.map(msg => 
      msg.isMergeConfirmation ? { ...msg, isMergeConfirmation: false, content: "Fusion confirmée. Traitement en cours..." } : msg
    ));

    if (merging || mergeList.length < 2) return;

    setMerging(true);
    setMergeProgress(0);
    setError('');

    const mergeMsgId = `merge-status-${Date.now()}`;
    setMessages(prev => [...prev, {
        id: mergeMsgId,
        type: 'bot',
        content: `Préparation de la fusion de ${mergeList.length} vidéos... (cela peut prendre du temps)`,
        isProcessing: true
    }]);

    const onProgress = ({ progress }) => {
        const currentProgress = Math.round(progress * 100);
        setMergeProgress(currentProgress);
        setMessages(prev => prev.map(msg => 
            msg.id === mergeMsgId ? { ...msg, content: `Fusion en cours... ${currentProgress}%`, isProcessing: true } : msg
        ));
    };

    try {
        const ffmpeg = ffmpegRef.current;
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

        if (!ffmpeg.loaded) {
            ffmpeg.on('log', ({ message }) => { console.log(message); });
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                worker: false
            });
        }
        
        ffmpeg.on('progress', onProgress);

        let fileListContent = '';
        for (let i = 0; i < mergeList.length; i++) {
            const video = mergeList[i];
            const fileName = `input${i}.mp4`;
            await ffmpeg.writeFile(fileName, await fetchFile(video.videoUrl));
            fileListContent += `file '${fileName}'\n`;
        }

        await ffmpeg.writeFile('filelist.txt', fileListContent);

        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'filelist.txt', '-c', 'copy', 'output.mp4']);
        
        ffmpeg.off('progress', onProgress);

        const data = await ffmpeg.readFile('output.mp4');
        const mergedBlob = new Blob([data.buffer], { type: 'video/mp4' });
        let url = URL.createObjectURL(mergedBlob);

        let savedToHistory = false;
        try {
            const formData = new FormData();
            formData.append('file', mergedBlob, 'merged_video.mp4');
            const response = await api.post('/video/save-merged', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data && response.data.url) {
                url = response.data.url;
                savedToHistory = true;
            }
        } catch (saveErr) {
            console.error("Erreur sauvegarde vidéo fusionnée:", saveErr);
        }

        setMessages(prev => prev.map(msg => 
            msg.id === mergeMsgId ? { 
                ...msg, 
                content: `Fusion terminée ! Voici le résultat des ${mergeList.length} vidéos.${savedToHistory ? ' (Sauvegardé dans vos projets)' : ''}`,
                videoUrl: url,
                isMerged: true, // Flag pour ne pas afficher "Générer une suite"
                isProcessing: false
            } : msg
        ));

    } catch (err) {
        ffmpegRef.current.off('progress', onProgress);
        console.error("Erreur de fusion vidéo:", err);
        setError("Une erreur est survenue lors de la fusion des vidéos. Cette opération peut être gourmande en ressources.");
        setMessages(prev => prev.map(msg => msg.id === mergeMsgId ? { ...msg, isError: true, content: "La fusion a échoué.", isProcessing: false } : msg));
    } finally {
        setMerging(false);
        setMergeProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setCloudinaryUrl('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/jpeg') {
        setError("Format invalide. JPG uniquement.");
        return;
      }
      setError('');
      setImageFile(file);
      setUploadingImage(true);

      try {
        const formDataImage = new FormData();
        formDataImage.append('file', file);

        const uploadRes = await fetch('https://service.ralp-ai.site/upload', {
          method: 'POST',
          body: formDataImage
        });

        if (!uploadRes.ok) throw new Error("Upload failed");

        const uploadData = await uploadRes.json();
        setPreviewUrl(`${uploadData.url}?t=${Date.now()}`);
        setCloudinaryUrl(uploadData.url);
      } catch (err) {
        setError("Erreur upload image.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleOptimizePrompt = async () => {
    if (!prompt.trim()) return;
    const originalPrompt = prompt;
    setOptimizing(true);
    try {
      const response = await fetch('https://service.ralp-ai.site/optimize-veo3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.veo3_suggestion) {
        setPrompt(data.veo3_suggestion);
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'bot',
          content: `⚡ **Optimisation du prompt**\n\n📝 **Original :** ${originalPrompt}\n\n✨ **Amélioré :** ${data.veo3_suggestion}\n\n(Le champ de saisie a été mis à jour)`
        }]);
      }
    } catch (err) {
      console.error("Erreur optimisation", err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if ((!prompt.trim() && !cloudinaryUrl) || uploadingImage || loading || optimizing) return;

    if ((user.tokens || 0) < 10) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: "⚠️ Jetons insuffisants (10 requis pour la génération).",
        isError: true
      }]);
      handleRechargeClick();
      return;
    }

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      image: previewUrl,
      settings: { aspectRatio, language }
    };
    
    const dataToProcess = {
      prompt,
      image: cloudinaryUrl,
      aspectRatio,
      language
    };
    setPendingData(dataToProcess);

    setMessages(prev => [...prev, userMsg, {
      id: Date.now() + 1,
      type: 'bot',
      content: `Voulez-vous vraiment générer la vidéo pour ce prompt : "${prompt}" ?\n\nCoût de la génération : 10 jetons.`,
      image: cloudinaryUrl,
      isConfirmation: true
    }]);

    setPrompt('');
    setImageFile(null);
    setPreviewUrl('');
    setCloudinaryUrl('');
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    setMessages(prev => prev.map(msg => 
      msg.isConfirmation ? { ...msg, isConfirmation: false, content: "Confirmation reçue. Génération en cours..." } : msg
    ));

    setLoading(true);
    const { prompt: apiPrompt, image: apiImage, aspectRatio: apiRatio, language: apiLang } = pendingData;

    try {
      let response;
      if (apiImage) {
        response = await api.post('/video/generate', {
          prompt: apiPrompt,
          duration: '8',
          aspectRatio: apiRatio,
          language: apiLang,
          imageUrl: apiImage
        });
      } else {
        const formData = new FormData();
        formData.append('prompt', apiPrompt);
        formData.append('duration', '8');
        formData.append('aspectRatio', apiRatio);
        formData.append('language', apiLang);
        response = await api.post('/video/generate', formData);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        videoUrl: response.data.url,
        content: "Opération terminée avec succès. Voici votre création."
      }]);

      if (response.data.tokens_remaining !== undefined) {
        const updatedUser = { ...user, tokens: response.data.tokens_remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "Une erreur critique est survenue lors de la génération.",
        isError: true
      }]);
    } finally {
      setLoading(false);
      setPendingData(null);
    }
  };

  const handleCancel = () => {
    setMessages(prev => prev.map(msg => 
      msg.isConfirmation ? { ...msg, isConfirmation: false, content: "Génération annulée." } : msg
    ));
    setPendingData(null);
  };

  const handleRechargeClick = async () => {
    setPaymentLoading(true);
    try {
      const response = await api.get('/payment/packages');
      setPackages(response.data);
      setShowModal(true);
    } catch (err) {
      alert("Erreur offres.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBuyPackage = async (packageId) => {
    setPaymentLoading(true);
    try {
      const response = await api.post('/payment/create-session', { packageId, email: user.email });
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) {
      setPaymentLoading(false);
    }
  };

  const handleClearHistory = () => {
    setShowClearHistoryModal(true);
  };

  const confirmClearHistory = () => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: "Bienvenue dans le Studio Créatif. 👋 \n\nJe suis prêt à donner vie à vos idées. Décrivez votre concept, envoyez une photo de référence si vous le souhaitez, et je génère votre vidéo 8k haute performance.",
    }]);
    localStorage.removeItem('chat_history');
    setPendingData(null);
    setShowClearHistoryModal(false);
  };

  return (
    <div className="dashboard-wrapper chat-mode-wrapper">
      <style>{`
        @media (max-width: 768px) {
          .chat-input-area {
            padding: 8px 10px !important;
          }
          .chat-options-bar {
            margin-bottom: 6px !important;
            gap: 5px !important;
            overflow-x: auto;
            padding-bottom: 2px;
          }
          .chat-options-bar::-webkit-scrollbar {
            display: none;
          }
          .chat-option-select, .chat-options-bar button {
            font-size: 11px !important;
            padding: 4px 8px !important;
            height: 28px !important;
            white-space: nowrap;
          }
          .chat-option-badge {
            display: none !important;
          }
          .chat-textarea {
            height: 40px !important;
            min-height: 40px !important;
            padding: 8px 10px !important;
            font-size: 14px !important;
          }
          .btn-send-chat, .btn-upload-icon {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
          }
          .chat-messages {
            padding-bottom: 120px !important;
          }
        }
      `}</style>
      <div className="chat-header-simple glass reveal">
        <div className="chat-header-info">
          <div className="bot-avatar"><Sparkles size={20} color="#fff" /></div>
          <div>
            <h3>Studio Creative Engine</h3>
            <div className="chat-status">
              <span className="status-dot"></span>
              <small>Optimisé par VEO3 • {user.tokens || 0} jetons</small>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-add-token-small" 
            onClick={handleClearHistory} 
            style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
            title="Effacer l'historique"
          >
            <Trash2 size={16} />
          </button>
          <button className="btn-add-token-small" onClick={handleRechargeClick}><Zap size={14} fill="currentColor" /></button>
        </div>
      </div>

      <div className="chat-messages" onScroll={handleScroll}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type} reveal`}>
            <div className="message-avatar">
              {msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`message-content ${msg.isError ? 'error-msg' : ''} glass`}>
              {msg.image && (
                <div className="message-image-attachment">
                  <img src={msg.image} alt="Reference" />
                </div>
              )}
              {msg.content && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  {msg.isProcessing && (
                    <Loader2 size={18} className="animate-spin" style={{ marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              )}
              {msg.isConfirmation && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleConfirm}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', borderRadius: '8px', border: 'none',
                      background: 'var(--accent)', color: 'white', cursor: 'pointer'
                    }}
                  >
                    <CheckCircle2 size={16} /> Confirmer
                  </button>
                  <button 
                    onClick={handleCancel}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', cursor: 'pointer'
                    }}
                  >
                    <X size={16} /> Annuler
                  </button>
                </div>
              )}
              {msg.videoUrl && (
                <div className="message-video-attachment">
                  <video controls src={msg.videoUrl} autoPlay muted loop playsInline />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <a href={msg.videoUrl} download={`ralpai-video-${msg.id}.mp4`} className="download-link-apple">
                      <Download size={14} style={{ marginRight: '6px' }} />
                      Enregistrer
                    </a>
                    {!msg.isMerged && (
                      <button 
                        onClick={() => handleExtendVideo(msg.videoUrl)}
                        className="download-link-apple"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          cursor: 'pointer',
                          color: 'inherit',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}
                      >
                        <Film size={14} style={{ marginRight: '6px' }} />
                        Générer une suite
                      </button>
                    )}
                  </div>
                </div>
              )}
              {msg.isMergeConfirmation && (
                <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ordre de fusion :</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    {mergeList.map((video, idx) => (
                      <div key={video.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', 
                        background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '8px' 
                      }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{idx + 1}</span>
                        <video src={video.videoUrl} controls style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#000' }} />
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          Scène {idx + 1}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => moveVideo(idx, 'up')} disabled={idx === 0} style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>
                            <ArrowUp size={14} />
                          </button>
                          <button onClick={() => moveVideo(idx, 'down')} disabled={idx === mergeList.length - 1} style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', opacity: idx === mergeList.length - 1 ? 0.3 : 1 }}>
                            <ArrowDown size={14} />
                          </button>
                          <button onClick={() => removeVideoFromMerge(idx)} style={{ padding: '4px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {mergeList.length < 2 && <div style={{textAlign: 'center', padding: '10px', color: '#ef4444', fontSize: '0.8rem'}}>Sélectionnez au moins 2 vidéos</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={executeMerge}
                    disabled={mergeList.length < 2}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', borderRadius: '8px', border: 'none',
                      background: mergeList.length < 2 ? 'gray' : '#ec4899', color: 'white', 
                      cursor: mergeList.length < 2 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <CheckCircle2 size={16} /> Fusionner
                  </button>
                  <button 
                    onClick={cancelMerge}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', cursor: 'pointer'
                    }}
                  >
                    <X size={16} /> Annuler
                  </button>
                  </div>
                </div>
              )}
              {msg.settings && (
                <div className="message-meta">
                  <span>{msg.settings.aspectRatio === 'pc' ? <Monitor size={12} /> : <Smartphone size={12} />} {msg.settings.aspectRatio === 'pc' ? '16:9' : '9:16'}</span>
                  <span><Globe size={12} /> {msg.settings.language.toUpperCase()}</span>
                  <span><Clock size={12} /> 8s</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {(loading || optimizing) && (
          <div className="message bot reveal">
            <div className="message-avatar"><Bot size={20} /></div>
            <div className="message-content loading-bubble glass">
              <Loader2 size={18} className="animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area glass reveal">
        {previewUrl && (
          <div className="input-image-preview">
            <img src={previewUrl} alt="Preview" />
            <button onClick={handleRemoveImage} className="btn-remove-img"><X size={12} /></button>
          </div>
        )}

        <div className="chat-options-bar">
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="chat-option-select">
            <option value="pc">Paysage (16:9)</option>
            <option value="mobile">Portrait (9:16)</option>
          </select>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="chat-option-select">
            <option value="fr">Français (FR)</option>
            <option value="en">English (EN)</option>
            <option value="es">Español (ES)</option>
          </select>
          <button 
            type="button"
            onClick={handleOptimizePrompt}
            disabled={optimizing || !prompt.trim()}
            style={{
              background: '#8A2BE2',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              opacity: (!prompt.trim() || optimizing) ? 0.5 : 1
            }}
          >
            <Zap size={14} fill="currentColor" />
            {optimizing ? 'Optimisation...' : 'Améliorer le prompt'}
          </button>
          <div className="chat-option-badge">8s High Fidelity</div>
          {generatedVideos.length > 1 && (
            <button 
              type="button"
              onClick={handleMergeVideos}
              disabled={merging}
              style={{
                background: '#ec4899',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: merging ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginLeft: 'auto',
                opacity: merging ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)'
              }}
            >
              {merging ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Fusion... {mergeProgress > 0 && `${mergeProgress}%`}
                </>
              ) : (
                <>
                  <Layers size={14} />
                  Fusionner
                </>
              )}
            </button>
          )}
        </div>

        <form onSubmit={handleChatSubmit} className="chat-input-row lower-input">
          <label className="btn-upload-icon">
            <ImageIcon size={20} />
            <input type="file" accept=".jpg, .jpeg" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={uploadingImage ? "Traitement image..." : "Expliquez votre vision..."}
            className="chat-textarea"
            rows="3"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
              }
            }}
          />
          <button type="submit" className="btn-send-chat" disabled={loading || uploadingImage || optimizing || (!prompt.trim() && !cloudinaryUrl)}>
            <Send size={18} />
          </button>
        </form>
      </div>

      {showModal && (
        <div className="modal-overlay reveal">
          <div className="modal-content glass reveal">
            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h2 className="modal-title">Propulsez vos projets</h2>
              <p className="modal-subtitle">Plus de jetons pour une créativité sans limites</p>
            </div>
            <div className="packages-grid">
              {packages.map((pkg, index) => (
                <div key={pkg.id} className={`package-card reveal ${index === 1 ? 'popular' : ''}`}>
                  {index === 1 && <div className="popular-badge"><Trophy size={12} style={{ marginRight: '4px' }} /> Recommandé</div>}
                  <h3 className="package-name">{pkg.name}</h3>
                  <div className="package-price">{(pkg.price / 100).toFixed(2)}€</div>
                  <div className="package-tokens"><Zap size={18} fill="currentColor" /> {pkg.tokens} Jetons</div>
                  <button className="btn-package-select" onClick={() => handleBuyPackage(pkg.id)} disabled={paymentLoading}>Choisir</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showClearHistoryModal && (
        <div className="modal-overlay reveal" style={{ zIndex: 2000 }}>
          <div className="modal-content glass reveal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'center', marginBottom: '10px' }}>
              <h2 className="modal-title">Effacer l'historique ?</h2>
            </div>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Voulez-vous vraiment supprimer l'historique de chat ?<br/><br/>
              <small style={{ opacity: 0.8 }}>Note : Ce chat est stocké localement et n'est visible sur aucun autre appareil.</small>
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-apple-secondary w-full" 
                onClick={() => setShowClearHistoryModal(false)}
                style={{ justifyContent: 'center' }}
              >
                Annuler
              </button>
              <button 
                className="btn-apple-primary w-full" 
                onClick={confirmClearHistory}
                style={{ justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateVideo;