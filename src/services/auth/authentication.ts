
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { auth } from '@/integrations/firebase/client';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockUsers';

export const createAuthenticationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log('Starting sign-in process for email:', email);
      // Check for admin/mock users first before trying Firebase
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
        console.log('Mock user found, signing in with mock data');
        // Convert mock user to User type
        const userObj: User = {
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
          notifications: mockUser.notifications || [],
          isAdmin: mockUser.isAdmin || false,
        };
        
        setUser(userObj);
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userObj));
        
        toast.success('Signed in successfully');
        setIsLoading(false);
        return;
      }
      
      // If not a mock user, proceed with Firebase authentication
      console.log('Attempting Firebase sign in for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase sign in successful, user ID:', firebaseUser.uid);
      
      // Check if we already have user data saved
      const storedUserData = localStorage.getItem('user');
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData) as User;
          if (parsedUser.email === email) {
            // Update the ID to match Firebase UID
            parsedUser.id = firebaseUser.uid;
            setUser(parsedUser);
            localStorage.setItem('user', JSON.stringify(parsedUser));
            toast.success('Signed in successfully');
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      
      // If we don't have user data, create new user profile
      const userObj: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: email,
        coins: 200, // Sign-up bonus
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        usdtEarnings: 0,
        notifications: []
      };
      
      console.log('Created new user profile:', userObj);
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign-in error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error instanceof Error) {
        console.log('Error message:', error.message);
        if (error.message.includes('auth/user-not-found') || 
            error.message.includes('auth/wrong-password') || 
            error.message.includes('auth/invalid-credential')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = () => {
    firebaseSignOut(auth).then(() => {
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Signed out successfully');
    }).catch(error => {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    });
  };
  
  return {
    signIn,
    signOut
  };
};
