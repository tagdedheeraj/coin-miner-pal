
import { useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

interface UseMiningSync {
  isMining: boolean;
  miningProgress: number;
  lastMiningDate: Date | null;
  miningStartTime: Date | null;
  coinsMinedInSession: number;
  totalCoinsFromMining: number;
  initialLoadComplete: boolean;
}

export const useMiningSync = ({
  isMining,
  miningProgress,
  lastMiningDate,
  miningStartTime,
  coinsMinedInSession,
  totalCoinsFromMining,
  initialLoadComplete
}: UseMiningSync) => {
  const { user } = useAuth();

  useEffect(() => {
    const saveMiningStateToFirebase = async () => {
      if (!user?.id || !initialLoadComplete) return;
      
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        await setDoc(miningStateRef, {
          isMining,
          miningProgress,
          lastMiningDate: lastMiningDate?.toISOString() || null,
          miningStartTime: miningStartTime?.toISOString() || null,
          coinsMinedInSession,
          totalCoinsFromMining,
          userId: user.id,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        
        console.log("Saved mining state to Firebase");
      } catch (error) {
        console.error("Error saving mining state to Firebase:", error);
        
        // Fall back to localStorage
        localStorage.setItem('miningState', JSON.stringify({
          isMining,
          miningProgress,
          lastMiningDate: lastMiningDate?.toISOString() || null,
          miningStartTime: miningStartTime?.toISOString() || null,
          coinsMinedInSession,
          totalCoinsFromMining,
          userId: user.id
        }));
      }
    };
    
    saveMiningStateToFirebase();
  }, [
    isMining, 
    miningProgress, 
    lastMiningDate, 
    miningStartTime,
    coinsMinedInSession, 
    totalCoinsFromMining, 
    user?.id,
    initialLoadComplete
  ]);
};
