
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { generateReferralCode } from '@/utils/referral';
import { AuthStateType } from './types';

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
        return;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        // Check if we have this user in localStorage with the correct email
        const storedUserData = localStorage.getItem('user');
        if (storedUserData) {
          try {
            const parsedStoredUser = JSON.parse(storedUserData) as User;
            if (parsedStoredUser.email === firebaseUser.email) {
              setUser(parsedStoredUser);
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }

        // If not in localStorage, check mock users
        const mockUser = mockUsers.find(u => u.email === firebaseUser.email);
        if (mockUser) {
          const userObj = {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            coins: mockUser.coins,
            referralCode: mockUser.referralCode,
            hasSetupPin: mockUser.hasSetupPin,
            hasBiometrics: mockUser.hasBiometrics,
            withdrawalAddress: mockUser.withdrawalAddress,
            appliedReferralCode: mockUser.appliedReferralCode,
            usdtEarnings: mockUser.usdtEarnings,
            notifications: mockUser.notifications,
            isAdmin: mockUser.isAdmin
          };
          
          // Save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userObj));
          setUser(userObj);
        } else {
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
            isAdmin: false
          };
          
          // Save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        }
      } else {
        // User is signed out
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthStateContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = React.useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
};
