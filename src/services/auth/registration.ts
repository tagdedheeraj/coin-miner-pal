
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { auth } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { toast } from 'sonner';
import { generateReferralCode } from '@/utils/referral';
import { getFirestore, doc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export const createRegistrationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const db = getFirestore();
  
  const signUp = async (name: string, email: string, password: string, referralCode?: string): Promise<void> => {
    setIsLoading(true);
    console.log('Attempting to sign up with Firebase');
    
    try {
      // Register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user profile with their name
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      console.log('Firebase signup successful, creating user profile...');
      
      // Generate referral code
      const newReferralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        coins: 200, // Sign-up bonus
        referralCode: newReferralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        usdtEarnings: 0,
        notifications: [],
        appliedReferralCode: referralCode || undefined
      };
      
      // If referral code is provided, validate and apply it
      if (referralCode) {
        // Find the user with the given referral code
        const usersRef = collection(db, 'users');
        const referrerQuery = query(usersRef, where('referral_code', '==', referralCode));
        const referrerSnapshot = await getDocs(referrerQuery);
        
        if (!referrerSnapshot.empty) {
          const referrerDoc = referrerSnapshot.docs[0];
          const referrerData = referrerDoc.data();
          const referrerNotifications = referrerData.notifications || [];
          const currentCoins = referrerData.coins || 0;
          
          // Update referrer's coins and add notification
          await updateDoc(doc(db, 'users', referrerDoc.id), {
            coins: currentCoins + 250,
            notifications: [
              ...referrerNotifications,
              {
                id: uuidv4(),
                message: `${name} used your referral code! You received 250 bonus coins.`,
                read: false,
                createdAt: new Date().toISOString()
              }
            ]
          });
          
          console.log(`Referral bonus applied for code: ${referralCode}`);
          newUser.appliedReferralCode = referralCode;
        } else {
          console.log(`Invalid referral code: ${referralCode}, ignoring...`);
          newUser.appliedReferralCode = undefined;
        }
      }
      
      // Save to Firestore with snake_case field names
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        name,
        email,
        coins: 200,
        referral_code: newReferralCode,
        has_setup_pin: false,
        has_biometrics: false,
        withdrawal_address: null,
        usdt_earnings: 0,
        notifications: [],
        is_admin: false,
        applied_referral_code: newUser.appliedReferralCode,
        created_at: new Date().toISOString()
      });
      
      console.log('User successfully saved to Firestore');
      
      // Save in local state
      setUser(newUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created successfully! You received 200 coins as a signup bonus.');
      
      // We don't need to return the user credential anymore
      return;
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
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
