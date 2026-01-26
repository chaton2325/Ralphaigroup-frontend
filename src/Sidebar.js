import React from 'react';
import { LayoutDashboard, PlusCircle, FolderHeart, LogOut } from 'lucide-react';

function Sidebar({ currentPage, onNavigate }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          <span>Tableau de bord</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'create' ? 'active' : ''}`}
          onClick={() => onNavigate('create')}
        >
          <PlusCircle size={18} />
          <span>Nouvelle Création</span>
        </button>
        <button
          className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`}
          onClick={() => onNavigate('projects')}
        >
          <FolderHeart size={18} />
          <span>Mes Projets</span>
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
