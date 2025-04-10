
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

interface GoogleSignInButtonProps {
  isSubmitting?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ isSubmitting = false }) => {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Handle the specific unauthorized domain error
      if (error instanceof Error && error.message.includes('auth/unauthorized-domain')) {
        toast({
          title: "Authentication Error",
          description: "This domain is not authorized for Google authentication. Please contact admin or try using a different sign-in method.",
          variant: "destructive"
        });
      } else {
        // For other errors, display a generic message
        toast({
          title: "Sign In Failed",
          description: "Could not sign in with Google. Please try again later.",
          variant: "destructive"
        });
      }
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
