
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

interface GoogleSignInButtonProps {
  isSubmitting?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ isSubmitting = false }) => {
  const { signInWithGoogle } = useAuth();
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already handled in the service function
      console.error('Google sign in error:', error);
    }
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      className="w-full"
    >
      <Mail className="mr-2 h-4 w-4" />
      Continue with Gmail
    </Button>
  );
};

export default GoogleSignInButton;
