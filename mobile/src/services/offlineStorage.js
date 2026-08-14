import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheGeoData = async (data) => {
  await AsyncStorage.setItem('amatora_offline_geo', JSON.stringify(data));
};

export const getCachedGeoData = async () => {
  const data = await AsyncStorage.getItem('amatora_offline_geo');
  return data ? JSON.parse(data) : null;
};

export const cacheCandidats = async (data) => {
  await AsyncStorage.setItem('amatora_offline_candidats', JSON.stringify(data));
};

export const getCachedCandidats = async () => {
  const data = await AsyncStorage.getItem('amatora_offline_candidats');
  return data ? JSON.parse(data) : null;
};

export const queueOfflineVote = async (candidatId) => {
  const pending = await getPendingVotes();
  pending.push({ candidatId, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem('amatora_offline_votes', JSON.stringify(pending));
};

export const getPendingVotes = async () => {
  const data = await AsyncStorage.getItem('amatora_offline_votes');
  return data ? JSON.parse(data) : [];
};

export const clearPendingVotes = async () => {
  await AsyncStorage.removeItem('amatora_offline_votes');
};

export const cacheResultats = async (data) => {
  await AsyncStorage.setItem('amatora_offline_resultats', JSON.stringify(data));
};

export const getCachedResultats = async () => {
  const data = await AsyncStorage.getItem('amatora_offline_resultats');
  return data ? JSON.parse(data) : null;
};
