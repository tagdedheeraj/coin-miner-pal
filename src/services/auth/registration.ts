
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { auth } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { generateReferralCode } from '@/utils/referral';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const createRegistrationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const db = getFirestore();
  
  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting to sign up with Firebase');
    
    try {
      // First check if email already exists
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(emailQuery);
      
      if (!querySnapshot.empty) {
        throw new Error('auth/email-already-in-use');
      }
      
      // Register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user profile with their name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      console.log('Firebase signup successful, creating user profile...');
      
      // Generate referral code
      const referralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        coins: 200,
        referralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        usdtEarnings: 0,
        notifications: []
      };
      
      // Save to Firestore with snake_case field names
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        name,
        email,
        coins: 200,
        referral_code: referralCode,
        has_setup_pin: false,
        has_biometrics: false,
        withdrawal_address: null,
        usdt_earnings: 0,
        notifications: [],
        is_admin: false,
        created_at: new Date().toISOString()
      });
      
      console.log('User successfully saved to Firestore');
      
      // Save in local state
      setUser(newUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      
      // Return the user credential
      return userCredential;
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'यह ईमेल पहले से पंजीकृत है। कृपया साइन इन करें।';
          toast.error(errorMessage);
          throw new Error(errorMessage);
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
  
  return {
    signUp
  };
};
