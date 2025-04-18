
import { useAuth } from '@/hooks/useAuth';
import { getFirestore, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';

interface UseMiningActionsProps {
  setIsMining: (value: boolean) => void;
  setMiningProgress: (value: number) => void;
  setCoinsMinedInSession: (value: number) => void;
  setMiningStartTime: (value: Date | null) => void;
  setLastMiningDate: (value: Date | null) => void;
  setTimeUntilNextMining: (value: number | null) => void;
}

export const useMiningActions = ({
  setIsMining,
  setMiningProgress,
  setCoinsMinedInSession,
  setMiningStartTime,
  setLastMiningDate,
  setTimeUntilNextMining
}: UseMiningActionsProps) => {
  const { user } = useAuth();
  const notifications = useMiningNotifications({
    isMining: false,
    miningProgress: 0,
    miningRate: 0,
    coinsMinedInSession: 0
  });

  const startMining = async () => {
    const now = new Date();
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    setMiningStartTime(now);
    notifications.handleMiningStart();
    
    if (user?.id) {
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        await setDoc(miningStateRef, {
          isMining: true,
          miningProgress: 0,
          coinsMinedInSession: 0,
          miningStartTime: now.toISOString(),
          userId: user.id,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        console.error("Error updating mining state in Firebase:", error);
      }
    }
  };

  const resetMiningCooldown = async () => {
    setLastMiningDate(null);
    setTimeUntilNextMining(null);
    notifications.handleCooldownReset();
    
    if (user?.id) {
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        await updateDoc(miningStateRef, {
          lastMiningDate: null,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating mining state in Firebase:", error);
      }
    }
  };

  return {
    startMining,
    resetMiningCooldown
  };
};
