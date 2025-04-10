
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { generateReferralCode } from '@/utils/referral';
import { AuthStateType } from './types';
import { auth } from '@/integrations/firebase/client';
import { onAuthStateChanged } from 'firebase/auth';

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

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if we have this user in localStorage with the correct email
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          try {
            const parsedStoredUser = JSON.parse(storedUserData) as User;
            if (parsedStoredUser.email === firebaseUser.email) {
              // Make sure the ID matches
              if (parsedStoredUser.id !== firebaseUser.uid) {
                parsedStoredUser.id = firebaseUser.uid;
                localStorage.setItem('user', JSON.stringify(parsedStoredUser));
              }
              setUser(parsedStoredUser);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }

        // If not in localStorage, create new user
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
        
        // Save to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
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
