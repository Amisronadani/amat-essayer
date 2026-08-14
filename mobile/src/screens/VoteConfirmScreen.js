import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfflineBanner from '../components/OfflineBanner';
import PrimaryButton from '../components/PrimaryButton';
import { couleurs, espacements, rayon, typo, ombre } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { useOffline } from '../context/OfflineContext';
import api from '../services/api';

export default function VoteConfirmScreen({ route, navigation }) {
  const { candidat } = route.params;
  const { marquerCommeAyantVote } = useAuth();
  const { t } = useTranslation();
  const { isOffline, enqueueVote } = useOffline();
  
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (succes) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          navigation.navigate('Candidats');
        }, 1500);
      });
    }
  }, [succes, scaleAnim, navigation]);

  async function confirmerVote() {
    setChargement(true);
    setErreur('');
    try {
      if (isOffline && enqueueVote) {
        // Handle offline via offlineStorage
        await enqueueVote({ candidat_id: candidat.id });
        marquerCommeAyantVote();
        setSucces(true);
      } else {
        const { data } = await api.post('/votes', { candidat_id: candidat.id });
        if (data.success) {
          marquerCommeAyantVote();
          setSucces(true);
        } else {
          setErreur(data.message || t('vote_confirm.error', { defaultValue: 'Erreur lors du vote' }));
        }
      }
    } catch (e) {
      setErreur(e?.response?.data?.message || t('vote_confirm.network_error', { defaultValue: 'Connexion au serveur impossible.' }));
    } finally {
      setChargement(false);
    }
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <View style={styles.conteneur}>
        {!succes ? (
          <>
            <Text style={[typo.titre, styles.centerText]}>{t('vote_confirm.title', { defaultValue: 'Confirmer votre vote' })}</Text>
            <Text style={[typo.sousTitre, styles.centerText, { marginBottom: espacements.lg }]}>
              {t('vote_confirm.subtitle', { defaultValue: 'Vérifiez votre choix avant de valider.' })}
            </Text>

            <View style={styles.carte}>
              <View style={[styles.avatarContainer, { borderColor: candidat.couleur_parti || couleurs.vertPrincipal }]}>
                <View style={[styles.avatar, { backgroundColor: candidat.couleur_parti || couleurs.vertPrincipal }]}>
                  <Text style={styles.initiale}>{candidat.nom_candidat ? candidat.nom_candidat.charAt(0).toUpperCase() : '?'}</Text>
                </View>
              </View>
              <Text style={styles.nom}>{candidat.nom_candidat}</Text>
              <Text style={styles.parti}>{candidat.parti_fictif}</Text>
              {candidat.slogan && <Text style={styles.slogan}>"{candidat.slogan}"</Text>}
            </View>

            {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

            <View style={styles.avertissement}>
              <Ionicons name="warning" size={24} color={couleurs.avertissement} />
              <View style={styles.avertissementTexteContainer}>
                <Text style={styles.avertissementTitre}>
                  {t('vote_confirm.warning_title', { defaultValue: 'Cette action est irréversible' })}
                </Text>
                <Text style={styles.avertissementTexte}>
                  {t('vote_confirm.warning_desc', { defaultValue: 'Une fois validé, votre vote ne pourra plus être modifié.' })}
                </Text>
              </View>
            </View>

            <View style={styles.boutons}>
              <PrimaryButton 
                titre={t('vote_confirm.cancel', { defaultValue: 'Annuler' })} 
                variante="contour" 
                onPress={() => navigation.goBack()} 
                desactive={chargement} 
                style={styles.boutonDemi}
              />
              <PrimaryButton 
                titre={t('vote_confirm.confirm', { defaultValue: 'Confirmer' })} 
                onPress={confirmerVote} 
                chargement={chargement} 
                style={styles.boutonDemi}
              />
            </View>
          </>
        ) : (
          <View style={styles.succesConteneur}>
            <Animated.View style={[styles.succesCercle, { transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="checkmark-sharp" size={80} color={couleurs.blanc} />
            </Animated.View>
            <Text style={styles.succesTitre}>{t('vote_confirm.success', { defaultValue: 'A voté !' })}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.fond },
  conteneur: { flex: 1, padding: espacements.lg, justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  carte: {
    backgroundColor: couleurs.blanc, borderRadius: rayon.xl, padding: espacements.xl,
    alignItems: 'center', marginBottom: espacements.xl, ...ombre,
  },
  avatarContainer: {
    padding: 4, borderRadius: 60, borderWidth: 3, marginBottom: espacements.md,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },
  initiale: { color: couleurs.blanc, fontWeight: '800', fontSize: 40 },
  nom: { fontSize: 24, fontWeight: '800', color: couleurs.texte, textAlign: 'center' },
  parti: { fontSize: 16, fontWeight: '600', color: couleurs.texteMuted, marginTop: 8 },
  slogan: { fontSize: 14, fontStyle: 'italic', color: couleurs.vertPrincipal, marginTop: 12, textAlign: 'center' },
  erreur: { color: couleurs.danger, fontSize: 14, marginBottom: espacements.md, textAlign: 'center', fontWeight: '600' },
  avertissement: {
    flexDirection: 'row', backgroundColor: '#FFF4E5',
    padding: espacements.lg, borderRadius: rayon.md, marginBottom: espacements.xl, alignItems: 'center',
    borderLeftWidth: 4, borderLeftColor: couleurs.avertissement,
  },
  avertissementTexteContainer: { flex: 1, marginLeft: 12 },
  avertissementTitre: { fontSize: 16, fontWeight: '700', color: '#B26E00', marginBottom: 4 },
  avertissementTexte: { fontSize: 13, color: '#B26E00' },
  boutons: { flexDirection: 'row', justifyContent: 'space-between', gap: espacements.md },
  boutonDemi: { flex: 1 },
  succesConteneur: { alignItems: 'center', justifyContent: 'center' },
  succesCercle: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: couleurs.vertPrincipal,
    alignItems: 'center', justifyContent: 'center', marginBottom: espacements.lg,
    ...ombre,
  },
  succesTitre: { fontSize: 28, fontWeight: '800', color: couleurs.texte },
});
