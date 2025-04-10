
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoogleSignInButtonProps {
  isSubmitting?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ isSubmitting = false }) => {
  const { toast } = useToast();
  
  const handleGmailSignIn = async () => {
    toast({
      title: "Not Available",
      description: "Gmail sign-in is not available in this version. Please use email/password instead.",
      variant: "destructive"
    });
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
