
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // In local storage version, we don't need to verify email
    // Just redirect to dashboard after a short delay
    if (isAuthenticated) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setMessage('No active session found. Please sign in again.');
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    }
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {isLoading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-brand-blue mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Processing authentication...</h1>
            <p className="text-gray-600">Please wait while we complete the process.</p>
          </>
        ) : message ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-red-600">Authentication Status</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <button 
              onClick={() => navigate('/sign-in')}
              className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Authentication Successful!</h1>
            <p className="text-gray-600 mb-4">Redirecting you to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
