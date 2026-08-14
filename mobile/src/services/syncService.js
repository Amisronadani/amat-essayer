import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPendingVotes, clearPendingVotes, cacheCandidats, cacheResultats } from './offlineStorage';

export const syncPendingVotes = async (api) => {
  const pendingVotes = await getPendingVotes();
  if (pendingVotes.length === 0) return;

  try {
    for (const vote of pendingVotes) {
      try {
        await api.post('/votes', { candidatId: vote.candidatId });
      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message.includes('déjà')) {
           // On ignore ce vote s'il a déjà été enregistré
        } else {
           throw error;
        }
      }
    }
    await clearPendingVotes();
    await AsyncStorage.setItem('amatora_offline_last_sync', new Date().toISOString());
  } catch (error) {
    console.error('Erreur lors de la synchronisation des votes:', error);
  }
};

export const refreshCachedData = async (api) => {
  try {
    const candidatsRes = await api.get('/candidats');
    await cacheCandidats(candidatsRes.data);

    const resultatsRes = await api.get('/votes/resultats/nationaux');
    await cacheResultats(resultatsRes.data);
    
    await AsyncStorage.setItem('amatora_offline_last_sync', new Date().toISOString());
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données en cache:', error);
  }
};
