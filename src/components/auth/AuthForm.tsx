
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess?: () => void;
  referralCode?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess, referralCode }) => {
  const { signIn, signUp, isLoading } = useAuth();
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the SignInForm component
      throw error;
    }
  };
  
  const handleSignUp = async (name: string, email: string, password: string, refCode?: string) => {
    try {
      // Pass the referral code correctly to the signUp function
      await signUp(name, email, password, refCode);
      onSuccess?.();
    } catch (error) {
      // Error is handled by the SignUpForm component
      throw error;
    }
  };
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
      {type === 'sign-in' ? (
        <SignInForm 
          onSignIn={handleSignIn} 
          isSubmitting={isLoading} 
        />
      ) : (
        <SignUpForm 
          onSignUp={handleSignUp} 
          isSubmitting={isLoading}
          referralCode={referralCode} 
        />
      )}
    </div>
  );
};

export default AuthForm;
