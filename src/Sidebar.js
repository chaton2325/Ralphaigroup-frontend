import React from 'react';
import { LayoutDashboard, PlusCircle, FolderHeart, LogOut, ShoppingBag, Globe } from 'lucide-react';
import { useTranslation } from './LanguageContext';

function Sidebar({ currentPage, onNavigate }) {
  const { t, language, toggleLanguage } = useTranslation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chat_history');
    localStorage.removeItem('chat_pending_data');
    localStorage.removeItem('ad_chat_history');
    localStorage.removeItem('ad_step');
    localStorage.removeItem('ad_form_data');
    localStorage.removeItem('ad_pending_generation');
    onNavigate('home');
  };

  return (
    <div className="sidebar-apple">
      <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>ralp-ai</div>
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>{t('dashboard')}</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'create' ? 'active' : ''}`}
          onClick={() => onNavigate('create')}
        >
          <PlusCircle size={18} />
          <span>{t('newCreation')}</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'ad-generator' ? 'active' : ''}`}
          onClick={() => onNavigate('ad-generator')}
        >
          <ShoppingBag size={18} />
          <span>{t('adGenerator')}</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`}
          onClick={() => onNavigate('projects')}
        >
          <FolderHeart size={18} />
          <span>{t('myProjects')}</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" onClick={toggleLanguage}>
          <Globe size={18} />
          <span>{language === 'fr' ? 'English' : 'Français'}</span>
        </button>
        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
