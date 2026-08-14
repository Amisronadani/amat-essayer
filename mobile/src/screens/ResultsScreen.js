import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Animated, ScrollView, Modal } from 'react-native';
import OfflineBanner from '../components/OfflineBanner';
import { couleurs, espacements, rayon, typo, ombre } from '../theme/colors';
import { useTranslation } from '../i18n';
import { Ionicons } from '@expo/vector-icons';
import api, { getProvinces, getCommunes, getCollines, getSousCollines, getResultatsParZone } from '../services/api';

// Barre animée
const AnimatedBar = ({ percentage, color }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(widthAnim, { toValue: percentage, duration: 800, useNativeDriver: false }).start();
  }, [percentage, widthAnim]);
  return (
    <View style={styles.barreFond}>
      <Animated.View style={[styles.barreRemplie, { width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: color }]} />
    </View>
  );
};

export default function ResultsScreen() {
  const { t } = useTranslation();
  const [ongletActif, setOngletActif] = useState('direct'); // 'direct' ou 'stats'

  // === ONGLET 1 : Résultats en direct ===
  const [resultats, setResultats] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [provinceIdFiltre, setProvinceIdFiltre] = useState(null); // null = national

  // === ONGLET 2 : Statistiques par candidat ===
  const [candidatChoisi, setCandidatChoisi] = useState(null);
  const [statsModal, setStatsModal] = useState(false);
  const [drillLevel, setDrillLevel] = useState('province'); // province, commune, colline, sousColline
  const [drillData, setDrillData] = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillPath, setDrillPath] = useState([]); // breadcrumb [{id, nom, level}]

  // Charger les provinces au montage
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const res = await getProvinces();
      setProvinces(res.data.data || res.data || []);
    } catch (e) {
      console.log('Erreur provinces:', e.message);
    }
  };

  // Charger les résultats (nationaux ou par province)
  const charger = useCallback(async () => {
    try {
      let data;
      if (provinceIdFiltre) {
        const res = await getResultatsParZone({ province_id: provinceIdFiltre });
        data = res.data;
      } else {
        const res = await api.get('/votes/resultats');
        data = res.data;
      }
      if (data.success) {
        const sorted = (data.resultats || []).sort((a, b) => b.pourcentage - a.pourcentage);
        setResultats(sorted);
        setTotalVotes(data.total_votes);
      }
    } catch (e) {
      console.log('Erreur résultats:', e.message);
    } finally {
      setRafraichissement(false);
    }
  }, [provinceIdFiltre]);

  useEffect(() => { charger(); }, [charger]);

  // === Drill-down statistique ===
  const openStats = (candidat) => {
    setCandidatChoisi(candidat);
    setDrillLevel('province');
    setDrillPath([]);
    setStatsModal(true);
    loadDrillData(candidat.id, 'province', {});
  };

  const loadDrillData = async (candidatId, level, filters) => {
    setDrillLoading(true);
    try {
      // Charger les zones de ce niveau
      let zones = [];
      if (level === 'province') {
        const res = await getProvinces();
        zones = res.data.data || res.data || [];
      } else if (level === 'commune') {
        const res = await getCommunes(filters.province_id);
        zones = res.data.data || res.data || [];
      } else if (level === 'colline') {
        const res = await getCollines(filters.commune_id);
        zones = res.data.data || res.data || [];
      } else if (level === 'sousColline') {
        const res = await getSousCollines(filters.colline_id);
        zones = res.data.data || res.data || [];
      }

      // Pour chaque zone, charger le nombre de votes du candidat
      const results = [];
      for (const zone of zones) {
        try {
          const params = { ...filters };
          if (level === 'province') params.province_id = zone.id;
          else if (level === 'commune') params.commune_id = zone.id;
          else if (level === 'colline') params.colline_id = zone.id;
          else if (level === 'sousColline') params.sous_colline_id = zone.id;

          const res = await getResultatsParZone(params);
          const data = res.data;
          const candidatResult = (data.resultats || []).find(r => r.id === candidatId);
          results.push({
            ...zone,
            votes: candidatResult?.nombre_votes || 0,
            pourcentage: candidatResult?.pourcentage || 0,
            totalZone: data.total_votes || 0,
            inscrits: data.stats?.inscrits || 0,
            votants: data.stats?.votants || 0,
          });
        } catch (e) {
          results.push({ ...zone, votes: 0, pourcentage: 0, totalZone: 0, inscrits: 0, votants: 0 });
        }
      }
      // Trier par votes décroissants
      results.sort((a, b) => b.votes - a.votes);
      setDrillData(results);
    } catch (e) {
      console.log('Erreur drill:', e.message);
      setDrillData([]);
    } finally {
      setDrillLoading(false);
    }
  };

  const drillDown = (zone) => {
    const nextLevels = { province: 'commune', commune: 'colline', colline: 'sousColline' };
    const nextLevel = nextLevels[drillLevel];
    if (!nextLevel) return; // Déjà au niveau le plus bas

    const newPath = [...drillPath, { id: zone.id, nom: zone.nom, level: drillLevel }];
    setDrillPath(newPath);
    setDrillLevel(nextLevel);

    // Construire les filtres depuis le chemin
    const filters = {};
    newPath.forEach(p => {
      if (p.level === 'province') filters.province_id = p.id;
      else if (p.level === 'commune') filters.commune_id = p.id;
      else if (p.level === 'colline') filters.colline_id = p.id;
    });

    loadDrillData(candidatChoisi.id, nextLevel, filters);
  };

  const drillBack = () => {
    if (drillPath.length === 0) return;
    const newPath = drillPath.slice(0, -1);
    setDrillPath(newPath);

    const prevLevels = ['province', 'commune', 'colline', 'sousColline'];
    const prevLevel = prevLevels[newPath.length] || 'province';
    setDrillLevel(prevLevel);

    const filters = {};
    newPath.forEach(p => {
      if (p.level === 'province') filters.province_id = p.id;
      else if (p.level === 'commune') filters.commune_id = p.id;
      else if (p.level === 'colline') filters.colline_id = p.id;
    });

    loadDrillData(candidatChoisi.id, prevLevel, filters);
  };

  const levelLabels = {
    province: t('province'),
    commune: t('commune'),
    colline: t('colline'),
    sousColline: t('sousColline'),
  };

  // Province sélectionnée (pour affichage)
  const provinceFiltreNom = provinces.find(p => p.id === provinceIdFiltre)?.nom;

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Onglets */}
      <View style={styles.onglets}>
        <TouchableOpacity
          style={[styles.onglet, ongletActif === 'direct' && styles.ongletActif]}
          onPress={() => setOngletActif('direct')}
        >
          <Ionicons name="bar-chart-outline" size={18} color={ongletActif === 'direct' ? couleurs.vertPrincipal : couleurs.texteMuted} />
          <Text style={[styles.ongletTexte, ongletActif === 'direct' && styles.ongletTexteActif]}>
            {t('resultats')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.onglet, ongletActif === 'stats' && styles.ongletActif]}
          onPress={() => setOngletActif('stats')}
        >
          <Ionicons name="stats-chart-outline" size={18} color={ongletActif === 'stats' ? couleurs.vertPrincipal : couleurs.texteMuted} />
          <Text style={[styles.ongletTexte, ongletActif === 'stats' && styles.ongletTexteActif]}>
            Statistiques
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== ONGLET 1 : Résultats en direct ===== */}
      {ongletActif === 'direct' && (
        <View style={{ flex: 1 }}>
          <View style={styles.entete}>
            <Text style={styles.titrePrincipal}>{t('resultats')} {provinceFiltreNom ? `— ${provinceFiltreNom}` : ''}</Text>
            <Text style={styles.sousTitre}>{totalVotes} {t('voix')}</Text>
          </View>

          {/* Filtres provinces */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtres} contentContainerStyle={{ paddingHorizontal: espacements.md }}>
            <TouchableOpacity
              style={[styles.pill, !provinceIdFiltre && styles.pillActif]}
              onPress={() => setProvinceIdFiltre(null)}
            >
              <Text style={[styles.pillTexte, !provinceIdFiltre && styles.pillTexteActif]}>{t('resultatsNationaux')}</Text>
            </TouchableOpacity>
            {provinces.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.pill, provinceIdFiltre === p.id && styles.pillActif]}
                onPress={() => setProvinceIdFiltre(p.id)}
              >
                <Text style={[styles.pillTexte, provinceIdFiltre === p.id && styles.pillTexteActif]}>{p.nom}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={resultats}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.liste}
            refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={() => { setRafraichissement(true); charger(); }} />}
            renderItem={({ item, index }) => (
              <View style={styles.carte}>
                <View style={[styles.rangBadge, { backgroundColor: item.couleur_parti || couleurs.vertPrincipal }]}>
                  <Text style={styles.rangTexte}>{index + 1}</Text>
                </View>
                <View style={styles.carteContenu}>
                  <View style={styles.ligneEntete}>
                    <View>
                      <Text style={styles.nom}>{item.nom_candidat}</Text>
                      <Text style={styles.parti}>{item.parti_fictif}</Text>
                    </View>
                    <Text style={[styles.pourcentage, { color: item.couleur_parti || couleurs.vertPrincipal }]}>{item.pourcentage || 0}%</Text>
                  </View>
                  <AnimatedBar percentage={item.pourcentage || 0} color={item.couleur_parti || couleurs.vertPrincipal} />
                  <Text style={styles.nombreVotes}>{item.nombre_votes || 0} {t('voix')}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.videContainer}>
                <Ionicons name="pie-chart-outline" size={48} color={couleurs.grisClair} />
                <Text style={styles.videTexte}>Aucun résultat disponible.</Text>
              </View>
            }
          />
        </View>
      )}

      {/* ===== ONGLET 2 : Statistiques par candidat ===== */}
      {ongletActif === 'stats' && (
        <View style={{ flex: 1 }}>
          <View style={styles.entete}>
            <Text style={styles.titrePrincipal}>Statistiques</Text>
            <Text style={styles.sousTitre}>Cliquez sur un candidat pour voir le détail géographique</Text>
          </View>

          <FlatList
            data={resultats}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.liste}
            refreshControl={<RefreshControl refreshing={rafraichissement} onRefresh={() => { setRafraichissement(true); charger(); }} />}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.carteStats} onPress={() => openStats(item)} activeOpacity={0.7}>
                <View style={[styles.avatarCandidat, { backgroundColor: item.couleur_parti || couleurs.vertPrincipal }]}>
                  <Text style={styles.avatarTexte}>{item.nom_candidat ? item.nom_candidat.charAt(item.nom_candidat.length - 1) : '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nom}>{item.nom_candidat}</Text>
                  <Text style={styles.parti}>{item.parti_fictif}</Text>
                  <View style={styles.statsLigne}>
                    <Text style={[styles.statsBadge, { backgroundColor: (item.couleur_parti || couleurs.vertPrincipal) + '20', color: item.couleur_parti || couleurs.vertPrincipal }]}>
                      {item.nombre_votes || 0} {t('voix')}
                    </Text>
                    <Text style={[styles.statsBadge, { backgroundColor: (item.couleur_parti || couleurs.vertPrincipal) + '20', color: item.couleur_parti || couleurs.vertPrincipal }]}>
                      {item.pourcentage || 0}%
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color={couleurs.grisMoyen} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.videContainer}>
                <Ionicons name="analytics-outline" size={48} color={couleurs.grisClair} />
                <Text style={styles.videTexte}>Aucun résultat disponible.</Text>
              </View>
            }
          />
        </View>
      )}

      {/* ===== MODAL DRILL-DOWN ===== */}
      <Modal visible={statsModal} animationType="slide" onRequestClose={() => setStatsModal(false)}>
        <View style={styles.modalConteneur}>
          {/* En-tête */}
          <View style={[styles.modalEntete, { backgroundColor: candidatChoisi?.couleur_parti || couleurs.vertPrincipal }]}>
            <TouchableOpacity onPress={() => setStatsModal(false)} style={styles.modalClose}>
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitre}>{candidatChoisi?.nom_candidat}</Text>
            <Text style={styles.modalSousTitre}>{candidatChoisi?.parti_fictif}</Text>
          </View>

          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={() => { setDrillPath([]); setDrillLevel('province'); loadDrillData(candidatChoisi?.id, 'province', {}); }}>
              <Text style={styles.breadcrumbItem}><Ionicons name="home" size={18} color={couleurs.vertPrincipal} /></Text>
            </TouchableOpacity>
            {drillPath.map((p, i) => (
              <View key={i} style={styles.breadcrumbRow}>
                <Ionicons name="chevron-forward" size={14} color={couleurs.texteMuted} />
                <Text style={styles.breadcrumbItem}>{p.nom}</Text>
              </View>
            ))}
            <Ionicons name="chevron-forward" size={14} color={couleurs.texteMuted} />
            <Text style={[styles.breadcrumbItem, styles.breadcrumbActif]}>{levelLabels[drillLevel]}</Text>
          </View>

          {/* Bouton retour */}
          {drillPath.length > 0 && (
            <TouchableOpacity style={styles.boutonRetour} onPress={drillBack}>
              <Ionicons name="arrow-back" size={18} color={couleurs.vertPrincipal} />
              <Text style={styles.boutonRetourTexte}>{t('precedent')}</Text>
            </TouchableOpacity>
          )}

          {/* Résumé du niveau actuel */}
          {!drillLoading && drillData.length > 0 && (
            <View style={styles.resumeCard}>
              <View style={styles.resumeRow}>
                <View style={styles.resumeStat}>
                  <Text style={styles.resumeValeur}>{drillData.reduce((s, z) => s + z.votes, 0)}</Text>
                  <Text style={styles.resumeLabel}>{t('voix')}</Text>
                </View>
                <View style={styles.resumeStat}>
                  <Text style={styles.resumeValeur}>{drillData.reduce((s, z) => s + z.totalZone, 0)}</Text>
                  <Text style={styles.resumeLabel}>Total</Text>
                </View>
                <View style={styles.resumeStat}>
                  <Text style={styles.resumeValeur}>{drillData.filter(z => z.votes > 0).length}/{drillData.length}</Text>
                  <Text style={styles.resumeLabel}>{levelLabels[drillLevel]}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Liste drill-down */}
          {drillLoading ? (
            <View style={styles.videContainer}>
              <Text style={styles.videTexte}>{t('chargement')}</Text>
            </View>
          ) : (
            <FlatList
              data={drillData}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: espacements.md }}
              renderItem={({ item }) => {
                const canDrill = drillLevel !== 'sousColline';
                const aVote = item.votes > 0;
                return (
                  <TouchableOpacity
                    style={[styles.drillCarte, !aVote && styles.drillCarteNonVote]}
                    onPress={() => canDrill && drillDown(item)}
                    activeOpacity={canDrill ? 0.7 : 1}
                  >
                    {/* Indicateur voté / pas voté */}
                    <View style={[styles.drillIndicateur, { backgroundColor: aVote ? couleurs.vertPrincipal : '#ddd' }]}>
                      <Ionicons name={aVote ? "checkmark" : "remove"} size={14} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.drillNom, !aVote && { color: couleurs.texteMuted }]}>{item.nom}</Text>
                      <View style={styles.drillStats}>
                        <Text style={[styles.drillVotes, !aVote && { color: '#bbb' }]}>{item.votes} {t('voix')}</Text>
                        <Text style={[styles.drillPourcentage, !aVote && { color: '#bbb' }]}>{item.pourcentage}%</Text>
                        <Text style={styles.drillInscrits}>{item.votants}/{item.inscrits} {t('votants')}</Text>
                      </View>
                      <AnimatedBar percentage={item.pourcentage || 0} color={aVote ? (candidatChoisi?.couleur_parti || couleurs.vertPrincipal) : '#ddd'} />
                    </View>
                    {canDrill && <Ionicons name="chevron-forward" size={20} color={couleurs.grisMoyen} style={{ marginLeft: 10 }} />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.videContainer}>
                  <Ionicons name="location-outline" size={40} color={couleurs.grisClair} />
                  <Text style={styles.videTexte}>Aucune donnée</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: couleurs.fond },
  // Onglets
  onglets: { flexDirection: 'row', backgroundColor: couleurs.blanc, ...ombre, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  onglet: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  ongletActif: { borderBottomColor: couleurs.vertPrincipal },
  ongletTexte: { fontSize: 15, fontWeight: '600', color: couleurs.texteMuted },
  ongletTexteActif: { color: couleurs.vertPrincipal, fontWeight: '800' },
  // En-tête
  entete: { padding: espacements.lg, paddingBottom: espacements.sm },
  titrePrincipal: { fontSize: 22, fontWeight: '800', color: couleurs.texte },
  sousTitre: { fontSize: 14, color: couleurs.texteMuted, marginTop: 4 },
  // Filtres provinces
  filtres: { maxHeight: 50, marginBottom: espacements.sm },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: couleurs.grisTresClair, marginRight: 8 },
  pillActif: { backgroundColor: couleurs.vertPrincipal },
  pillTexte: { fontSize: 13, fontWeight: '700', color: couleurs.texte },
  pillTexteActif: { color: couleurs.blanc },
  // Liste
  liste: { paddingHorizontal: espacements.lg, paddingBottom: espacements.xl },
  // Carte résultats
  carte: { flexDirection: 'row', backgroundColor: couleurs.blanc, borderRadius: rayon.lg, padding: espacements.md, marginBottom: espacements.md, ...ombre, alignItems: 'center' },
  rangBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: espacements.md },
  rangTexte: { fontSize: 16, fontWeight: '800', color: '#fff' },
  carteContenu: { flex: 1 },
  ligneEntete: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nom: { fontSize: 16, fontWeight: '800', color: couleurs.texte },
  pourcentage: { fontSize: 20, fontWeight: '900' },
  parti: { fontSize: 12, color: couleurs.texteMuted, marginBottom: 6 },
  barreFond: { height: 8, borderRadius: 4, backgroundColor: couleurs.grisTresClair, overflow: 'hidden', marginTop: 4 },
  barreRemplie: { height: 8, borderRadius: 4 },
  nombreVotes: { fontSize: 11, fontWeight: '600', color: couleurs.texteMuted, marginTop: 6, textAlign: 'right' },
  // Carte statistiques
  carteStats: { flexDirection: 'row', backgroundColor: couleurs.blanc, borderRadius: rayon.lg, padding: espacements.md, marginBottom: espacements.md, ...ombre, alignItems: 'center' },
  avatarCandidat: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: espacements.md },
  avatarTexte: { color: '#fff', fontWeight: '800', fontSize: 22 },
  statsLigne: { flexDirection: 'row', gap: 8, marginTop: 6 },
  statsBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  // Modal
  modalConteneur: { flex: 1, backgroundColor: couleurs.fond },
  modalEntete: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: espacements.lg, alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, left: 20 },
  modalTitre: { fontSize: 24, fontWeight: '900', color: '#fff' },
  modalSousTitre: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  // Breadcrumb
  breadcrumb: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: espacements.lg, paddingVertical: 10, flexWrap: 'wrap', gap: 2 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  breadcrumbItem: { fontSize: 13, color: couleurs.texteMuted, fontWeight: '600' },
  breadcrumbActif: { color: couleurs.vertPrincipal, fontWeight: '800' },
  boutonRetour: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: espacements.lg, paddingBottom: 8 },
  boutonRetourTexte: { color: couleurs.vertPrincipal, fontWeight: '700', fontSize: 14 },
  // Drill cards
  drillCarte: { flexDirection: 'row', alignItems: 'center', backgroundColor: couleurs.blanc, borderRadius: rayon.md, padding: espacements.md, marginBottom: 8, ...ombre },
  drillNom: { fontSize: 15, fontWeight: '700', color: couleurs.texte, marginBottom: 4 },
  drillStats: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  drillVotes: { fontSize: 13, fontWeight: '700', color: couleurs.vertPrincipal },
  drillPourcentage: { fontSize: 13, fontWeight: '700', color: couleurs.texte },
  drillInscrits: { fontSize: 12, color: couleurs.texteMuted },
  drillCarteNonVote: { opacity: 0.6, borderLeftWidth: 3, borderLeftColor: '#ddd' },
  drillIndicateur: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  // Résumé
  resumeCard: { marginHorizontal: espacements.lg, marginBottom: 8, backgroundColor: couleurs.blanc, borderRadius: rayon.md, padding: espacements.md, ...ombre },
  resumeRow: { flexDirection: 'row', justifyContent: 'space-around' },
  resumeStat: { alignItems: 'center' },
  resumeValeur: { fontSize: 20, fontWeight: '900', color: couleurs.vertPrincipal },
  resumeLabel: { fontSize: 11, color: couleurs.texteMuted, fontWeight: '600', marginTop: 2 },
  // Vide
  videContainer: { alignItems: 'center', marginTop: 60, gap: espacements.md },
  videTexte: { fontSize: 16, color: couleurs.texteMuted, textAlign: 'center' },
});
