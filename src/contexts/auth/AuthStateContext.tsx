
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { generateReferralCode } from '@/utils/referral';
import { AuthStateType } from './types';
import { auth } from '@/integrations/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { mapDbToUser } from '@/utils/firebaseUtils';

// Create context for auth state
export const AuthStateContext = createContext<AuthStateType | null>(null);

interface AuthStateProviderProps {
  children: ReactNode;
}

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for user in localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    const db = getFirestore();

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Try to get user profile from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data();
            const fullUser = mapDbToUser({
              id: firebaseUser.uid,
              ...userData
            });
            
            setUser(fullUser);
            localStorage.setItem('user', JSON.stringify(fullUser));
            setIsLoading(false);
            return;
          }
          
          // If not in Firestore, create new user
          const newUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            coins: 200,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
            isAdmin: false,
            usdtEarnings: 0,
            notifications: []
          };
          
          // Save to Firestore
          await setDoc(userRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            coins: 200,
            referral_code: newUser.referralCode,
            has_setup_pin: false,
            has_biometrics: false,
            withdrawal_address: null,
            is_admin: false,
            usdt_earnings: 0,
            notifications: [],
            created_at: new Date().toISOString()
          });
          
          // Save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        } catch (error) {
          console.error('Error getting user data from Firestore:', error);
          // Fallback to basic user
          const basicUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            coins: 200,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
            isAdmin: false,
            usdtEarnings: 0,
            notifications: []
          };
          setUser(basicUser);
          localStorage.setItem('user', JSON.stringify(basicUser));
        }
      } else {
        // User is signed out
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthStateContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = React.useContext(AuthStateContext);
  if (context === null) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
};
