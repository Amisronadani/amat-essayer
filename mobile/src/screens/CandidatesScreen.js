import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfflineBanner from '../components/OfflineBanner';
import CandidateCard from '../components/CandidateCard';
import PrimaryButton from '../components/PrimaryButton';
import { couleurs, espacements, rayon, ombre, typo } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import api from '../services/api';

export default function CandidatesScreen({ navigation }) {
  const { utilisateur } = useAuth();
  const { t } = useTranslation();
  const [candidats, setCandidats] = useState([]);
  const [selectionId, setSelectionId] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [erreur, setErreur] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const chargerCandidats = useCallback(async () => {
    try {
      setErreur('');
      const { data } = await api.get('/candidats');
      if (data.success) {
        setCandidats(data.candidats);
      }
    } catch (e) {
      setErreur(t('candidates.error_loading', { defaultValue: 'Erreur lors du chargement des candidats' }));
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  }, [t]);

  useEffect(() => { 
    chargerCandidats(); 
  }, [chargerCandidats]);

  useEffect(() => {
    if (utilisateur?.a_vote) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [utilisateur?.a_vote, fadeAnim, scaleAnim]);

  if (utilisateur?.a_vote) {
    return (
      <View style={styles.container}>
        <OfflineBanner />
        <View style={styles.dejaVote}>
          <Animated.View style={[styles.checkCircle, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Ionicons name="checkmark" size={60} color={couleurs.blanc} />
          </Animated.View>
          <Animated.Text style={[styles.dejaVoteTitre, { opacity: fadeAnim }]}>
            {t('candidates.already_voted_title', { defaultValue: 'Vote enregistré avec succès !' })}
          </Animated.Text>
          <Animated.Text style={[styles.dejaVoteTexte, { opacity: fadeAnim }]}>
            {t('candidates.already_voted_desc', { defaultValue: 'Merci pour votre participation citoyenne. Votre vote a été comptabilisé.' })}
          </Animated.Text>
          <PrimaryButton
            titre={t('candidates.view_results', { defaultValue: 'Voir les résultats' })}
            variante="primaire"
            onPress={() => navigation.navigate('Résultats')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <View style={styles.entete}>
        <Text style={typo.titre}>{t('candidates.choose_candidate', { defaultValue: 'Choisissez un candidat' })}</Text>
        <Text style={typo.sousTitre}>{t('candidates.subtitle', { defaultValue: 'Élection présidentielle' })}</Text>
      </View>

      <FlatList
        data={candidats}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={() => { setRafraichissement(true); chargerCandidats(); }} />}
        renderItem={({ item }) => (
          <CandidateCard
            candidat={item}
            selectionne={selectionId === item.id}
            onPress={() => setSelectionId(item.id)}
          />
        )}
        ListEmptyComponent={!chargement && (
          <View style={styles.emptyContainer}>
            <Text style={styles.vide}>
              {erreur ? erreur : t('candidates.no_candidates', { defaultValue: 'Aucun candidat disponible.' })}
            </Text>
            {!!erreur && (
              <PrimaryButton 
                titre={t('common.retry', { defaultValue: 'Réessayer' })} 
                variante="contour" 
                onPress={() => { setChargement(true); chargerCandidats(); }} 
              />
            )}
          </View>
        )}
      />

      <View style={styles.piedDePage}>
        <PrimaryButton
          titre={t('candidates.confirm_vote', { defaultValue: 'Confirmer mon vote' })}
          desactive={!selectionId}
          onPress={() => navigation.navigate('ConfirmationVote', {
            candidat: candidats.find((c) => c.id === selectionId),
          })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.fond },
  entete: { paddingHorizontal: espacements.lg, paddingTop: espacements.lg, paddingBottom: espacements.sm },
  liste: { paddingHorizontal: espacements.lg, paddingBottom: 100 },
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 20 },
  vide: { textAlign: 'center', color: couleurs.texteMuted, fontSize: 16 },
  piedDePage: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: espacements.lg, backgroundColor: couleurs.blanc,
    borderTopWidth: 1, borderTopColor: couleurs.grisTresClair,
    ...ombre,
  },
  dejaVote: { 
    flex: 1, alignItems: 'center', justifyContent: 'center', 
    padding: espacements.xl, backgroundColor: couleurs.fond 
  },
  checkCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: couleurs.vertPrincipal,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: espacements.xl,
    ...ombre,
  },
  dejaVoteTitre: { 
    fontSize: 24, fontWeight: '800', color: couleurs.texte, 
    marginBottom: espacements.md, textAlign: 'center' 
  },
  dejaVoteTexte: { 
    fontSize: 16, color: couleurs.texteMuted, 
    textAlign: 'center', marginBottom: espacements.xl, lineHeight: 24 
  },
});
