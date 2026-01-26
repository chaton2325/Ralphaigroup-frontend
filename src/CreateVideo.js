import React, { useState, useEffect, useRef } from 'react';
import api from './services/api';

function CreateVideo({ onNavigate }) {
  // --- States existants conservés ---
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  // Options par défaut
  const [aspectRatio, setAspectRatio] = useState('pc');
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // --- Nouveaux States pour le Chat ---
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialisation du message de bienvenue
  useEffect(() => {
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: "Salut ! 👋 Je suis l'IA créative de Ralp-AI. \n\nDécrivez votre idée, choisissez le format et la langue ci-dessous, et je génère votre vidéo (8s) instantanément.",
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, previewUrl]);

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setCloudinaryUrl('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation : Uniquement JPG et JPEG
      if (file.type !== 'image/jpeg') {
        setError("Format invalide. Seules les images JPG et JPEG sont autorisées.");
        setImageFile(null);
        setPreviewUrl('');
        setCloudinaryUrl('');
        return;
      }
      setError('');
      
      setImageFile(file);
      setUploadingImage(true);
      
      // On attend l'upload pour afficher la prévisualisation (lien Cloudinary)
      setPreviewUrl('');
      setCloudinaryUrl('');

      try {
        const formDataImage = new FormData();
        formDataImage.append('file', file);

        const uploadRes = await fetch('https://service.ralp-ai.site/upload', {
          method: 'POST',
          body: formDataImage
        });

        if (!uploadRes.ok) throw new Error("Erreur lors de l'upload de l'image vers le serveur.");
        
        const uploadData = await uploadRes.json();
        const publicImageUrl = uploadData.url;

        if (!publicImageUrl) {
          throw new Error("L'URL de l'image est manquante dans la réponse du serveur.");
        }
        
        // Ajout d'un timestamp pour éviter le cache navigateur
        setPreviewUrl(`${publicImageUrl}?t=${Date.now()}`);
        setCloudinaryUrl(publicImageUrl);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de l'upload. Vérifiez que le serveur (port 5000) autorise CORS.");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handlePromptChange = (e) => {
    const text = e.target.value;
    setPrompt(text);
  };

  // Gestion de l'envoi du message (Génération)
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if ((!prompt.trim() && !cloudinaryUrl) || uploadingImage || loading) return;

    // Vérification des jetons
    if ((user.tokens || 0) < 10) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'bot', 
        content: "⚠️ Vous n'avez pas assez de jetons (10 requis). Veuillez recharger votre compte.",
        isError: true 
      }]);
      handleRechargeClick();
      return;
    }

    // 1. Ajouter le message de l'utilisateur
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      image: previewUrl,
      settings: { aspectRatio, language }
    };
    setMessages(prev => [...prev, userMsg]);

    // Sauvegarde des valeurs pour l'appel API
    const apiPrompt = prompt;
    const apiImage = cloudinaryUrl;
    const apiRatio = aspectRatio;
    const apiLang = language;

    // Reset de l'input
    setPrompt('');
    setImageFile(null);
    setPreviewUrl('');
    setCloudinaryUrl('');
    setLoading(true);
    setError('');

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

      // 2. Ajouter la réponse du bot (Vidéo)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        videoUrl: response.data.url,
        content: "Voici votre vidéo ! 🎉"
      }]);

      // Mise à jour des jetons utilisateur si renvoyés par l'API
      if (response.data.tokens_remaining !== undefined) {
        const updatedUser = { ...user, tokens: response.data.tokens_remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: err.response?.data?.message || "Une erreur est survenue lors de la génération.",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRechargeClick = async () => {
    setPaymentLoading(true);
    try {
      const response = await api.get('/payment/packages');
      setPackages(response.data);
      setShowModal(true);
    } catch (err) {
      alert("Impossible de charger les offres pour le moment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBuyPackage = async (packageId) => {
    setPaymentLoading(true);
    try {
      const response = await api.post('/payment/create-session', { packageId, email: user.email });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'initialisation du paiement.");
      setPaymentLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper chat-mode-wrapper">
      {/* Header Chat Simplifié */}
      <div className="chat-header-simple">
        <div className="chat-header-info">
          <div className="bot-avatar">🤖</div>
          <div>
            <h3>Assistant Vidéo</h3>
            <span className="status-dot"></span> <small>En ligne • {user.tokens || 0} crédits</small>
          </div>
        </div>
        <button className="btn-add-token-small" onClick={handleRechargeClick}>+</button>
      </div>

      {/* Zone de Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-avatar">
              {msg.type === 'bot' ? '🤖' : <div className="user-avatar-placeholder">👤</div>}
            </div>
            <div className={`message-content ${msg.isError ? 'error-msg' : ''}`}>
              {msg.image && (
                <div className="message-image-attachment">
                  <img src={msg.image} alt="Reference" />
                </div>
              )}
              
              {msg.content && <div style={{whiteSpace: 'pre-wrap'}}>{msg.content}</div>}
              
              {msg.videoUrl && (
                <div className="message-video-attachment">
                  <video controls src={msg.videoUrl} autoPlay muted loop playsInline />
                  <a href={msg.videoUrl} download className="download-link">⬇️ Télécharger</a>
                </div>
              )}

              {msg.settings && (
                <div className="message-meta">
                  <span>{msg.settings.aspectRatio === 'pc' ? '📺 16:9' : '📱 9:16'}</span>
                  <span>{msg.settings.language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
                  <span>⏱️ 8s</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content loading-bubble">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de Saisie (Input Area) */}
      <div className="chat-input-area">
        {/* Prévisualisation Image Uploadée */}
        {previewUrl && (
          <div className="input-image-preview">
            <img src={previewUrl} alt="Preview" />
            <button onClick={handleRemoveImage} className="btn-remove-img">×</button>
          </div>
        )}

        {/* Barre d'options */}
        <div className="chat-options-bar">
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="chat-option-select">
            <option value="pc">📺 Paysage (16:9)</option>
            <option value="mobile">📱 Portrait (9:16)</option>
          </select>
          
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="chat-option-select">
            <option value="fr">🇫🇷 FR</option>
            <option value="en">🇬🇧 EN</option>
            <option value="es">🇪🇸 ES</option>
          </select>

          <div className="chat-option-badge">⏱️ 8s</div>
        </div>

        {/* Formulaire d'envoi */}
        <form onSubmit={handleChatSubmit} className="chat-input-row">
          <label className="btn-upload-icon" title="Ajouter une image">
            📷
            <input 
              type="file" 
              accept=".jpg, .jpeg" 
              onChange={handleImageChange} 
              style={{display: 'none'}}
            />
          </label>

          <textarea 
            value={prompt} 
            onChange={handlePromptChange} 
            placeholder={uploadingImage ? "Upload en cours..." : "Décrivez votre vidéo..."}
            className="chat-textarea"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit(e);
              }
            }}
          />
          
          <button type="submit" className="btn-send-chat" disabled={loading || uploadingImage || (!prompt.trim() && !cloudinaryUrl)}>
            ➤
          </button>
        </form>
      </div>

      {/* Modal Paiement (inchangé) */}
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
                  <button className="btn-package-select" onClick={() => handleBuyPackage(pkg.id)} disabled={paymentLoading}>
                    {paymentLoading ? '...' : 'Choisir ce pack'}
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

export default CreateVideo;