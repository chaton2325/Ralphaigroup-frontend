import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="logo">
            <img src="/image/favicon.jpg" alt="ralp-ai" style={{ height: '32px', borderRadius: '50%' }} />
            <span>ralp-ai</span>
          </div>
          <p>La solution ultime pour générer des vidéos publicitaires et virales grâce à l'intelligence artificielle.</p>
        </div>

        <div className="footer-links">
          <h4>Produit</h4>
          <a href="#">Tarifs</a>
          <a href="#">Fonctionnalités</a>
          <a href="#">Showcase</a>
        </div>

        <div className="footer-links">
          <h4>Légal</h4>
          <a href="#">Mentions légales</a>
          <a href="#">Politique de confidentialité</a>
          <a href="#">CGV</a>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Besoin d'aide ?</p>
          <a href="mailto:contact@ralp-ai.site" className="contact-email">contact@ralp-ai.site</a>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} ralp-ai. Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;