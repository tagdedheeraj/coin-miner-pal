
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";

interface VerificationOptionsProps {
  verificationEmail: string;
  onResendVerification: () => Promise<void>;
}

const VerificationOptions: React.FC<VerificationOptionsProps> = ({ 
  verificationEmail, 
  onResendVerification 
}) => {
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await onResendVerification();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to your email. Please check your inbox and spam folder.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex justify-center">
          <Mail className="h-16 w-16 text-brand-blue" />
        </div>
        
        <p className="text-center text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or try again.
        </p>
        
        <Button 
          onClick={handleResendVerification} 
          variant="outline" 
          disabled={isResending}
          className="w-full"
        >
          {isResending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </span>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
        
        <div className="text-center mt-4">
          <button 
            onClick={() => navigate('/sign-in')}
            className="text-brand-blue text-sm hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationOptions;
