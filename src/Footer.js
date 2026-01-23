import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="logo" style={{fontSize: '1.2rem'}}>Ralphaigroup</div>
        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          &copy; {new Date().getFullYear()} Ralphaigroup. Tous droits réservés.
        </div>
        <div style={{display: 'flex', gap: '1rem', fontSize: '0.9rem'}}>
          <span style={{color: 'var(--text-muted)', cursor: 'pointer'}}>Mentions légales</span>
          <span style={{color: 'var(--text-muted)', cursor: 'pointer'}}>Confidentialité</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;