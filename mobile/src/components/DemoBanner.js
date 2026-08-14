import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espacements } from '../theme/colors';
import { useTranslation } from '../i18n';

/**
 * Bandeau affiché en haut de chaque écran.
 * Rappelle sans ambiguïté qu'il s'agit d'un prototype pédagogique,
 * non officiel, qui ne représente aucun scrutin réel.
 */
export default function DemoBanner() {
  const { t } = useTranslation();
  return (
    <View style={styles.conteneur}>
      <Ionicons name="alert-circle" size={18} color={couleurs.avertissement} />
      <Text style={styles.texte}>
        {t('demo_banner') || "DÉMONSTRATION — Application non officielle, candidats fictifs. Ne représente aucun scrutin réel."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: couleurs.avertissementFond,
    paddingVertical: 10,
    paddingHorizontal: espacements.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(185, 132, 59, 0.2)',
  },
  texte: {
    flex: 1,
    fontSize: 12,
    color: '#7A5A22',
    fontWeight: '600',
    lineHeight: 16,
  },
});
