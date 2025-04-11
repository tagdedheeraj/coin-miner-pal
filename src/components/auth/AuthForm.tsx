
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignUp = type === 'sign-up';
  
  const handleSignIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      
      // Give a slight delay before redirect for better UX
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      // Let the form component handle errors
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignUp = async (name: string, email: string, password: string) => {
    setIsSubmitting(true);
    
    try {
      await signUp(name, email, password);
      
      // Give a slight delay before redirect for better UX
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      // Let the form component handle errors
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</CardTitle>
        <CardDescription>
          {isSignUp 
            ? 'Create an account to start mining.' 
            : 'Enter your credentials to access your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isSignUp ? (
          <SignUpForm 
            onSignUp={handleSignUp} 
            isSubmitting={isSubmitting} 
          />
        ) : (
          <SignInForm 
            onSignIn={handleSignIn} 
            isSubmitting={isSubmitting} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
