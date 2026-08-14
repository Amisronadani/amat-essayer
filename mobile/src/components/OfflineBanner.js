import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../context/OfflineContext';
import { useTranslation } from '../i18n';
import { couleurs, espacements, rayon, ombre } from '../theme/colors';

export default function OfflineBanner() {
  const { isOnline, pendingVotes } = useOffline();
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOnline ? -100 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <Ionicons name="wifi-outline" size={20} color={couleurs.avertissement} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('hors_ligne') || 'Hors ligne / Ntamuyungano'}</Text>
          {pendingVotes > 0 && (
            <Text style={styles.subtitle}>
              {pendingVotes} {t('votes_en_attente') || 'vote(s) en attente'}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: couleurs.avertissementFond,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.avertissement,
    ...ombre,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacements.md,
    paddingTop: espacements.lg, // Safe area padding
  },
  textContainer: {
    marginLeft: espacements.sm,
    flex: 1,
  },
  title: {
    color: couleurs.avertissement,
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    color: couleurs.avertissement,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});
