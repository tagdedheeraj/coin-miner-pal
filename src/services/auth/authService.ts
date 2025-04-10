
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { Dispatch, SetStateAction } from 'react';

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const authServiceFunctions = (
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  const convertFirebaseUserToAppUser = (firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      coins: 200,
      referralCode: generateReferralCode(),
      hasSetupPin: false,
      hasBiometrics: false,
      withdrawalAddress: null,
      appliedReferralCode: null,
      usdtEarnings: 0,
      notifications: [],
      isAdmin: false,
    };
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Sign-in error:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please sign up.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in with Google successfully');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      toast.success('Account created successfully. Please check your email for verification.');
    } catch (error: any) {
      console.error('Sign-up error:', error);
      let errorMessage = 'Failed to sign up';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      if (!auth.currentUser) throw new Error('Not authenticated');
      
      await updatePassword(auth.currentUser, newPassword);
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast.success('Verification email resent. Please check your inbox.');
      } else {
        toast.error('You need to be logged in to resend verification email.');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to resend verification email');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset instructions have been sent to your email.');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send password reset email');
    }
  };

  return {
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    changePassword,
    resendVerificationEmail,
    resetPassword,
    convertFirebaseUserToAppUser
  };
};
