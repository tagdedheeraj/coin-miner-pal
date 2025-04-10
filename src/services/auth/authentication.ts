
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockUsers';
import { auth, db } from '@/integrations/firebase/client';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
        console.log('User document not found in Firestore, creating from auth data');
        
        // Create a new user profile if it doesn't exist
        const newUserObj: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: userCredential.user.email || email,
          coins: 200, // Default starting coins
          referralCode: generateRandomCode(),
          hasSetupPin: false,
          hasBiometrics: false,
          withdrawalAddress: null,
          appliedReferralCode: null,
          usdtEarnings: 0,
          notifications: [],
          isAdmin: false
        };
        
        // Save to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: newUserObj.name,
          email: newUserObj.email,
          coins: newUserObj.coins,
          referral_code: newUserObj.referralCode,
          has_setup_pin: newUserObj.hasSetupPin,
          has_biometrics: newUserObj.hasBiometrics,
          withdrawal_address: newUserObj.withdrawalAddress,
          applied_referral_code: newUserObj.appliedReferralCode,
          usdt_earnings: newUserObj.usdtEarnings,
          notifications: newUserObj.notifications,
          is_admin: newUserObj.isAdmin,
          created_at: new Date().toISOString()
        });
        
        setUser(newUserObj);
        localStorage.setItem('user', JSON.stringify(newUserObj));
        toast.success('Signed in successfully. User profile created.');
        return;
      }
      
      // Map the user data
      const userData = userDoc.data();
      const userObj: User = {
        id: userCredential.user.uid,
        name: userData.name || userCredential.user.displayName || email.split('@')[0],
        email: userData.email || userCredential.user.email || email,
        coins: userData.coins || 0,
        referralCode: userData.referral_code || generateRandomCode(),
        hasSetupPin: userData.has_setup_pin || false,
        hasBiometrics: userData.has_biometrics || false,
        withdrawalAddress: userData.withdrawal_address || null,
        appliedReferralCode: userData.applied_referral_code || null,
        usdtEarnings: userData.usdt_earnings || 0,
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
  
  // Helper function to generate a random referral code
  const generateRandomCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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
