
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { generateReferralCode } from '@/utils/referral';
import { auth, db } from '@/integrations/firebase/client';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { saveUserToFirestore } from '@/utils/firebaseUtils';

export const createRegistrationService = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    console.log('Attempting to sign up with Firebase');
    
    try {
      // Check if user already exists with this email in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      // Register with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      console.log('Firebase signup successful, creating user profile...');
      
      // Generate referral code
      const referralCode = generateReferralCode();
      
      // Create user profile
      const newUser: User = {
        id: userCredential.user.uid,
        name,
        email,
        coins: 200, // Sign-up bonus
        referralCode,
        hasSetupPin: false,
        hasBiometrics: false,
        withdrawalAddress: null,
        appliedReferralCode: null,
        usdtEarnings: 0,
        notifications: [],
        isAdmin: false
      };
      
      // Store in Firestore directly with document ID matching the auth user ID
      console.log('Creating user profile in Firestore');
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      
      // Format the data for Firestore storage
      const userData = {
        name: newUser.name,
        email: newUser.email,
        coins: newUser.coins,
        referral_code: newUser.referralCode,
        has_setup_pin: newUser.hasSetupPin,
        has_biometrics: newUser.hasBiometrics,
        withdrawal_address: newUser.withdrawalAddress,
        applied_referral_code: newUser.appliedReferralCode,
        usdt_earnings: newUser.usdtEarnings,
        notifications: newUser.notifications,
        is_admin: newUser.isAdmin,
        created_at: new Date().toISOString()
      };
      
      // Create the user document in Firestore
      await setDoc(userDocRef, userData);
      
      try {
        // Use actionCodeSettings to set allowed domains
        const actionCodeSettings = {
          url: window.location.origin + '/auth/callback',
          // This must be true for email verification
          handleCodeInApp: true,
        };
        
        // Send verification email with action code settings
        await sendEmailVerification(userCredential.user, actionCodeSettings);
      } catch (verificationError) {
        console.error('Error sending verification email:', verificationError);
        // Don't throw here, as we still want the user to be created
        toast.error('Account created, but could not send verification email. Please contact support.');
      }
      
      // Store in local state and localStorage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success('Account created! Please check your email to verify your account.');
      
      // Return the user credential
      return userCredential;
    } catch (error) {
      console.error('Signup process error:', error);
      
      let errorMessage = 'Failed to sign up';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('auth/unauthorized-continue-uri')) {
          errorMessage = 'Authentication domain not configured. Please contact support or try using another browser.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      // Make sure to reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      // Get current user
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Use actionCodeSettings to set allowed domains
      const actionCodeSettings = {
        url: window.location.origin + '/auth/callback',
        // This must be true for email verification
        handleCodeInApp: true,
      };
      
      await sendEmailVerification(currentUser, actionCodeSettings);
      
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      let errorMessage = 'Failed to send verification email';
      if (error instanceof Error) {
        if (error.message.includes('auth/unauthorized-continue-uri')) {
          errorMessage = 'Authentication domain not configured. Please try using another browser or contact support.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      throw error;
    }
  };
  
  return {
    signUp,
    resendVerificationEmail
  };
};
