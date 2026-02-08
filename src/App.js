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
  X,
  ShoppingBag
} from 'lucide-react';
import './App.css';
import { useTranslation } from './LanguageContext';
import Login from './Login';
import Signup from './Signup';
import Footer from './Footer';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Sidebar from './Sidebar';
import CreateVideo from './CreateVideo';
import AdGenerator from './AdGenerator';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'home';
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { t, language, toggleLanguage } = useTranslation();

  const isAuthPage = ['dashboard', 'projects', 'create', 'ad-generator'].includes(currentPage);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_pending_data');
    localStorage.removeItem('ad_chat_history');
    localStorage.removeItem('ad_step');
    localStorage.removeItem('ad_form_data');
    localStorage.removeItem('ad_pending_generation');
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
        return null;
      case 'ad-generator':
        return <AdGenerator onNavigate={setCurrentPage} />;
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
                  {t('heroTitle').split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                </h1>
                <p className="hero-subtitle-apple">
                  {t('heroSubtitle')}
                </p>
                <div className="hero-actions">
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    {t('startAdventure')}
                  </button>
                  <button className="btn-apple-secondary" onClick={() => {
                    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    {t('viewDemo')}
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
                  <h2>{t('howItWorks')}</h2>
                  <p>{t('threeSteps')}</p>
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
                          <span className="typing-text">{t('demoInput')}</span>
                          <span className="cursor-blink"></span>
                        </div>
                      </div>
                    </div>
                    <div className="step-content">
                      <h3>{t('step1Title')}</h3>
                      <p>{t('step1Desc')}</p>
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
                      <h3>{t('step2Title')}</h3>
                      <p>{t('step2Desc')}</p>
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
                      <h3>{t('step3Title')}</h3>
                      <p>{t('step3Desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="demo-cta reveal">
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    {t('tryNow')}
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
                    <h2>{t('globalTitle')}</h2>
                    <p>{t('globalDesc')}</p>
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
                    <span className="badge-promo">{t('limitedOffer')}</span>
                    <h3>{t('boostCreativity')}</h3>
                    <div className="pricing-apple">
                      <span className="price-big">10€</span>
                      <span className="price-label">{t('offerTokens')}</span>
                    </div>
                  </div>
                  <button className="btn-apple-primary" onClick={() => setCurrentPage('signup')}>
                    {t('getOffer')}
                  </button>
                </div>
              </div>
            </section>

            {/* Formats Section */}
            <section className="section-apple">
              <div className="container-apple">
                <div className="section-header reveal">
                  <h2>{t('formatsTitle')}</h2>
                  <p>{t('formatsDesc')}</p>
                </div>

                <div className="formats-grid-apple">
                  <div className="format-item reveal">
                    <div className="video-wrap portrait">
                      <video src="videos/demo-portrait.mp4" autoPlay loop muted playsInline />
                    </div>
                    <h4>{t('verticalFormat')}</h4>
                    <p>{t('tiktokReels')}</p>
                  </div>
                  <div className="format-item reveal" style={{ animationDelay: '0.2s' }}>
                    <div className="video-wrap landscape">
                      <video src="videos/demo-paysage.mp4" autoPlay loop muted playsInline />
                    </div>
                    <h4>{t('landscapeFormat')}</h4>
                    <p>{t('youtubeWeb')}</p>
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
          <div style={{ display: currentPage === 'create' ? 'block' : 'none', height: '100%' }}>
            <CreateVideo onNavigate={setCurrentPage} isActive={currentPage === 'create'} />
          </div>
          {currentPage !== 'create' && renderContent()}
          {currentPage !== 'create' && currentPage !== 'ad-generator' && <Footer />}
        </div>

        {/* Navigation Mobile */}
        <nav className="mobile-nav">
          <button className={`mobile-nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
            <BarChart3 size={20} />
            <span className="nav-label">{t('home')}</span>
          </button>

          <button className={`mobile-nav-item ${currentPage === 'create' ? 'active' : ''}`} onClick={() => setCurrentPage('create')}>
            <div className="nav-icon-highlight">
              <PlusSquare size={24} />
            </div>
            <span className="nav-label">{t('create')}</span>
          </button>

          <button className={`mobile-nav-item ${currentPage === 'ad-generator' ? 'active' : ''}`} onClick={() => setCurrentPage('ad-generator')}>
            <ShoppingBag size={20} />
            <span className="nav-label">{t('pub')}</span>
          </button>

          <button className={`mobile-nav-item ${currentPage === 'projects' ? 'active' : ''}`} onClick={() => setCurrentPage('projects')}>
            <FolderRoot size={20} />
            <span className="nav-label">{t('projects')}</span>
          </button>

          <button className={`mobile-nav-item ${showMobileMenu ? 'active' : ''}`} onClick={() => setShowMobileMenu(true)}>
            <User size={20} />
            <span className="nav-label">{t('profile')}</span>
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
                <span className="tokens-label">{t('tokensAvailable')}</span>
              </div>

              <div className="mobile-menu-actions">
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }}>
                  <BarChart3 size={20} />
                  <span>{t('dashboard')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('projects'); setShowMobileMenu(false); }}>
                  <FolderRoot size={20} />
                  <span>{t('myProjects')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('create'); setShowMobileMenu(false); }}>
                  <PlusSquare size={20} />
                  <span>{t('newCreation')}</span>
                </button>
                <button className="mobile-menu-item" onClick={() => { setCurrentPage('ad-generator'); setShowMobileMenu(false); }}>
                  <ShoppingBag size={20} />
                  <span>{t('adGenerator')}</span>
                </button>
              </div>
              
              <button className="mobile-menu-item" onClick={toggleLanguage} style={{ marginBottom: '10px' }}>
                <Globe size={20} />
                <span>{language === 'fr' ? 'English' : 'Français'}</span>
              </button>

              <div className="mobile-menu-footer">
                <button className="mobile-menu-logout" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>{t('logout')}</span>
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
            <button className="btn-link" onClick={toggleLanguage} style={{ marginRight: '5px', fontWeight: '600', minWidth: '40px' }}>
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button className="btn-link" onClick={() => setCurrentPage('login')}>{t('login')}</button>
            <button className="btn-apple-primary sm" onClick={() => setCurrentPage('signup')}>{t('signup')}</button>
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