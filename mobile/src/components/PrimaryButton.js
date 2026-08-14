import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { couleurs, rayon } from '../theme/colors';

export default function PrimaryButton({ titre, onPress, chargement, desactive, variante = 'plein' }) {
  const estGris = variante === 'gris';
  const estContour = variante === 'contour';
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (desactive || chargement) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const renderContent = () => {
    if (chargement) {
      return <ActivityIndicator color={estContour ? couleurs.vertPrincipal : couleurs.blanc} />;
    }
    return <Text style={[styles.texte, estContour && styles.texteContour]}>{titre}</Text>;
  };

  if (variante === 'plein' && !desactive) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={chargement}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1EB53A', '#14532D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bouton}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.bouton,
          estGris && styles.boutonGris,
          estContour && styles.boutonContour,
          (desactive || chargement) && styles.boutonDesactive,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={desactive || chargement}
        activeOpacity={0.85}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bouton: {
    backgroundColor: couleurs.vertPrincipal,
    paddingVertical: 14,
    borderRadius: rayon.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonGris: { backgroundColor: couleurs.grisMoyen },
  boutonContour: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: couleurs.vertPrincipal,
  },
  boutonDesactive: { opacity: 0.55 },
  texte: { color: couleurs.blanc, fontWeight: '700', fontSize: 15.5 },
  texteContour: { color: couleurs.vertPrincipal },
});
