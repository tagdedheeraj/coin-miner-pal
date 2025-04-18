
import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { loadMiningState } from '../utils';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

export const useInitialMiningState = () => {
  const { user } = useAuth();
  const [isLoadingMiningState, setIsLoadingMiningState] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const notifications = useMiningNotifications({
    isMining: false,
    miningProgress: 0,
    miningRate: 0,
    coinsMinedInSession: 0
  });

  const loadMiningStateFromFirebase = async () => {
    if (!user?.id) return null;
    
    try {
      const db = getFirestore();
      const miningStateRef = doc(db, 'mining_states', user.id);
      const docSnap = await getDoc(miningStateRef);
      
      if (docSnap.exists()) {
        const serverData = docSnap.data();
        return {
          isMining: serverData.isMining || false,
          miningProgress: serverData.miningProgress || 0,
          lastMiningDate: serverData.lastMiningDate ? new Date(serverData.lastMiningDate) : null,
          coinsMinedInSession: serverData.coinsMinedInSession || 0,
          totalCoinsFromMining: serverData.totalCoinsFromMining || 0,
          miningStartTime: serverData.miningStartTime ? new Date(serverData.miningStartTime) : null,
        };
      }
    } catch (error) {
      console.error("Error loading mining state from Firebase:", error);
    }
    
    // Fall back to localStorage
    return loadMiningState(user.id);
  };

  useEffect(() => {
    const initializeMiningState = async () => {
      setIsLoadingMiningState(true);
      const state = await loadMiningStateFromFirebase();
      setIsLoadingMiningState(false);
      setInitialLoadComplete(true);
      return state;
    };

    initializeMiningState();
  }, [user?.id]);

  return {
    isLoadingMiningState,
    initialLoadComplete,
    loadMiningStateFromFirebase
  };
};
