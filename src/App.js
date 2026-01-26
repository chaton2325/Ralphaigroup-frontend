import React, { useState } from 'react';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Sidebar from './Sidebar';
import CreateVideo from './CreateVideo';

function App() {
  // État pour gérer la page affichée : 'home', 'login', ou 'signup'
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'home';
  });

  // Vérifie si on est sur une page connectée
  const isAuthPage = ['dashboard', 'projects', 'create'].includes(currentPage);

  // Fonction pour afficher le contenu selon la page active
  const renderContent = () => {
    switch (currentPage) {
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'signup':
        return <Signup onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'projects':
        return <Projects onNavigate={setCurrentPage} />;
      case 'create':
        return <CreateVideo onNavigate={setCurrentPage} />;
      default:
        return (
          <>
            <section className="hero">
              <h1>Générez des vidéos publicitaires et drôles</h1>
              <p>Notre technologie vous permet de créer des vidéos publicitaires, des contenus humoristiques et bien plus encore en quelques secondes.</p>
              <a href="#" className="btn btn-signup" onClick={(e) => {e.preventDefault(); setCurrentPage('signup')}} style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>Commencer gratuitement</a>
              
              <div style={{marginTop: '2.5rem'}}>
                <div className="veo-badge">
                    ✨ Propulsé par le moteur <strong>VEO3 AI</strong>
                </div>
              </div>
            </section>

            

            <section className="section">
              <div className="video-placeholder main-video">
                  <video controls width="100%" height="100%">
                      <source src="videos/demo-publicite.mp4" type="video/mp4" />
                      Votre navigateur ne supporte pas la balise vidéo.
                  </video>
              </div>
            </section>

            <div className="promo-section">
              <div className="promo-content">
                <div className="promo-badge">⚡ Offre Limitée</div>
                
                <h2 className="promo-title">Boostez votre créativité !</h2>
                
                <div className="offer-container">
                  <div className="main-offer">
                    <span className="token-count">20 Jetons</span>
                    <div className="price-wrap">
                      <span className="current-price">10€</span>
                      <span className="old-price">15€</span>
                    </div>
                  </div>
                  
                  <div className="bonus-offer">
                    + 5 Jetons OFFERTS 🎁
                  </div>
                </div>

                <div className="info-pill">
                  ℹ️ 1 Vidéo générée = 10 Jetons
                </div>
                
                <div style={{marginTop: '2rem'}}>
                  <button className="btn btn-signup" onClick={(e) => {e.preventDefault(); setCurrentPage('signup')}} style={{fontSize: '1.1rem', padding: '0.8rem 2rem', cursor: 'pointer'}}>
                    S'inscrire maintenant pour en profiter
                  </button>
                </div>
              </div>
            </div>

            <div style={{background: 'var(--bg-card)', padding: '4rem 5%', textAlign: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', width: '100%'}}>
              <h2 style={{fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>🌍 Support Multi-langue</h2>
              <p style={{fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto'}}>
                Générez vos contenus en <strong>Français 🇫🇷</strong> et en <strong>Anglais 🇬🇧</strong> pour toucher une audience internationale sans barrière de langue.
              </p>
            </div>

            <section className="section">
              <h2 style={{fontSize: '2.5rem', marginBottom: '3rem'}}>Comment créer vos vidéos ?</h2>
              
              <div className="tutorial-container">
                <div className="tutorial-steps">
                  <div className="step-item">
                    <div className="step-icon">✍️</div>
                    <div>
                      <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)'}}>1. Tapez votre prompt</h3>
                      <p style={{margin: 0, color: 'var(--text-muted)'}}>Décrivez simplement votre idée. Plus c'est détaillé, meilleur sera le résultat.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">📸</div>
                    <div>
                      <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)'}}>2. Ajoutez votre visage (Optionnel)</h3>
                      <p style={{margin: 0, color: 'var(--text-muted)'}}>Importez une photo pour personnaliser vos publicités ou incarner un personnage.</p>
                    </div>
                  </div>
                  <div className="step-item">
                    <div className="step-icon">🚀</div>
                    <div>
                      <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)'}}>3. Créez la vidéo</h3>
                      <p style={{margin: 0, color: 'var(--text-muted)'}}>L'IA génère votre contenu fluide et professionnel en quelques secondes.</p>
                    </div>
                  </div>
                </div>
                <div className="tutorial-video-wrapper">
                  <video src="videos/demo-publicite.mp4" autoPlay loop muted playsInline style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
              </div>
            </section>

            <section className="section">
              <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                  <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Tous les formats dont vous avez besoin</h2>
                  <p style={{color: 'var(--text-muted)', fontSize: '1.1rem'}}>Adaptez automatiquement vos contenus pour les réseaux sociaux ou le web.</p>
              </div>

              <div className="formats-grid">
                  <div className="format-card">
                      <div className="video-placeholder portrait-video">
                          <video controls width="100%" height="100%" style={{objectFit: 'cover'}}>
                              <source src="videos/demo-portrait.mp4" type="video/mp4" />
                              Votre navigateur ne supporte pas la balise vidéo.
                          </video>
                      </div>
                      
                      <h3>Format Portrait</h3>
                      <p style={{color: 'var(--text-muted)'}}>Idéal pour TikTok, Instagram Reels et Shorts.</p>
                  </div>

                  <div className="format-card">
                      <div className="video-placeholder landscape-video">
                          <video controls width="100%" height="100%">
                              <source src="videos/demo-paysage.mp4" type="video/mp4" />
                              Votre navigateur ne supporte pas la balise vidéo.
                          </video>
                      </div>
                      <h3>Format Paysage</h3>
                      <p style={{color: 'var(--text-muted)'}}>Parfait pour YouTube, LinkedIn et votre site web.</p>
                  </div>
              </div>
            </section>
          </>
        );
    }
  };

  // Layout pour les pages connectées (avec Sidebar)
  if (isAuthPage) {
    return (
      <div className="app-layout">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="main-content">
          {renderContent()}
          {currentPage !== 'create' && <Footer />}
        </div>

        {/* Navigation Mobile (Bottom Bar) - Visible uniquement sur mobile via CSS */}
        <nav className="mobile-nav">
          <button 
            className={`mobile-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Accueil</span>
          </button>
          
          <button 
            className={`mobile-nav-item ${currentPage === 'create' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('create')}
          >
            <div className="nav-icon-highlight">
              <span>+</span>
            </div>
            <span className="nav-label">Créer</span>
          </button>
          
          <button 
            className={`mobile-nav-item ${currentPage === 'projects' ? 'active' : ''}`} 
            onClick={() => setCurrentPage('projects')}
          >
            <span className="nav-icon">📁</span>
            <span className="nav-label">Projets</span>
          </button>
        </nav>
      </div>
    );
  }

  // Layout pour les pages publiques (Accueil, Login, Signup)
  return (
    <div className="app-container">
      <header>
        <div className="logo" onClick={() => setCurrentPage(localStorage.getItem('token') ? 'dashboard' : 'home')} style={{cursor: 'pointer'}}>
          <img src="/image/favicon.jpg" alt="Logo" style={{height: '32px', borderRadius: '50%'}} />
          <span>ralp-ai</span>
        </div>
        
        <div className="auth-buttons">
          <a href="#" className="btn btn-login" onClick={(e) => {e.preventDefault(); setCurrentPage('login')}}>Se connecter</a>
          <a href="#" className="btn btn-signup" onClick={(e) => {e.preventDefault(); setCurrentPage('signup')}}>S'inscrire</a>
        </div>
      </header>

      {renderContent()}
      <Footer />
    </div>
  );
}

export default App;