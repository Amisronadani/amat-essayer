import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [langue, setLangue] = useState('fr');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('amatora_langue');
        if (storedLang) {
          setLangue(storedLang);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la langue:', error);
      }
    };
    loadLanguage();
  }, []);

  const changerLangue = async (lang) => {
    try {
      setLangue(lang);
      await AsyncStorage.setItem('amatora_langue', lang);
    } catch (error) {
      console.error('Erreur lors du changement de langue:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ langue, changerLangue }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
