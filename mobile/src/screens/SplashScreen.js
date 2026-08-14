import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { couleurs } from '../theme/colors';
import { useTranslation } from '../i18n';

const logo = require('../assets/logo.jpg');

export default function SplashScreen() {
  const { t } = useTranslation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient colors={[couleurs.vertPrincipal, '#0d592f']} style={styles.conteneur}>
      <Animated.View style={[styles.contenu, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={logo} style={styles.logoImage} />
        <Text style={styles.titre}>AMATORA</Text>
        <Text style={styles.soustitre}>{t('appSubtitle')}</Text>
      </Animated.View>
      <ActivityIndicator color={couleurs.blanc} style={styles.spinner} size="large" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenu: {
    alignItems: 'center',
  },
  logoImage: {
    width: 130, 
    height: 130, 
    borderRadius: 65,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  titre: { 
    fontSize: 42, 
    fontWeight: '900', 
    color: couleurs.blanc, 
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  soustitre: { 
    fontSize: 16, 
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)', 
    marginTop: 10,
  },
  spinner: {
    position: 'absolute',
    bottom: 50,
  }
});
