
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { auth } from '@/integrations/firebase/client';

const AuthCallback: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if user is verified
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Reload user to get latest email verification status
          await currentUser.reload();
          
          if (currentUser.emailVerified) {
            // Email already confirmed
            setIsLoading(false);
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setError('Email verification pending. Please check your email and verify your account.');
            setIsLoading(false);
          }
        } else {
          setError('No user found. Please sign in again.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred during email verification.');
        setIsLoading(false);
      }
    };

    if (!isAuthenticated) {
      handleAuthCallback();
    } else {
      // Already authenticated, redirect to dashboard
      navigate('/dashboard');
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-brand-blue mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we complete the process.</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Verification Status</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/sign-in')}
              className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Email Verified Successfully!</h1>
            <p className="text-gray-600 mb-4">Redirecting you to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
