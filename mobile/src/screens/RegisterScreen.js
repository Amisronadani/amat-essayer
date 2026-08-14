import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, TouchableOpacity, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import LanguageToggle from '../components/LanguageToggle';
import LocationPicker from '../components/LocationPicker';
import { couleurs, espacements, rayon, ombre } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const { inscrire } = useAuth();
  const { t } = useTranslation();
  
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', numero_cni: '', age: '' });
  const [location, setLocation] = useState({ province: null, commune: null, colline: null, sousColline: null });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  
  // Animation pour la transition des étapes
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -(etape - 1) * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [etape, slideAnim]);

  // Fonction de mise à jour des champs
  function majChamp(champ, valeur) {
    setForm((precedent) => ({ ...precedent, [champ]: valeur }));
  }

  function etapeSuivante() {
    if (etape === 1) {
      if (!form.nom || !form.prenom || !form.mot_de_passe) {
        setErreur('Veuillez remplir le nom, prénom et mot de passe.');
        return;
      }
    } else if (etape === 2) {
      if (!form.numero_cni || !form.age) {
        setErreur('Veuillez fournir votre numéro de CNI et votre âge.');
        return;
      }
      if (Number(form.age) < 18) {
        setErreur('Vous devez avoir au moins 18 ans pour vous inscrire.');
        return;
      }
    }
    setErreur('');
    setEtape(etape + 1);
  }

  function etapePrecedente() {
    setErreur('');
    setEtape(etape - 1);
  }

  async function soumettre() {
    if (!location.province) {
      setErreur(t('register.error_step3', 'Veuillez sélectionner votre province.'));
      return;
    }
    setErreur('');
    setChargement(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        province_id: location.province?.id || null,
        commune_id: location.commune?.id || null,
        colline_id: location.colline?.id || null,
        sous_colline_id: location.sousColline?.id || null,
      };
      const data = await inscrire(payload);
      if (!data.success) setErreur(data.message || t('register.error_failed', 'Inscription impossible.'));
    } catch (e) {
      setErreur(e?.response?.data?.message || t('register.error_server', 'Connexion au serveur impossible.'));
    } finally {
      setChargement(false);
    }
  }

  const renderIndicateurEtape = () => (
    <View style={styles.indicateurConteneur}>
      {[1, 2, 3].map((num) => (
        <React.Fragment key={num}>
          <View style={[styles.cercleEtape, etape >= num && styles.cercleEtapeActif]}>
            <Text style={[styles.texteEtape, etape >= num && styles.texteEtapeActif]}>{num}</Text>
          </View>
          {num < 3 && <View style={[styles.ligneEtape, etape > num && styles.ligneEtapeActif]} />}
        </React.Fragment>
      ))}
    </View>
  );


  return (
    <View style={styles.conteneurGlobal}>
      <LinearGradient colors={[couleurs.vertPrincipal, '#0d592f']} style={styles.enteteGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={couleurs.blanc} />
          </TouchableOpacity>
          <LanguageToggle />
        </View>
        <Text style={styles.titreEntete}>{t('inscription')}</Text>
        {renderIndicateurEtape()}
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.carteConteneur}>
          <Animated.View style={[styles.sliderConteneur, { transform: [{ translateX: slideAnim }] }]}>
            
            {/* Etape 1 */}
            <ScrollView contentContainerStyle={styles.etapeControle}>
              <Text style={styles.titreEtape}>1. {t('etapeIdentite')}</Text>
              <Champ icone="person-outline" placeholder={t('nom')} valeur={form.nom} onChange={(v) => majChamp('nom', v)} />
              <Champ icone="person-outline" placeholder={t('prenom')} valeur={form.prenom} onChange={(v) => majChamp('prenom', v)} />
              <Champ icone="mail-outline" placeholder={t('email')} valeur={form.email} onChange={(v) => majChamp('email', v)} clavier="email-address" />
              <Champ icone="lock-closed-outline" placeholder={t('motDePasse')} valeur={form.mot_de_passe} onChange={(v) => majChamp('mot_de_passe', v)} secret />
            </ScrollView>

            {/* Etape 2 */}
            <ScrollView contentContainerStyle={styles.etapeControle}>
              <Text style={styles.titreEtape}>2. {t('etapeCNI')}</Text>
              <Champ icone="card-outline" placeholder={t('numeroCNI')} valeur={form.numero_cni} onChange={(v) => majChamp('numero_cni', v)} />
              <Champ icone="calendar-outline" placeholder={t('age')} valeur={form.age} onChange={(v) => majChamp('age', v)} clavier="number-pad" />
            </ScrollView>

            {/* Etape 3 */}
            <ScrollView contentContainerStyle={styles.etapeControle}>
              <Text style={styles.titreEtape}>3. {t('etapeLocalisation')}</Text>
              <LocationPicker
                values={location}
                onChange={(step, item) => setLocation(prev => ({ ...prev, [step]: item }))}
              />
            </ScrollView>

          </Animated.View>

          {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

          <View style={styles.actionsConteneur}>
            {etape > 1 ? (
              <TouchableOpacity style={styles.boutonSecondaire} onPress={etapePrecedente}>
                <Text style={styles.texteBoutonSecondaire}>{t('precedent')}</Text>
              </TouchableOpacity>
            ) : <View style={{ flex: 1 }} />}

            {etape < 3 ? (
              <TouchableOpacity style={styles.boutonPrincipal} onPress={etapeSuivante}>
                <Text style={styles.texteBoutonPrincipal}>{t('suivant')}</Text>
                <Ionicons name="arrow-forward" size={18} color={couleurs.blanc} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.boutonValider} onPress={soumettre} disabled={chargement}>
                <Text style={styles.texteBoutonPrincipal}>
                  {chargement ? t('chargement') : t('inscription')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Composant pour les champs de saisie
function Champ({ icone, placeholder, valeur, onChange, secret, clavier }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <View style={styles.champ}>
      <Ionicons name={icone} size={20} color={couleurs.vertPrincipal} style={styles.iconeChamp} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        secureTextEntry={secret && !visible}
        keyboardType={clavier}
        autoCapitalize="none"
        value={valeur}
        onChangeText={onChange}
      />
      {secret && (
        <TouchableOpacity onPress={() => setVisible(!visible)}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color="#aaa" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneurGlobal: { flex: 1, backgroundColor: couleurs.fond || '#f9f9f9' },
  enteteGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: espacements.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titreEntete: { fontSize: 26, fontWeight: 'bold', color: couleurs.blanc, marginBottom: 20, textAlign: 'center' },
  
  // Style de l'indicateur d'étapes
  indicateurConteneur: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cercleEtape: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  cercleEtapeActif: { backgroundColor: couleurs.blanc },
  texteEtape: { color: couleurs.blanc, fontWeight: 'bold' },
  texteEtapeActif: { color: couleurs.vertPrincipal },
  ligneEtape: { width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 5 },
  ligneEtapeActif: { backgroundColor: couleurs.blanc },

  carteConteneur: {
    flex: 1,
    backgroundColor: couleurs.blanc,
    marginTop: -20,
    borderTopLeftRadius: rayon.xl,
    borderTopRightRadius: rayon.xl,
    paddingTop: espacements.xl,
    ...ombre.md,
  },
  sliderConteneur: { flexDirection: 'row', width: width * 3, flex: 1 },
  etapeControle: { width: width, paddingHorizontal: espacements.lg, paddingBottom: espacements.xl },
  titreEtape: { fontSize: 20, fontWeight: '700', color: couleurs.texte, marginBottom: espacements.lg },
  
  champ: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: couleurs.fond || '#f9f9f9', borderRadius: rayon.md,
    paddingHorizontal: espacements.md, paddingVertical: Platform.OS === 'ios' ? 14 : 6,
    marginBottom: espacements.md,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  iconeChamp: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: couleurs.texte },
  erreur: { color: couleurs.danger, fontSize: 14, marginHorizontal: espacements.lg, textAlign: 'center', marginBottom: 10 },
  
  actionsConteneur: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: espacements.lg, paddingBottom: espacements.xxl },
  boutonSecondaire: {
    flex: 1, paddingVertical: 14, marginRight: 10, borderRadius: rayon.md,
    backgroundColor: couleurs.fond || '#f9f9f9', alignItems: 'center', justifyContent: 'center',
  },
  texteBoutonSecondaire: { color: couleurs.texte, fontSize: 16, fontWeight: '600' },
  boutonPrincipal: {
    flex: 1, flexDirection: 'row', paddingVertical: 14, marginLeft: 10, borderRadius: rayon.md,
    backgroundColor: couleurs.vertPrincipal, alignItems: 'center', justifyContent: 'center',
    ...ombre.sm,
  },
  boutonValider: {
    flex: 1, paddingVertical: 14, marginLeft: 10, borderRadius: rayon.md,
    backgroundColor: '#0d592f', alignItems: 'center', justifyContent: 'center',
    ...ombre.sm,
  },
  texteBoutonPrincipal: { color: couleurs.blanc, fontSize: 16, fontWeight: 'bold' },
});
