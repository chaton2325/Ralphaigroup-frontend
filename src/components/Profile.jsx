import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Correspond à votre curl GET /api/users/profile
        // Le header Authorization est ajouté automatiquement par api.js
        const response = await api.get('/users/profile');
        setProfileData(response.data);
      } catch (err) {
        setError("Impossible de charger le profil. Token invalide ou expiré.");
        if (err.response && err.response.status === 401) {
            logout(); // Déconnexion si le token n'est plus valide
        }
      }
    };

    fetchProfile();
  }, [logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!profileData) return <div className="container"><p>Chargement...</p></div>;

  return (
    <div className="container">
      <h2>PROFIL</h2>
      <div style={{ border: '1px solid #333', padding: '15px', marginBottom: '20px' }}>
        {/* Affiche les données brutes ou formatées selon la réponse de votre API */}
        <pre>{JSON.stringify(profileData, null, 2)}</pre>
      </div>
      <button 
        onClick={handleLogout} 
        style={{ backgroundColor: '#ff4444', color: 'white' }}
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default Profile;
