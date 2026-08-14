import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    restaurerSession();
  }, []);

  async function restaurerSession() {
    try {
      const token = await AsyncStorage.getItem('amatora_token');
      if (token) {
        const { data } = await api.get('/auth/profil');
        if (data.success) setUtilisateur(data.utilisateur);
      }
    } catch (erreur) {
      await AsyncStorage.removeItem('amatora_token');
    } finally {
      setChargement(false);
    }
  }

  async function connecter(numero_cni, mot_de_passe) {
    const { data } = await api.post('/auth/connexion', { numero_cni, mot_de_passe });
    if (data.success) {
      await AsyncStorage.setItem('amatora_token', data.token);
      setUtilisateur(data.utilisateur);
    }
    return data;
  }

  async function inscrire(payload) {
    const { data } = await api.post('/auth/inscription', payload);
    if (data.success) {
      await AsyncStorage.setItem('amatora_token', data.token);
      setUtilisateur(data.utilisateur);
    }
    return data;
  }

  async function deconnecter() {
    await AsyncStorage.removeItem('amatora_token');
    setUtilisateur(null);
  }

  function marquerCommeAyantVote() {
    setUtilisateur((precedent) => precedent ? { ...precedent, a_vote: true } : precedent);
  }

  return (
    <AuthContext.Provider
      value={{ utilisateur, chargement, connecter, inscrire, deconnecter, marquerCommeAyantVote }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
