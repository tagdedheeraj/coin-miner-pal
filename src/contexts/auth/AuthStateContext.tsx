
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { mockUsers } from '@/data/mockUsers';
import { generateReferralCode } from '@/utils/referral';
import { AuthStateType } from './types';
import { userServiceFunctions } from '@/services/auth/userService';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';

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
    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          // Always prioritize getting data from Supabase
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data from Supabase:', error);
            
            // Fallback to localStorage or create new user if not found
            const storedUserData = localStorage.getItem('user');
            if (storedUserData) {
              try {
                const parsedStoredUser = JSON.parse(storedUserData) as User;
                if (parsedStoredUser.email === session.user.email) {
                  setUser(parsedStoredUser);
                  setIsLoading(false);
                  return;
                }
              } catch (error) {
                console.error('Error parsing stored user:', error);
              }
            }

            // If not in Supabase or localStorage, check mock users
            const mockUser = mockUsers.find(u => u.email === session.user.email);
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
              setIsLoading(false);
              return;
            }
            
            // Create new user if not found
            const newUser = {
              id: session.user.id,
              name: session.user.user_metadata?.name || 'New User',
              email: session.user.email || '',
              coins: 0,
              referralCode: generateReferralCode(),
              hasSetupPin: false,
              hasBiometrics: false,
              withdrawalAddress: null,
              isAdmin: false,
              notifications: []
            };
              
            // Save to Supabase
            const userDbData = mapUserToDb(newUser);
            await supabase.from('users').insert(userDbData as any);
              
            // Save to localStorage for persistence
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            setIsLoading(false);
            return;
          }
          
          // User found in Supabase
          const userData = mapDbToUser(data);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
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

    // Initial check for session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Handling session is done in the auth state change handler
      } else {
        // No active session
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
