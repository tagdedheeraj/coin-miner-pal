
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface GoogleSignInButtonProps {
  isSubmitting?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ isSubmitting = false }) => {
  const { signInWithGoogle } = useAuth();
  
  const handleGmailSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };
  
  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGmailSignIn}
      disabled={isSubmitting}
      className="w-full"
    >
      <Mail className="mr-2 h-4 w-4" />
      Continue with Gmail
    </Button>
  );
};

export default GoogleSignInButton;
