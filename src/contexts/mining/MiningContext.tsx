
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MiningContextType } from './types';
import { useMiningOperations } from './useMiningOperations';
import { loadMiningState, saveMiningState, calculateTimeUntilCompletion } from './utils';
import { useMiningCooldown } from './hooks/useMiningCooldown';
import { useMiningNotifications } from '@/components/mining/MiningNotifications';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const MiningContext = createContext<MiningContextType | undefined>(undefined);

export const MiningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isLoadingMiningState, setIsLoadingMiningState] = useState(true);
  
  const {
    isMining,
    setIsMining,
    miningProgress,
    setMiningProgress,
    coinsMinedInSession,
    setCoinsMinedInSession,
    lastMiningDate,
    setLastMiningDate,
    totalCoinsFromMining,
    setTotalCoinsFromMining,
    miningRate,
    miningStartTime,
    setMiningStartTime
  } = useMiningOperations();

  const { timeUntilNextMining, setTimeUntilNextMining } = useMiningCooldown(lastMiningDate);

  const notifications = useMiningNotifications({
    isMining,
    miningProgress,
    miningRate,
    coinsMinedInSession
  });
  
  // Load mining state from Firebase and fall back to localStorage
  useEffect(() => {
    const loadMiningStateFromFirebase = async () => {
      if (!user?.id) return;
      
      setIsLoadingMiningState(true);
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        const docSnap = await getDoc(miningStateRef);
        
        if (docSnap.exists()) {
          const serverData = docSnap.data();
          
          // Parse the dates from strings to Date objects
          setIsMining(serverData.isMining || false);
          setMiningProgress(serverData.miningProgress || 0);
          setLastMiningDate(serverData.lastMiningDate ? new Date(serverData.lastMiningDate) : null);
          setCoinsMinedInSession(serverData.coinsMinedInSession || 0);
          setTotalCoinsFromMining(serverData.totalCoinsFromMining || 0);
          setMiningStartTime(serverData.miningStartTime ? new Date(serverData.miningStartTime) : null);
          
          console.log("Loaded mining state from Firebase:", serverData);
          
          // If user was mining but app closed, show a notification
          if (serverData.isMining && serverData.miningProgress > 0) {
            notifications.handleMiningContinued();
          }
        } else {
          // Fall back to localStorage
          const savedState = loadMiningState(user.id);
          
          if (savedState) {
            // Restore mining state from localStorage
            setIsMining(savedState.isMining);
            setMiningProgress(savedState.miningProgress);
            setLastMiningDate(savedState.lastMiningDate ? new Date(savedState.lastMiningDate) : null);
            setCoinsMinedInSession(savedState.coinsMinedInSession || 0);
            setTotalCoinsFromMining(savedState.totalCoinsFromMining || 0);
            setMiningStartTime(savedState.miningStartTime ? new Date(savedState.miningStartTime) : null);
            
            // If user was mining but app closed, show a notification
            if (savedState.isMining && savedState.miningProgress > 0 && !savedState.miningStartTime) {
              notifications.handleMiningContinued();
            }
          } else {
            // Reset for new user
            setIsMining(false);
            setMiningProgress(0);
            setTimeUntilNextMining(null);
            setCoinsMinedInSession(0);
            setLastMiningDate(null);
            setTotalCoinsFromMining(0);
            setMiningStartTime(null);
          }
        }
      } catch (error) {
        console.error("Error loading mining state from Firebase:", error);
        // Fall back to localStorage in case of error
        const savedState = loadMiningState(user.id);
        
        if (savedState) {
          // Restore from localStorage
          setIsMining(savedState.isMining);
          setMiningProgress(savedState.miningProgress);
          setLastMiningDate(savedState.lastMiningDate ? new Date(savedState.lastMiningDate) : null);
          setCoinsMinedInSession(savedState.coinsMinedInSession || 0);
          setTotalCoinsFromMining(savedState.totalCoinsFromMining || 0);
          setMiningStartTime(savedState.miningStartTime ? new Date(savedState.miningStartTime) : null);
        }
      } finally {
        setInitialLoadComplete(true);
        setIsLoadingMiningState(false);
      }
    };
    
    loadMiningStateFromFirebase();
  }, [user?.id]);
  
  // Save state to Firebase whenever it changes
  useEffect(() => {
    const saveMiningStateToFirebase = async () => {
      if (!user?.id || !initialLoadComplete) return;
      
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        // Save to Firebase
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
        saveMiningState({
          isMining,
          miningProgress,
          lastMiningDate: lastMiningDate?.toISOString() || null,
          miningStartTime: miningStartTime?.toISOString() || null,
          coinsMinedInSession,
          totalCoinsFromMining
        }, user.id);
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
  
  // Calculate time until mining completes
  const timeUntilMiningCompletes = miningStartTime 
    ? calculateTimeUntilCompletion(miningStartTime.toISOString(), miningProgress) 
    : null;
  
  const startMining = async () => {
    if (timeUntilNextMining !== null) {
      notifications.handleCooldownError();
      return;
    }
    
    const now = new Date();
    setIsMining(true);
    setMiningProgress(0);
    setCoinsMinedInSession(0);
    setMiningStartTime(now);
    notifications.handleMiningStart();
    
    // Also update in Firebase immediately
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
  
  const stopMining = async () => {
    if (!isMining) return;
    
    setIsMining(false);
    setMiningStartTime(null);
    notifications.handleMiningStop();
    
    // Also update in Firebase immediately
    if (user?.id) {
      try {
        const db = getFirestore();
        const miningStateRef = doc(db, 'mining_states', user.id);
        
        await updateDoc(miningStateRef, {
          isMining: false,
          miningStartTime: null,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating mining state in Firebase:", error);
      }
    }
  };
  
  const resetMiningCooldown = async () => {
    setLastMiningDate(null);
    setTimeUntilNextMining(null);
    notifications.handleCooldownReset();
    
    // Also update in Firebase immediately
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
  
  const value = {
    isMining,
    startMining,
    stopMining,
    miningProgress,
    timeUntilNextMining,
    timeUntilMiningCompletes,
    coinsMinedInSession,
    miningRate,
    totalCoinsFromMining,
    resetMiningCooldown,
    miningStartTime,
    isLoadingMiningState
  };
  
  return <MiningContext.Provider value={value}>{children}</MiningContext.Provider>;
};

export const useMining = () => {
  const context = useContext(MiningContext);
  if (context === undefined) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};
