
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ErrorAlert from './ErrorAlert';
import SignInForm, { SignInFormValues } from './SignInForm';
import SignUpForm, { SignUpFormValues } from './SignUpForm';
import VerificationOptions from './VerificationOptions';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  onSuccess: (email: string) => void;
  showVerificationOptions?: boolean;
  verificationEmail?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ 
  type, 
  onSuccess, 
  showVerificationOptions = false,
  verificationEmail = ''
}) => {
  const { signIn, signUp, resendVerificationEmail } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isSignUp = type === 'sign-up';
  
  const handleSignIn = async (values: SignInFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      await signIn(values.email, values.password);
      
      // Give a slight delay before redirect for better UX
      setTimeout(() => {
        onSuccess(values.email);
      }, 500);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      console.log('Starting signup process with:', { name: values.name, email: values.email });
      
      const result = await signUp(values.name, values.email, values.password);
      console.log('Signup successful', result);
      
      // Pass the email to the onSuccess callback for verification messaging
      onSuccess(values.email);
    } catch (error) {
      handleAuthError(error);
    } finally {
      // Ensure loading state is reset even if there's an error
      setIsSubmitting(false);
    }
  };

  const handleAuthError = (error: unknown) => {
    console.error("Auth error:", error);
    
    // Handle network errors separately for better user experience
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        setErrorMessage("Network error. Please check your internet connection and try again.");
      } else if (error.message.includes('already')) {
        setErrorMessage("This email is already registered. Please sign in instead.");
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage('Authentication failed. Please try again later.');
    }
    
    toast({
      title: "Error",
      description: errorMessage || 'Authentication failed',
      variant: "destructive",
    });
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    try {
      await resendVerificationEmail(verificationEmail);
    } catch (error) {
      // Error is already handled in the service function
      console.error("Failed to resend verification email", error);
    }
  };

  // If showing verification options, render the verification options component
  if (showVerificationOptions) {
    return (
      <VerificationOptions
        verificationEmail={verificationEmail}
        onResendVerification={handleResendVerification}
      />
    );
  }

  // Regular auth form
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>{type === 'sign-in' ? 'Sign In' : 'Sign Up'}</CardTitle>
        <CardDescription>
          {type === 'sign-in' ? 'Enter your credentials to access your account.' : 'Create an account to start mining.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <ErrorAlert message={errorMessage || ''} />
        
        {isSignUp ? (
          <SignUpForm onSubmit={handleSignUp} isSubmitting={isSubmitting} />
        ) : (
          <SignInForm onSubmit={handleSignIn} isSubmitting={isSubmitting} />
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
