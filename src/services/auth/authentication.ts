
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockUsers';
import { auth, db } from '@/integrations/firebase/client';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { mapFirebaseToUser } from '@/utils/firebaseUtils';

export const createAuthenticationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Check for admin/mock users first before trying Firebase
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (mockUser) {
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      // Map the user data
      const userData = userDoc.data();
      const userObj: User = {
        id: userCredential.user.uid,
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
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userObj));
      
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign-in error:', error);
      
      let errorMessage = 'Failed to sign in';
      if (error instanceof Error) {
        if (error.message.includes('auth/wrong-password') || 
            error.message.includes('auth/user-not-found')) {
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
  
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };
  
  return {
    signIn,
    signOut
  };
};
