import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { couleurs, espacements, rayon, ombre, typo } from '../theme/colors';
import { getProvinces, getCommunes, getCollines, getSousCollines } from '../services/api';
import { useTranslation } from '../i18n';

export default function LocationPicker({ values, onChange, disabled }) {
  const { t } = useTranslation();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(null); // 'province', 'commune', 'colline', 'sousColline'
  
  const [data, setData] = useState({
    province: [],
    commune: [],
    colline: [],
    sousColline: []
  });
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Récupération initiale des provinces
  useEffect(() => {
    fetchData('province');
  }, []);

  // Récupération des communes quand la province change
  useEffect(() => {
    if (values.province?.id || values.province?._id) {
      fetchData('commune', values.province.id || values.province._id);
    } else {
      setData(prev => ({ ...prev, commune: [], colline: [], sousColline: [] }));
    }
  }, [values.province]);

  // Récupération des collines
  useEffect(() => {
    if (values.commune?.id || values.commune?._id) {
      fetchData('colline', values.commune.id || values.commune._id);
    } else {
      setData(prev => ({ ...prev, colline: [], sousColline: [] }));
    }
  }, [values.commune]);

  // Récupération des sous-collines
  useEffect(() => {
    if (values.colline?.id || values.colline?._id) {
      fetchData('sousColline', values.colline.id || values.colline._id);
    } else {
      setData(prev => ({ ...prev, sousColline: [] }));
    }
  }, [values.colline]);

  const fetchData = async (type, parentId = null) => {
    setLoading(true);
    try {
      let res;
      if (type === 'province') res = await getProvinces();
      if (type === 'commune') res = await getCommunes(parentId);
      if (type === 'colline') res = await getCollines(parentId);
      if (type === 'sousColline') res = await getSousCollines(parentId);
      
      setData(prev => ({ ...prev, [type]: res.data.data || res.data || [] }));
    } catch (error) {
      console.error(`Erreur de chargement pour ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (step) => {
    if (disabled) return;
    setCurrentStep(step);
    setSearch('');
    setModalVisible(true);
  };

  const handleSelect = (item) => {
    onChange(currentStep, item);
    
    // Réinitialise les enfants
    if (currentStep === 'province') {
      onChange('commune', null);
      onChange('colline', null);
      onChange('sousColline', null);
    } else if (currentStep === 'commune') {
      onChange('colline', null);
      onChange('sousColline', null);
    } else if (currentStep === 'colline') {
      onChange('sousColline', null);
    }
    
    setModalVisible(false);
  };

  const renderSelector = (step, label, value, dependsOn = null) => {
    const isLocked = dependsOn !== null && !values[dependsOn];
    return (
      <TouchableOpacity 
        style={[styles.selector, (disabled || isLocked) && styles.selectorDisabled]} 
        onPress={() => openModal(step)}
        disabled={disabled || isLocked}
        activeOpacity={0.7}
      >
        <View style={styles.selectorTextContainer}>
          <Text style={styles.selectorLabel}>{label}</Text>
          <Text style={[styles.selectorValue, !value && styles.selectorPlaceholder]} numberOfLines={1}>
            {value ? (value.nom || value.name) : t('selectionner') || 'Sélectionner...'}
          </Text>
        </View>
        <Ionicons name={isLocked ? "lock-closed-outline" : "chevron-down"} size={20} color={couleurs.grisMoyen} />
      </TouchableOpacity>
    );
  };

  const currentData = currentStep ? data[currentStep].filter(item => 
    (item.nom || item.name || '').toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <View style={styles.container}>
      {renderSelector('province', t('province') || 'Province', values.province)}
      {renderSelector('commune', t('commune') || 'Commune', values.commune, 'province')}
      {renderSelector('colline', t('colline') || 'Colline', values.colline, 'commune')}
      {renderSelector('sousColline', t('sousColline') || 'Sous-colline', values.sousColline, 'colline')}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('selectionner') || 'Sélectionner'} {currentStep}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Ionicons name="close" size={24} color={couleurs.texte} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={couleurs.grisMoyen} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('rechercher') || 'Rechercher...'}
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={couleurs.grisClair}
                autoCapitalize="none"
              />
            </View>
            
            {loading ? (
              <ActivityIndicator style={styles.loader} color={couleurs.vertPrincipal} size="large" />
            ) : (
              <FlatList
                data={currentData}
                keyExtractor={(item, index) => (item.id || item._id || index).toString()}
                renderItem={({ item }) => {
                  const itemId = item.id || item._id;
                  const isSelected = values[currentStep]?.id === itemId || values[currentStep]?._id === itemId;
                  return (
                    <TouchableOpacity 
                      style={[styles.listItem, isSelected && styles.listItemSelected]} 
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
                        {item.nom || item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={couleurs.vertPrincipal} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>{t('aucun_resultat') || 'Aucun résultat'}</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: espacements.md,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: couleurs.blanc,
    padding: espacements.md,
    borderRadius: rayon.md,
    borderWidth: 1.5,
    borderColor: couleurs.grisTresClair,
    ...ombre,
  },
  selectorDisabled: {
    backgroundColor: couleurs.fond,
    borderColor: couleurs.grisTresClair,
    opacity: 0.6,
  },
  selectorTextContainer: {
    flex: 1,
    marginRight: espacements.sm,
  },
  selectorLabel: {
    fontSize: 12,
    color: couleurs.texteMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  selectorValue: {
    ...typo.corps,
    fontWeight: '600',
    color: couleurs.texte,
  },
  selectorPlaceholder: {
    color: couleurs.grisClair,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: couleurs.blanc,
    borderTopLeftRadius: rayon.lg,
    borderTopRightRadius: rayon.lg,
    height: '75%',
    padding: espacements.md,
    paddingBottom: 0,
    ...ombre,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacements.lg,
    paddingTop: espacements.xs,
  },
  modalTitle: {
    ...typo.section,
    textTransform: 'capitalize',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: couleurs.fond,
    borderRadius: rayon.md,
    paddingHorizontal: espacements.sm,
    marginBottom: espacements.md,
    borderWidth: 1,
    borderColor: couleurs.grisTresClair,
  },
  searchIcon: {
    marginRight: espacements.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: espacements.sm,
    ...typo.corps,
    color: couleurs.texte,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: espacements.xl * 2,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: espacements.md,
    paddingHorizontal: espacements.sm,
    borderBottomWidth: 1,
    borderBottomColor: couleurs.grisTresClair,
  },
  listItemSelected: {
    backgroundColor: couleurs.vertClair,
    borderRadius: rayon.sm,
    borderBottomWidth: 0,
    marginBottom: 1,
  },
  listItemText: {
    ...typo.corps,
    color: couleurs.texte,
  },
  listItemTextSelected: {
    fontWeight: '700',
    color: couleurs.vertPrincipal,
  },
  emptyText: {
    textAlign: 'center',
    color: couleurs.texteMuted,
    marginTop: espacements.xl,
    fontStyle: 'italic',
  }
});
