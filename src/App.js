import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PlusSquare,
  FolderRoot,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  Layout,
  Globe,
  Star,
  MessageSquare,
  Sparkles,
  Video,
  Download,
  Play,
  ChevronRight,
  Check,
  ArrowRight,
  User,
  Settings,
  X
} from 'lucide-react';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Sidebar from './Sidebar';
import CreateVideo from './CreateVideo';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'home';
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAuthPage = ['dashboard', 'projects', 'create'].includes(currentPage);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowMobileMenu(false);
    setCurrentPage('home');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
          <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-apple">
              <div className="video-background">
                <video autoPlay loop muted playsInline className="hero-video">
                  <source src="videos/demo-publicite.mp4" type="video/mp4" />
                </video>
                <div className="video-overlay"></div>
              </div>

              <div className="hero-content reveal">
                <div className="veo-badge-apple">
                  <Star size={16} fill="var(--accent)" color="var(--accent)" />
                  <span>Propulsé par VEO3 AI</span>
                </div>
                <h1 className="hero-title-apple">
                  Créez l'extraordinaire.<br />En quelques secondes.
                </h1>
                <p className="hero-subtitle-apple">
                  Générez des vidéos publicitaires et du contenu viral avec une fluidité inégalée.
                </p>
                <div className="hero-actions">
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    Commencer l'aventure
                  </button>
                  <button className="btn-apple-secondary" onClick={() => {
                    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Voir la démo
                  </button>
                </div>
              </div>
            </section>

            {/* Demo Section - Interactive Workflow */}
            <section className="demo-section" id="demo-section">
              <div className="container-apple">
                <div className="section-header reveal">
                  <div className="demo-badge">
                    <Play size={14} />
                    <span>DÉMO INTERACTIVE</span>
                  </div>
                  <h2>Comment ça marche ?</h2>
                  <p>Trois étapes simples pour créer des vidéos exceptionnelles</p>
                </div>

                <div className="demo-workflow">
                  {/* Step 1 */}
                  <div className="demo-step reveal" style={{ animationDelay: '0.1s' }}>
                    <div className="step-number">
                      <span>1</span>
                    </div>
                    <div className="step-visual">
                      <div className="step-icon-wrap">
                        <MessageSquare size={32} />
                      </div>
                      <div className="step-animation chat-animation">
                        <div className="fake-input">
                          <span className="typing-text">Une publicité pour une montre de luxe...</span>
                          <span className="cursor-blink"></span>
                        </div>
                      </div>
                    </div>
                    <div className="step-content">
                      <h3>Décrivez votre vision</h3>
                      <p>Expliquez simplement ce que vous voulez créer. Notre IA comprend le contexte et vos intentions.</p>
                    </div>
                  </div>

                  {/* Connection Line */}
                  <div className="demo-connector reveal">
                    <div className="connector-line"></div>
                    <ChevronRight size={20} />
                  </div>

                  {/* Step 2 */}
                  <div className="demo-step reveal" style={{ animationDelay: '0.3s' }}>
                    <div className="step-number">
                      <span>2</span>
                    </div>
                    <div className="step-visual">
                      <div className="step-icon-wrap processing">
                        <Sparkles size={32} />
                      </div>
                      <div className="step-animation process-animation">
                        <div className="process-ring"></div>
                        <div className="process-ring delay"></div>
                        <div className="process-center">
                          <Zap size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="step-content">
                      <h3>L'IA génère</h3>
                      <p>VEO3 analyse votre demande et crée une vidéo 8K haute fidélité en quelques secondes.</p>
                    </div>
                  </div>

                  {/* Connection Line */}
                  <div className="demo-connector reveal">
                    <div className="connector-line"></div>
                    <ChevronRight size={20} />
                  </div>

                  {/* Step 3 */}
                  <div className="demo-step reveal" style={{ animationDelay: '0.5s' }}>
                    <div className="step-number">
                      <span>3</span>
                    </div>
                    <div className="step-visual">
                      <div className="step-icon-wrap success">
                        <Video size={32} />
                      </div>
                      <div className="step-animation video-animation">
                        <div className="fake-video">
                          <div className="video-preview-bars">
                            <span></span><span></span><span></span><span></span><span></span>
                          </div>
                          <div className="video-check">
                            <Check size={20} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="step-content">
                      <h3>Téléchargez</h3>
                      <p>Votre vidéo est prête. Téléchargez-la instantanément et partagez-la sur vos plateformes.</p>
                    </div>
                  </div>
                </div>

                <div className="demo-cta reveal">
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    Essayer maintenant
                    <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </button>
                </div>
              </div>
            </section>

            {/* Feature Section - Languages */}
            <section className="section-apple">
              <div className="container-apple">
                <div className="feature-grid">
                  <div className="feature-text reveal">
                    <div className="accent-label">
                      <Globe size={14} style={{ marginRight: '8px' }} />
                      GLOBAL
                    </div>
                    <h2>Parlez toutes les langues.</h2>
                    <p>Générez vos contenus en Français et en Anglais. Touchez le monde entier sans la moindre barrière.</p>
                  </div>
                  <div className="feature-visual reveal">
                    <div className="glass-card">
                      <div className="lang-pill">Français 🇫🇷</div>
                      <div className="lang-pill">English 🇬🇧</div>
                      <div className="lang-pill">Español 🇪🇸</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Promo Section */}
            <section className="section-apple bg-subtle">
              <div className="container-apple">
                <div className="promo-card-apple reveal">
                  <div className="promo-info">
                    <span className="badge-promo">OFFRE LIMITÉE</span>
                    <h3>Boostez votre créativité.</h3>
                    <div className="pricing-apple">
                      <span className="price-big">10€</span>
                      <span className="price-label">pour 20 + 5 jetons offerts</span>
                    </div>
                  </div>
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    Profiter de l'offre
                  </button>
                </div>
              </div>
            </section>

            {/* Formats Section */}
            <section className="section-apple">
              <div className="container-apple">
                <div className="section-header reveal">
                  <h2>Tous vos formats préférés.</h2>
                  <p>Adapté pour TikTok, Reels, YouTube et plus encore.</p>
                </div>

                <div className="formats-grid-apple">
                  <div className="format-item reveal">
                    <div className="video-wrap portrait">
                      <video src="videos/demo-portrait.mp4" autoPlay loop muted playsInline />
                    </div>
                    <h4>Vertical</h4>
                    <p>TikTok & Reels</p>
                  </div>
                  <div className="format-item reveal" style={{ animationDelay: '0.2s' }}>
                    <div className="video-wrap landscape">
                      <video src="videos/demo-paysage.mp4" autoPlay loop muted playsInline />
                    </div>
                    <h4>Paysage</h4>
                    <p>YouTube & Web</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  if (isAuthPage) {
    return (
      <div className="app-layout">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="main-content">
          {renderContent()}
          {currentPage !== 'create' && <Footer />}
        </div>

        {/* Navigation Mobile */}
        <nav className="mobile-nav">
          <button className={`mobile-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
            <BarChart3 size={20} />
            <span className="nav-label">Accueil</span>
          </button>

          <button className={`mobile-nav-item ${currentPage === 'create' ? 'active' : ''}`} onClick={() => setCurrentPage('create')}>
            <div className="nav-icon-highlight">
              <PlusSquare size={24} />
            </div>
            <span className="nav-label">Créer</span>
          </button>

          <button className={`mobile-nav-item ${currentPage === 'projects' ? 'active' : ''}`} onClick={() => setCurrentPage('projects')}>
            <FolderRoot size={20} />
            <span className="nav-label">Projets</span>
          </button>

          <button className={`mobile-nav-item ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(true)}>
            <User size={20} />
            <span className="nav-label">Profil</span>
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
            <div className="mobile-menu-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <div className="mobile-menu-user">
                  <div className="mobile-menu-avatar">
                    <User size={24} />
                  </div>
                  <div className="mobile-menu-user-info">
                    <span className="mobile-menu-username">{user.username || 'Utilisateur'}</span>
                    <span className="mobile-menu-email">{user.email || ''}</span>
                  </div>
                </div>
                <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-menu-tokens">
                <Zap size={18} />
                <span className="tokens-value">{user.tokens || 0}</span>
                <span className="tokens-label">jetons disponibles</span>
              </div>

              <div className="mobile-menu-actions">
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }}>
                  <BarChart3 size={20} />
                  <span>Tableau de bord</span>
                </button>
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('projects'); setShowMobileMenu(false); }}>
                  <FolderRoot size={20} />
                  <span>Mes projets</span>
                </button>
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('create'); setShowMobileMenu(false); }}>
                  <PlusSquare size={20} />
                  <span>Créer une vidéo</span>
                </button>
              </div>

              <div className="mobile-menu-footer">
                <button className="mobile-menu-logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header-apple glass">
        <div className="container header-content">
          <div className="logo-apple" onClick={() => setCurrentPage(localStorage.getItem('token') ? 'dashboard' : 'home')}>
            <img src="/image/favicon.jpg" alt="Logo" />
            <span>ralp-ai</span>
          </div>

          <div className="auth-buttons-apple">
            <button className="btn-link" onClick={() => setCurrentPage('login')}>Se connecter</button>
            <button className="btn-apple-primary sm" onClick={() => setCurrentPage('signup')}>S'inscrire</button>
          </div>
        </div>
      </header>
      <main>
        {renderContent()}
      </main>
      {currentPage === 'home' && <Footer />}
    </div>
  );
}

export default App;