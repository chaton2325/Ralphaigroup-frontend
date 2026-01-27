import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles
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
  const [error, setError] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  return (
    <div className="dashboard-wrapper chat-mode-wrapper">
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
        <button className="btn-add-token-small" onClick={handleRechargeClick}><Zap size={14} fill="currentColor" /></button>
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
              {msg.content && <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>}
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
                  <a href={msg.videoUrl} download className="download-link-apple">
                    <Download size={14} style={{ marginRight: '6px' }} />
                    Enregistrer
                  </a>
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
    </div>
  );
}

export default CreateVideo;