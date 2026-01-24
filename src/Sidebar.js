import React from 'react';

function Sidebar({ currentPage, onNavigate }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('home');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>Ralphaigroup</div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          📊 Tableau de bord
        </button>
        <button 
          className={`nav-item ${currentPage === 'create' ? 'active' : ''}`}
          onClick={() => onNavigate('create')}
        >
          ✨ Nouvelle Création
        </button>
        <button 
          className={`nav-item ${currentPage === 'projects' ? 'active' : ''}`}
          onClick={() => onNavigate('projects')}
        >
          🎬 Mes Projets
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={handleLogout}>🚪 Déconnexion</button>
      </div>
    </div>
  );
}

export default Sidebar;