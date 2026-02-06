import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Video,
  CheckCircle2,
  Download,
  Trash2,
  Zap,
  Trophy,
  X
} from 'lucide-react';
import api from './services/api';

function AdGenerator({ onNavigate }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ad_chat_history');
    return saved ? JSON.parse(saved) : [{
      id: 'welcome',
      type: 'bot',
      content: "Bonjour ! Je suis votre expert en publicité vidéo. 👋\n\nPour commencer, quel est le nom du produit que vous souhaitez mettre en avant ?"
    }];
  });
  const [input, setInput] = useState('');
  const [step, setStep] = useState(() => parseInt(localStorage.getItem('ad_step') || '0')); // 0: Name, 1: Desire, 2: Points, 3: Image, 4: Price, 5: Language
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('ad_form_data');
    return saved ? JSON.parse(saved) : {
      productName: '',
      desire: '',
      keyPoints: '',
      image: null,
      imageBase64: null,
      imageName: null,
      price: '',
      language: ''
    };
  });
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [savedSuggestions, setSavedSuggestions] = useState([]);
  const [pendingSuggestion, setPendingSuggestion] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, suggestions]);

  useEffect(() => {
    localStorage.setItem('ad_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ad_step', step.toString());
    // On ne sauvegarde pas l'objet File dans localStorage, mais on garde le reste et le base64
    const dataToSave = { ...formData, image: null };
    localStorage.setItem('ad_form_data', JSON.stringify(dataToSave));
  }, [step, formData]);

  const handleClearHistory = () => {
    localStorage.removeItem('ad_chat_history');
    localStorage.removeItem('ad_step');
    localStorage.removeItem('ad_form_data');
    setMessages([{
      id: 'welcome',
      type: 'bot',
      content: "Bonjour ! Je suis votre expert en publicité vidéo. 👋\n\nPour commencer, quel est le nom du produit que vous souhaitez mettre en avant ?"
    }]);
    setStep(0);
    setFormData({ productName: '', desire: '', keyPoints: '', image: null, imageBase64: null, imageName: null, price: '', language: '' });
    setSuggestions([]);
  };

  // Gestion de la récupération en arrière-plan
  useEffect(() => {
    let interval;
    const checkBackgroundGeneration = async () => {
      const pending = localStorage.getItem('ad_pending_generation');
      if (!pending || loading) return;

      try {
        const { timestamp } = JSON.parse(pending);
        // Si plus de 10 minutes, on abandonne
        if (Date.now() - timestamp > 600000) {
          localStorage.removeItem('ad_pending_generation');
          setMessages(prev => prev.map(m => m.isProcessing ? { ...m, isProcessing: false, content: "Le traitement a pris trop de temps ou a échoué.", isError: true } : m));
          return;
        }

        const response = await api.get('/video/history');
        const history = response.data.history || [];
        // On cherche une vidéo créée après le début de la génération
        const match = history.find(v => new Date(v.created_at).getTime() > timestamp);

        if (match) {
          setMessages(prev => {
            const clean = prev.map(m => m.isProcessing ? { ...m, isProcessing: false, content: "Génération terminée en arrière-plan." } : m);
            if (!clean.some(m => m.videoUrl === match.video_url)) {
                clean.push({
                    id: Date.now(),
                    type: 'bot',
                    content: "Voici votre vidéo (récupérée) :",
                    videoUrl: match.video_url
                });
            }
            return clean;
          });
          localStorage.removeItem('ad_pending_generation');
        }
      } catch (e) {
        console.error("Erreur vérification background", e);
      }
    };

    if (localStorage.getItem('ad_pending_generation')) {
      checkBackgroundGeneration();
      interval = setInterval(checkBackgroundGeneration, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleRechargeClick = async () => {
    setPaymentLoading(true);
    try {
      const response = await api.get('/payment/packages');
      setPackages(response.data);
      setShowModal(true);
    } catch (err) {
      alert("Erreur chargement offres.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleBuyPackage = async (packageId) => {
    setPaymentLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const response = await api.post('/payment/create-session', { packageId, email: user.email });
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) {
      setPaymentLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && step !== 3) return;

    const userText = input.trim();
    setInput('');

    // Ajout message utilisateur
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: userText }]);

    let nextStep = step + 1;
    let botResponse = '';
    let nextFormData = { ...formData };

    switch (step) {
      case 0: // Nom -> Envie
        nextFormData.productName = userText;
        botResponse = "Noté. Quelle émotion ou envie souhaitez-vous susciter chez votre audience ? (ex: Luxe, Rapidité, Confort...)";
        break;
      case 1: // Envie -> Points clés
        nextFormData.desire = userText;
        botResponse = "Très bien. Quels sont les points clés ou fonctionnalités principales à mettre en avant ?";
        break;
      case 2: // Points clés -> Image
        nextFormData.keyPoints = userText;
        botResponse = "Parfait. Veuillez maintenant télécharger une image de votre produit en cliquant sur l'icône image ci-dessous.";
        break;
      case 3: // Image (si texte entré au lieu d'image)
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: "J'ai besoin d'une image pour continuer. Utilisez l'icône 🖼️ à gauche du champ de texte." }]);
        return;
      case 4: // Prix -> Langue
        nextFormData.price = userText;
        botResponse = "C'est noté. Dans quelle langue souhaitez-vous la publicité ?";
        break;
      default:
        return;
    }

    setFormData(nextFormData);
    setStep(nextStep);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: botResponse }]);
    }, 500);
  };

  const handleLanguageSelect = async (lang) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: lang }]);
    const nextFormData = { ...formData, language: lang };
    setFormData(nextFormData);
    setStep(6);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: "Analyse en cours... Je génère des concepts publicitaires optimisés pour votre produit.", isProcessing: true }]);
    
    await fetchAdSuggestions(nextFormData);
  };

  const handleSkipPrice = () => {
    const userText = "Non spécifié";
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: "Ignorer le prix" }]);
    
    const nextFormData = { ...formData, price: userText };
    setFormData(nextFormData);
    setStep(5);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: "C'est noté. Dans quelle langue souhaitez-vous la publicité ?" }]);
    }, 500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (step !== 3) {
      alert("Veuillez suivre les étapes de la conversation.");
      return;
    }

    // Génération d'un nom unique
    const ext = file.name.split('.').pop();
    const uniqueName = `product_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const newFile = new File([file], uniqueName, { type: file.type });

    // Conversion en base64 pour la persistance et l'affichage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setFormData(prev => ({ ...prev, image: newFile, imageBase64: base64, imageName: uniqueName }));
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: "Image envoyée", image: base64 }]);
      setStep(4);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: "Image reçue ! Quel est le prix du produit (ou une gamme de prix) ?" }]);
      }, 500);
    };
    reader.readAsDataURL(newFile);
  };

  const getRestoredImageFile = (data) => {
    if (data.image instanceof File) return data.image;
    if (data.imageBase64) {
      const arr = data.imageBase64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], data.imageName || 'restored_image.jpg', { type: mime });
    }
    return null;
  };

  const fetchAdSuggestions = async (data) => {
    setLoading(true);
    try {
      const promptText = `Nom du produit: ${data.productName}. Envie: ${data.desire}. Points clés: ${data.keyPoints}. Prix: ${data.price}. Langue: ${data.language}.`;
      const formDataApi = new FormData();
      formDataApi.append('image', getRestoredImageFile(data));
      formDataApi.append('prompt', promptText);

      const response = await fetch('https://service.ralp-ai.site/optimize-ad-product', {
        method: 'POST',
        body: formDataApi
      });

      if (!response.ok) throw new Error('Erreur API');
      const result = await response.json();
      
      setSuggestions(result.ad_suggestions || []);
      
      setMessages(prev => prev.map(m => m.isProcessing ? { ...m, isProcessing: false, content: "Analyse terminée ! Voici 5 concepts publicitaires. Cliquez sur celui que vous préférez pour générer la vidéo." } : m));

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => m.isProcessing ? { ...m, isProcessing: false, content: "Une erreur est survenue lors de l'analyse.", isError: true } : m));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async (suggestion) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if ((user.tokens || 0) < 10) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        content: "⚠️ Jetons insuffisants (10 requis).",
        isError: true
      }]);
      handleRechargeClick();
      return;
    }

    setPendingSuggestion(suggestion);
    setSavedSuggestions(suggestions);
    setSuggestions([]); // Masquer les suggestions temporairement
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content: `Vous avez choisi le concept : "${suggestion}"\n\nConfirmez-vous la génération ? (Coût : 10 jetons)`,
      isConfirmation: true
    }]);
  };

  const handleConfirmGeneration = async () => {
    if (!pendingSuggestion) return;
    const suggestion = pendingSuggestion;
    setPendingSuggestion(null);
    
    setMessages(prev => prev.map(msg => 
      msg.isConfirmation ? { ...msg, isConfirmation: false, content: `Concept validé. Lancement de la production...` } : msg
    ));

    setLoading(true);
    const msgId = Date.now();
    localStorage.setItem('ad_pending_generation', JSON.stringify({ timestamp: Date.now() }));

    setMessages(prev => [...prev, {
      id: msgId,
      type: 'bot',
      content: `Excellent choix ! Téléchargement de l'image et lancement de la production...`,
      isProcessing: true
    }]);

    try {
      // 1. Upload Image to get URL for video generation
      const formDataUpload = new FormData();
      formDataUpload.append('file', getRestoredImageFile(formData));
      const uploadRes = await fetch('https://service.ralp-ai.site/upload', { method: 'POST', body: formDataUpload });
      if (!uploadRes.ok) throw new Error('Erreur upload');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: `Image prête. Génération de la vidéo en cours...` } : m));

      // 2. Generate Video
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const genRes = await api.post('/video/generate', {
        prompt: suggestion,
        duration: '8',
        aspectRatio: 'pc',
        language: formData.language.substring(0, 2).toLowerCase() || 'fr',
        imageUrl: imageUrl
      });

      if (genRes.data.tokens_remaining !== undefined) {
        const updatedUser = { ...user, tokens: genRes.data.tokens_remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      localStorage.removeItem('ad_pending_generation');
      setMessages(prev => prev.map(m => m.id === msgId ? { 
        ...m, 
        isProcessing: false, 
        content: "Vidéo générée avec succès !", 
        videoUrl: genRes.data.url 
      } : m));

    } catch (err) {
      console.error(err);
      localStorage.removeItem('ad_pending_generation');
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isProcessing: false, content: "Erreur lors de la génération de la vidéo.", isError: true } : m));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGeneration = () => {
    setPendingSuggestion(null);
    setSuggestions(savedSuggestions); // Restaurer les suggestions
    setMessages(prev => prev.map(msg => 
      msg.isConfirmation ? { ...msg, isConfirmation: false, content: "Génération annulée." } : msg
    ));
  };

  return (
    <div className="dashboard-wrapper chat-mode-wrapper">
      <div className="chat-header-simple glass reveal">
        <div className="chat-header-info">
          <div className="bot-avatar" style={{ background: '#ec4899' }}><Sparkles size={20} color="#fff" /></div>
          <div><h3>Générateur Publicité</h3><div className="chat-status"><span className="status-dot"></span><small>Assistant Marketing IA</small></div></div>
        </div>
        <button className="btn-add-token-small" onClick={handleClearHistory} style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }} title="Effacer la conversation">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type} reveal`}>
            <div className="message-avatar">{msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />}</div>
            <div className={`message-content ${msg.isError ? 'error-msg' : ''} glass`}>
              {msg.image && <div className="message-image-attachment"><img src={msg.image} alt="Product" /></div>}
              {msg.isProcessing && <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px', display: 'inline-block' }} />}
              {msg.content}
              {msg.videoUrl && (
                <div className="message-video-attachment">
                  <video controls src={msg.videoUrl} autoPlay muted loop playsInline />
                  <a href={msg.videoUrl} download className="download-link-apple"><Download size={14} style={{ marginRight: '6px' }} /> Enregistrer</a>
                </div>
              )}
              {msg.isConfirmation && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button onClick={handleConfirmGeneration} className="btn-apple-primary sm" style={{ background: '#ec4899', color: 'white', border: 'none' }}><CheckCircle2 size={16} style={{ marginRight: '6px' }} /> Confirmer (10 jetons)</button>
                  <button onClick={handleCancelGeneration} className="btn-apple-secondary sm"><X size={16} style={{ marginRight: '6px' }} /> Annuler</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {suggestions.length > 0 && (
          <div className="message bot reveal">
            <div className="message-avatar"><Bot size={20} /></div>
            <div className="message-content glass" style={{ width: '100%' }}>
              <p style={{ marginBottom: '15px', fontWeight: '600' }}>Sélectionnez un concept :</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {suggestions.map((sugg, idx) => (
                  <button key={idx} onClick={() => handleGenerateVideo(sugg)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                    <div style={{ display: 'flex', gap: '10px' }}><div style={{ minWidth: '24px', height: '24px', background: '#ec4899', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{idx + 1}</div><div>{sugg}</div></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area glass reveal">
        {step === 5 ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', padding: '10px' }}>
            <button onClick={() => handleLanguageSelect('Français')} className="btn-apple-secondary" style={{ minWidth: '120px' }}>Français 🇫🇷</button>
            <button onClick={() => handleLanguageSelect('English')} className="btn-apple-secondary" style={{ minWidth: '120px' }}>English 🇬🇧</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="chat-input-row lower-input">
            <label className="btn-upload-icon" style={{ opacity: step === 3 ? 1 : 0.3, cursor: step === 3 ? 'pointer' : 'not-allowed' }}>
              <ImageIcon size={20} />
              <input type="file" accept=".jpg, .jpeg, .png" onChange={handleImageUpload} disabled={step !== 3} style={{ display: 'none' }} />
            </label>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={step === 3 ? "Téléchargez une image..." : "Écrivez votre réponse..."} className="chat-textarea" style={{ height: '40px', minHeight: 'auto' }} disabled={loading || step === 3} />
            {step === 4 && (
              <button type="button" onClick={handleSkipPrice} className="btn-apple-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', height: 'auto' }}>Ignorer</button>
            )}
            <button type="submit" className="btn-send-chat" disabled={loading || (!input.trim() && step !== 3)}><Send size={18} /></button>
          </form>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay reveal">
          <div className="modal-content glass reveal">
            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            <div className="modal-header">
              <h2 className="modal-title">Recharger vos jetons</h2>
              <p className="modal-subtitle">Propulsez vos publicités avec nos packs</p>
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

export default AdGenerator;