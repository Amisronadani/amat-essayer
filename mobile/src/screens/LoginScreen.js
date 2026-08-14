import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import OfflineBanner from '../components/OfflineBanner';
import LanguageToggle from '../components/LanguageToggle';
import { couleurs, espacements, rayon, ombre } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

// Logo GRP2amiss
const logo = require('../assets/logo.jpg');

export default function LoginScreen({ navigation }) {
  const { connecter } = useAuth();
  const { t } = useTranslation();
  const [numeroCni, setNumeroCni] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [mdpVisible, setMdpVisible] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  async function soumettre() {
    if (!numeroCni || !motDePasse) {
      setErreur(t('erreur') + ': ' + t('cni') + ' & ' + t('motDePasse'));
      return;
    }
    setErreur('');
    setChargement(true);
    try {
      const data = await connecter(numeroCni, motDePasse);
      if (!data.success) setErreur(data.message || t('erreur'));
    } catch (e) {
      setErreur(e?.response?.data?.message || t('erreur'));
    } finally {
      setChargement(false);
    }
  }

  return (
    <View style={styles.conteneurGlobal}>
      <OfflineBanner />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* En-tête avec gradient vert */}
          <LinearGradient colors={[couleurs.vertPrincipal, '#0d592f']} style={styles.entete}>
            <View style={styles.headerTop}>
              <LanguageToggle />
            </View>
            <Image source={logo} style={styles.logoImage} />
            <Text style={styles.titreBlanc}>AMATORA</Text>
            <Text style={styles.sousTitreBlanc}>{t('appSubtitle')}</Text>
          </LinearGradient>

          {/* Carte blanche de formulaire */}
          <View style={styles.carte}>
            <View style={styles.champ}>
              <Ionicons name="card-outline" size={20} color={couleurs.vertPrincipal} style={styles.iconeChamp} />
              <TextInput
                style={styles.input}
                placeholder={t('cni')}
                placeholderTextColor={couleurs.texteMuted || '#aaa'}
                autoCapitalize="none"
                value={numeroCni}
                onChangeText={setNumeroCni}
              />
            </View>

            <View style={styles.champ}>
              <Ionicons name="lock-closed-outline" size={20} color={couleurs.vertPrincipal} style={styles.iconeChamp} />
              <TextInput
                style={styles.input}
                placeholder={t('motDePasse')}
                placeholderTextColor={couleurs.texteMuted || '#aaa'}
                secureTextEntry={!mdpVisible}
                value={motDePasse}
                onChangeText={setMotDePasse}
              />
              <TouchableOpacity onPress={() => setMdpVisible(!mdpVisible)}>
                <Ionicons name={mdpVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={couleurs.texteMuted || '#aaa'} />
              </TouchableOpacity>
            </View>

            {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

            {/* Bouton Se connecter */}
            <TouchableOpacity onPress={soumettre} disabled={chargement}>
              <LinearGradient colors={[couleurs.vertPrincipal, '#0d592f']} style={styles.boutonGradient}>
                <Text style={styles.texteBouton}>
                  {chargement ? t('chargement') : t('connexion')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.lienInscription} onPress={() => navigation.navigate('Inscription')}>
              <Text style={styles.texteLien}>
                {t('pasDeCompte')} <Text style={styles.texteLienGras}>{t('inscription')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneurGlobal: { flex: 1, backgroundColor: couleurs.fond || '#f9f9f9' },
  scroll: { flexGrow: 1 },
  entete: { 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
    paddingHorizontal: espacements.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center' 
  },
  headerTop: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  logoImage: {
    width: 90, height: 90, borderRadius: 45,
    marginBottom: espacements.md,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  titreBlanc: { fontSize: 30, fontWeight: '900', color: couleurs.blanc, letterSpacing: 4, marginBottom: 5 },
  sousTitreBlanc: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  carte: {
    backgroundColor: couleurs.blanc,
    marginHorizontal: espacements.lg,
    marginTop: -40,
    borderRadius: rayon.lg,
    padding: espacements.lg,
    ...ombre.lg,
    marginBottom: espacements.xl,
  },
  champ: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: couleurs.fond || '#f9f9f9', borderRadius: rayon.md,
    paddingHorizontal: espacements.md, paddingVertical: Platform.OS === 'ios' ? 14 : 6,
    marginBottom: espacements.md,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  iconeChamp: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: couleurs.texte },
  erreur: { color: couleurs.danger, fontSize: 14, marginBottom: espacements.md, textAlign: 'center' },
  boutonGradient: {
    paddingVertical: 16,
    borderRadius: rayon.md,
    alignItems: 'center',
    marginTop: 10,
    ...ombre.md,
  },
  texteBouton: { color: couleurs.blanc, fontSize: 16, fontWeight: 'bold' },
  lienInscription: { marginTop: espacements.xl, alignItems: 'center' },
  texteLien: { color: '#666', fontSize: 14.5 },
  texteLienGras: { color: couleurs.vertPrincipal, fontWeight: 'bold' },
});
