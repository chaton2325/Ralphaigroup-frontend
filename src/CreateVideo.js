import React, { useState } from 'react';
import api from './services/api';

function CreateVideo({ onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState('pc');
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

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

        const uploadRes = await fetch('http://127.0.0.1:5000/upload', {
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
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount <= 300) {
      setPrompt(text);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadingImage) return;

    setLoading(true);
    setError('');
    setGeneratedVideo(null);

    try {
      let response;

      if (cloudinaryUrl) {
        // 2. Envoi JSON avec l'URL de l'image (Format API n°16)
        response = await api.post('/video/generate', {
          prompt,
          duration: '8',
          aspectRatio,
          language,
          imageUrl: cloudinaryUrl
        });
      } else if (imageFile) {
        throw new Error("L'image n'a pas été uploadée correctement. Veuillez réessayer.");
      } else {
        // Cas sans image : FormData (Format API n°15)
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('duration', '8');
        formData.append('aspectRatio', aspectRatio);
        formData.append('language', language);
        response = await api.post('/video/generate', formData);
      }

      setGeneratedVideo(response.data.url);

      // Mise à jour des jetons utilisateur si renvoyés par l'API
      if (response.data.tokens_remaining !== undefined) {
        const updatedUser = { ...user, tokens: response.data.tokens_remaining };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de la génération de la vidéo.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = prompt.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>Nouvelle Création</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Décrivez votre idée et laissez l'IA générer la vidéo.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className="token-badge">
             <span>{user.tokens || 0} Crédits</span>
             <button className="btn-add-token" onClick={() => onNavigate('dashboard')} title="Recharger">+</button>
          </div>
          <small style={{ color: 'var(--text-muted)' }}>Coût : 10 jetons / vidéo</small>
        </div>
        <button className="btn btn-login" onClick={() => onNavigate('dashboard')}>Retour</button>
      </div>

      <div className="create-container">
        <form onSubmit={handleSubmit} className="create-form">
          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }}>Description de la vidéo (Prompt)</label>
              <span style={{ fontSize: '0.85rem', color: wordCount >= 300 ? 'red' : 'var(--text-muted)' }}>{wordCount}/300 mots</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#2563eb', marginBottom: '0.8rem', background: '#eff6ff', padding: '0.5rem', borderRadius: '6px' }}>
              💡 Conseil : Soyez descriptif au maximum ! Détaillez l'ambiance, l'éclairage, les mouvements et le style visuel pour un meilleur résultat. Si vous utilisez une image décrivez a quoi elle va servir dans la vidéo et ne dépassez pas les 300 mots
            </p>
            <textarea 
              value={prompt} 
              onChange={handlePromptChange} 
              placeholder="Ex: Une publicité futuriste pour une boisson énergisante..." 
              rows="4"
              required
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Image de référence (Importer)</label>
              <input 
                type="file" 
                accept=".jpg, .jpeg" 
                onChange={handleImageChange} 
                key={previewUrl ? 'loaded' : 'empty'}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
              />
              <small style={{ color: 'var(--text-muted)' }}>L'image sera uploadée pour générer un lien public.</small>
              <small style={{ color: '#ef4444', display: 'block', marginTop: '0.2rem' }}>⚠️ Uniquement JPG ou JPEG.</small>
              {previewUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <img 
                      src={previewUrl} 
                      alt="Prévisualisation" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={() => setError("Impossible de charger l'image depuis le lien généré.")}
                    />
                  </div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#6b7280', wordBreak: 'break-all' }}>
                    Lien : {cloudinaryUrl}
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    style={{ 
                      marginTop: '0.5rem', 
                      background: '#fee2e2', 
                      color: '#ef4444', 
                      border: 'none', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            <div className="form-group" style={{ width: '150px' }}>
              <label>Format</label>
              <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <option value="pc">Paysage (16:9)</option>
                <option value="mobile">Portrait (9:16)</option>
              </select>
            </div>

            <div className="form-group" style={{ width: '150px' }}>
              <label>Durée</label>
              <input type="text" value="8 secondes" disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f3f4f6', color: '#6b7280' }} />
            </div>

            <div className="form-group" style={{ width: '150px' }}>
              <label>Langue</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-signup" disabled={loading || uploadingImage} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: (loading || uploadingImage) ? 0.7 : 1 }}>
            {loading ? 'Génération en cours...' : 'Générer la vidéo'}
          </button>
        </form>

        {generatedVideo && (
          <div className="result-container">
            <h3>Résultat</h3>
            <div className="video-wrapper" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <video controls src={generatedVideo} width="100%" height="100%" autoPlay />
            </div>
            <a href={generatedVideo} download className="btn btn-login" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Télécharger la vidéo</a>
          </div>
        )}
      </div>

      {loading && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Création de la vidéo en cours...</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Ne quittez pas s'il vous plaît.</p>
            <div style={{ marginTop: '1rem', fontSize: '3rem' }}>⏳</div>
          </div>
        </div>
      )}

      {uploadingImage && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upload de l'image en cours...</h3>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Veuillez patienter pendant le transfert vers le serveur.</p>
            <div style={{ marginTop: '1rem', fontSize: '3rem' }}>📤</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateVideo;