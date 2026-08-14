import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OfflineBanner from '../components/OfflineBanner';
import PrimaryButton from '../components/PrimaryButton';
import { couleurs, espacements, rayon, typo, ombre } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';
import { LinearGradient } from 'expo-linear-gradient'; // Requires expo-linear-gradient, fallback safely if not available but standard for Expo

export default function ProfileScreen() {
  const { utilisateur, deconnecter } = useAuth();
  const { t } = useTranslation();

  const getInitials = () => {
    if (!utilisateur) return '?';
    const prenom = utilisateur.prenom ? utilisateur.prenom.charAt(0) : '';
    const nom = utilisateur.nom ? utilisateur.nom.charAt(0) : '';
    return (prenom + nom).toUpperCase() || '?';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <OfflineBanner />
      
      <View style={styles.voterCardContainer}>
        {/* We use standard View with background color if LinearGradient isn't installed, but Expo includes it often. 
            We'll use a gradient-like design using views if needed, but assuming LinearGradient works for PREMIUM. */}
        <View style={styles.voterCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>{t('profile.voter_card', { defaultValue: "CARTE D'ÉLECTEUR" })}</Text>
            <Ionicons name="id-card" size={24} color={couleurs.blanc} />
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{getInitials()}</Text>
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.nom}>{utilisateur?.prenom} {utilisateur?.nom}</Text>
              <Text style={styles.cni}>CNI: {utilisateur?.numero_cni || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>{t('profile.voter_number', { defaultValue: 'N° Électeur' })}</Text>
              <Text style={styles.footerValue}>{utilisateur?.numero_electeur_demo || 'N/A'}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>{t('province')}</Text>
              <Text style={styles.footerValue}>{utilisateur?.nom_province || utilisateur?.province || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>{t('profile.account_info', { defaultValue: 'Informations du compte' })}</Text>
        <View style={styles.infoList}>
          <LigneInfo icone="card-outline" label="CNI" valeur={utilisateur?.numero_cni || 'N/A'} />
          <LigneInfo icone="mail-outline" label={t('email')} valeur={utilisateur?.email || 'N/A'} />
          <LigneInfo icone="map-outline" label={t('province')} valeur={utilisateur?.nom_province || utilisateur?.province || 'N/A'} />
          <LigneInfo icone="business-outline" label={t('commune')} valeur={utilisateur?.nom_commune || 'N/A'} />
          <LigneInfo icone="location-outline" label={t('colline')} valeur={utilisateur?.nom_colline || 'N/A'} />
          <LigneInfo icone="pin-outline" label={t('sousColline')} valeur={utilisateur?.nom_sous_colline || 'N/A'} />
        </View>

        <Text style={styles.sectionTitle}>{t('profile.voting_status', { defaultValue: 'Statut de vote' })}</Text>
        <View style={[styles.statusBadge, utilisateur?.a_vote ? styles.statusVoted : styles.statusNotVoted]}>
          <Ionicons 
            name={utilisateur?.a_vote ? "checkmark-circle" : "time"} 
            size={24} 
            color={utilisateur?.a_vote ? '#0F5132' : '#856404'} 
          />
          <Text style={[styles.statusText, utilisateur?.a_vote ? styles.statusTextVoted : styles.statusTextNotVoted]}>
            {utilisateur?.a_vote 
              ? t('profile.has_voted', { defaultValue: 'A voté ✓' }) 
              : t('profile.has_not_voted', { defaultValue: "N'a pas encore voté" })}
          </Text>
        </View>

        <PrimaryButton 
          titre={t('deconnexion')} 
          variante="gris" 
          onPress={deconnecter} 
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

function LigneInfo({ icone, label, valeur }) {
  return (
    <View style={styles.ligne}>
      <View style={styles.iconContainer}>
        <Ionicons name={icone} size={20} color={couleurs.vertPrincipal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valeur}>{valeur}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.fond },
  contentContainer: { paddingBottom: espacements.xl },
  voterCardContainer: {
    padding: espacements.lg,
    alignItems: 'center',
    marginTop: espacements.sm,
  },
  voterCard: {
    width: '100%',
    backgroundColor: couleurs.vertPrincipal, // Base color, fallback for gradient
    borderRadius: rayon.xl,
    overflow: 'hidden',
    ...ombre,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: espacements.lg,
    paddingVertical: espacements.md,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardHeaderTitle: {
    color: couleurs.blanc,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  cardBody: {
    flexDirection: 'row',
    padding: espacements.lg,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: espacements.lg,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: couleurs.blanc,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  initials: {
    fontSize: 32, fontWeight: '800', color: couleurs.vertPrincipal,
  },
  infoContainer: {
    flex: 1,
  },
  nom: {
    fontSize: 22, fontWeight: '800', color: couleurs.blanc, marginBottom: 4,
  },
  cni: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: espacements.md,
    justifyContent: 'space-between',
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11, color: couleurs.texteMuted, textTransform: 'uppercase', fontWeight: '700', marginBottom: 2,
  },
  footerValue: {
    fontSize: 15, fontWeight: '800', color: couleurs.texte,
  },
  detailsContainer: {
    paddingHorizontal: espacements.lg,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: couleurs.texte, 
    marginTop: espacements.md, marginBottom: espacements.md,
  },
  infoList: {
    backgroundColor: couleurs.blanc,
    borderRadius: rayon.lg,
    padding: espacements.md,
    ...ombre,
    marginBottom: espacements.lg,
  },
  ligne: { flexDirection: 'row', alignItems: 'center', marginBottom: espacements.md },
  iconContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: couleurs.grisTresClair,
    alignItems: 'center', justifyContent: 'center', marginRight: espacements.md,
  },
  label: { fontSize: 12, color: couleurs.texteMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  valeur: { fontSize: 15, color: couleurs.texte, fontWeight: '700', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: espacements.lg, borderRadius: rayon.lg, marginBottom: espacements.xl,
    ...ombre,
  },
  statusVoted: { backgroundColor: '#D1E7DD', borderColor: '#BADBCC', borderWidth: 1 },
  statusNotVoted: { backgroundColor: '#FFF3CD', borderColor: '#FFEEBA', borderWidth: 1 },
  statusText: { fontSize: 18, fontWeight: '800' },
  statusTextVoted: { color: '#0F5132' },
  statusTextNotVoted: { color: '#856404' },
  logoutButton: { marginTop: espacements.sm },
});
