import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espacements, rayon, ombre } from '../theme/colors';

export default function CandidateCard({ candidat, selectionne, onPress }) {
  const initiale = candidat.nom_candidat?.charAt(0) || '?';
  const color = candidat.couleur_parti || couleurs.vertPrincipal;
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selectionne ? 1.02 : 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 6,
    }).start();
  }, [selectionne]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.carte,
          { borderLeftColor: color, borderLeftWidth: 5 },
          selectionne && {
            borderColor: color,
            borderWidth: 2,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.initiale}>{initiale.toUpperCase()}</Text>
        </View>

        <View style={styles.infos}>
          <Text style={styles.nom}>{candidat.nom_candidat}</Text>
          <Text style={styles.parti} numberOfLines={1}>{candidat.parti_fictif}</Text>
          {!!candidat.slogan && <Text style={styles.slogan} numberOfLines={1}>« {candidat.slogan} »</Text>}
        </View>

        <View style={[styles.radio, selectionne && { backgroundColor: color, borderColor: color }]}>
          {selectionne && <Ionicons name="checkmark" size={14} color={couleurs.blanc} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  carte: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.md,
    padding: espacements.md,
    marginBottom: espacements.sm,
    borderWidth: 1.5,
    borderColor: couleurs.grisTresClair,
    ...ombre,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', marginRight: espacements.md,
  },
  initiale: { color: couleurs.blanc, fontWeight: '700', fontSize: 17 },
  infos: { flex: 1 },
  nom: { fontSize: 15.5, fontWeight: '700', color: couleurs.texte },
  parti: { fontSize: 12.5, color: couleurs.texteMuted, marginTop: 2 },
  slogan: { fontSize: 12, color: couleurs.grisMoyen, fontStyle: 'italic', marginTop: 3 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: couleurs.grisClair,
    alignItems: 'center', justifyContent: 'center',
  },
});
