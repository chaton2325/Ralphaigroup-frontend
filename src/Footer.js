import React from 'react';
import { useTranslation } from './LanguageContext';

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="logo">
            <img src="/image/favicon.jpg" alt="ralp-ai" style={{ height: '32px', borderRadius: '50%' }} />
            <span>ralp-ai</span>
          </div>
          <p>{t('footerDesc')}</p>
        </div>

        <div className="footer-links">
          <h4>{t('product')}</h4>
          <a href="#">{t('pricing')}</a>
          <a href="#">{t('features')}</a>
          <a href="#">{t('showcase')}</a>
        </div>

        <div className="footer-links">
          <h4>{t('legal')}</h4>
          <a href="#">{t('legalMentions')}</a>
          <a href="#">{t('privacyPolicy')}</a>
          <a href="#">{t('terms')}</a>
        </div>

        <div className="footer-contact">
          <h4>{t('contact')}</h4>
          <p>{t('needHelp')}</p>
          <a href="mailto:contact@ralp-ai.site" className="contact-email">contact@ralp-ai.site</a>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} ralp-ai. {t('rightsReserved')}
      </div>
    </footer>
  );
}

export default Footer;