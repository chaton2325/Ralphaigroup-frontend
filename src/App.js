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
              <h1>Générez des vidéos publicitaires impactantes</h1>
              <p>Notre technologie vous permet de créer des vidéos publicitaires, des présentations et bien plus encore en quelques secondes.</p>
              <a href="#" className="btn btn-signup" onClick={(e) => {e.preventDefault(); setCurrentPage('signup')}} style={{padding: '1rem 2rem', fontSize: '1.1rem'}}>Commencer gratuitement</a>
            </section>

            <section className="section">
              <div className="video-placeholder main-video">
                  <video controls width="100%" height="100%">
                      <source src="videos/demo-publicite.mp4" type="video/mp4" />
                      Votre navigateur ne supporte pas la balise vidéo.
                  </video>
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
          <Footer />
        </div>
      </div>
    );
  }

  // Layout pour les pages publiques (Accueil, Login, Signup)
  return (
    <div className="app-container">
      <header>
        <div className="logo" onClick={() => setCurrentPage(localStorage.getItem('token') ? 'dashboard' : 'home')} style={{cursor: 'pointer'}}>Ralphaigroup</div>
        
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