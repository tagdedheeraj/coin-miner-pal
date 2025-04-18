
import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { loadMiningState } from '../utils';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

export const useInitialMiningState = () => {
  const { user } = useAuth();
  const [isLoadingMiningState, setIsLoadingMiningState] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [miningStateData, setMiningStateData] = useState(null);
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
        console.log("Loaded mining state from Firebase:", serverData);
        
        return {
          isMining: serverData.isMining || false,
          miningProgress: serverData.miningProgress || 0,
          lastMiningDate: serverData.lastMiningDate ? new Date(serverData.lastMiningDate) : null,
          coinsMinedInSession: serverData.coinsMinedInSession || 0,
          totalCoinsFromMining: serverData.totalCoinsFromMining || 0,
          miningStartTime: serverData.miningStartTime ? new Date(serverData.miningStartTime) : null,
        };
      } else {
        console.log("No mining state found in Firebase for user:", user.id);
      }
    } catch (error) {
      console.error("Error loading mining state from Firebase:", error);
    }
    
    // Fall back to localStorage
    const localState = loadMiningState(user.id);
    console.log("Loaded mining state from localStorage:", localState);
    return localState;
  };

  useEffect(() => {
    const initializeMiningState = async () => {
      setIsLoadingMiningState(true);
      const state = await loadMiningStateFromFirebase();
      setMiningStateData(state);
      setIsLoadingMiningState(false);
      setInitialLoadComplete(true);
    };

    if (user?.id) {
      initializeMiningState();
    }
  }, [user?.id]);

  return {
    isLoadingMiningState,
    initialLoadComplete,
    miningStateData,
    loadMiningStateFromFirebase
  };
};
