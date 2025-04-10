
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/integrations/firebase/client';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { generateReferralCode } from '@/utils/referral';
import { AuthStateType } from './types';
import { userServiceFunctions } from '@/services/auth/userService';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mapFirebaseToUser, saveUserToFirestore } from '@/utils/firebaseUtils';

// Create context for auth state
export const AuthStateContext = createContext<AuthStateType | null>(null);

interface AuthStateProviderProps {
  children: ReactNode;
}

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize user service to access utility functions
  const userService = userServiceFunctions(user, setUser);

  useEffect(() => {
    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // User exists in Firestore
            const userData = userDoc.data();
            const userObj: User = {
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              coins: userData.coins,
              referralCode: userData.referral_code,
              hasSetupPin: userData.has_setup_pin,
              hasBiometrics: userData.has_biometrics,
              withdrawalAddress: userData.withdrawal_address,
              appliedReferralCode: userData.applied_referral_code,
              usdtEarnings: userData.usdt_earnings,
              notifications: userData.notifications || [],
              isAdmin: userData.is_admin || false
            };
            
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            setIsLoading(false);
            return;
          }
          
          // User not found in Firestore - check localStorage or create new
          const storedUserData = localStorage.getItem('user');
          if (storedUserData) {
            try {
              const parsedStoredUser = JSON.parse(storedUserData) as User;
              if (parsedStoredUser.email === firebaseUser.email) {
                // Save to Firestore for future
                await saveUserToFirestore(parsedStoredUser);
                setUser(parsedStoredUser);
                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing stored user:', error);
            }
          }
          
          // Check mock users
          const mockUser = mockUsers.find(u => u.email === firebaseUser.email);
          if (mockUser) {
            const userObj = {
              id: firebaseUser.uid,
              name: mockUser.name,
              email: mockUser.email,
              coins: mockUser.coins,
              referralCode: mockUser.referralCode,
              hasSetupPin: mockUser.hasSetupPin,
              hasBiometrics: mockUser.hasBiometrics,
              withdrawalAddress: mockUser.withdrawalAddress,
              appliedReferralCode: mockUser.appliedReferralCode,
              usdtEarnings: mockUser.usdtEarnings,
              notifications: mockUser.notifications || [],
              isAdmin: mockUser.isAdmin || false
            };
            
            // Save to Firestore and localStorage
            await saveUserToFirestore(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
            setIsLoading(false);
            return;
          }
          
          // Create new user if not found
          const newUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            coins: 0,
            referralCode: generateReferralCode(),
            hasSetupPin: false,
            hasBiometrics: false,
            withdrawalAddress: null,
            isAdmin: false,
            notifications: []
          };
          
          // Save to Firestore
          await saveUserToFirestore(newUser);
          
          // Save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          setIsLoading(false);
          
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          setIsLoading(false);
        }
      } else {
        // User is signed out
        localStorage.removeItem('user');
        setUser(null);
        setIsLoading(false);
      }
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
