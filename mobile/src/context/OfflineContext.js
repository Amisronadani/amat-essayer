import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_HOST } from '../services/api';
import { getPendingVotes } from '../services/offlineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingVotes, setPendingVotes] = useState(0);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Ping backend to check if reachable
        const response = await fetch(`${API_HOST}/`, { method: 'HEAD', timeout: 5000 });
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const intervalId = setInterval(checkConnection, 10000);
    checkConnection();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateStats = async () => {
      const votes = await getPendingVotes();
      setPendingVotes(votes.length);
      const sync = await AsyncStorage.getItem('amatora_offline_last_sync');
      if (sync) setLastSync(sync);
    };
    
    const statsIntervalId = setInterval(updateStats, 5000);
    updateStats();
    
    return () => clearInterval(statsIntervalId);
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, pendingVotes, lastSync }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
