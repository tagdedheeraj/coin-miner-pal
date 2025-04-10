
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // If we have a session, email verification was successful
          setIsLoading(false);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError('Email verification failed. Please try again or contact support.');
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
            <h1 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h1>
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
