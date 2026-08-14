import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CONFIGURATION DE L'API
// Changez API_HOST selon votre environnement réseau :
//   - Émulateur Android : http://10.62.230.15:4000
//   - Appareil physique : http://<IP_DE_VOTRE_PC>:4000
//   - Web / iOS Sim     : http://localhost:4000
// ============================================================
export const API_HOST = 'http://10.243.203.15:4000';
export const BASE_URL = `${API_HOST}/api`;

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Ajoute automatiquement le token JWT stocké à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('amatora_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Points de terminaison géographiques ---
export const getProvinces = () => api.get('/geo/provinces');
export const getCommunes = (provinceId) => api.get(`/geo/communes/${provinceId}`);
export const getCollines = (communeId) => api.get(`/geo/collines/${communeId}`);
export const getSousCollines = (collineId) => api.get(`/geo/sous-collines/${collineId}`);

// --- Résultats par zone ---
export const getResultatsParZone = (params) => api.get('/votes/resultats/par-zone', { params });

export default api;
