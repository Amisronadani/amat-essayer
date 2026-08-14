import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { couleurs, espacements, rayon, ombre } from '../theme/colors';

export default function LanguageToggle() {
  const { langue, changerLangue } = useLanguage();
  const animValue = useRef(new Animated.Value(langue === 'fr' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: langue === 'fr' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [langue]);

  const toggleLang = () => {
    changerLangue(langue === 'fr' ? 'ki' : 'fr');
  };

  const bgLeft = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 42]
  });

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLang} activeOpacity={0.8}>
      <Animated.View style={[styles.activeBackground, { left: bgLeft }]} />
      <View style={styles.option}>
        <Text style={[styles.text, langue === 'fr' && styles.textActive]}>FR</Text>
      </View>
      <View style={styles.option}>
        <Text style={[styles.text, langue === 'ki' && styles.textActive]}>KI</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: rayon.pill,
    width: 84,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  activeBackground: {
    position: 'absolute',
    width: 40,
    height: 28,
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.pill,
    ...ombre,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  text: {
    fontSize: 12,
    color: couleurs.texteMuted,
    fontWeight: '600',
  },
  textActive: {
    color: couleurs.vertPrincipal,
    fontWeight: '700',
  }
});
