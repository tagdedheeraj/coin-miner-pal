
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const SignUp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 flex items-center px-4">
        <button 
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showVerificationMessage ? (
            <div className="mb-8 animate-fade-in">
              <Alert className="bg-green-50 border-green-200 mb-4">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Account created! Please check your email ({verificationEmail}) to verify your account.
                </AlertDescription>
              </Alert>
              
              <AuthForm 
                type="sign-up" 
                onSuccess={(email) => {
                  setVerificationEmail(email);
                  setShowVerificationMessage(true);
                }}
                showVerificationOptions={true}
                verificationEmail={verificationEmail}
              />
            </div>
          ) : (
            <>
              <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold mb-2 text-gradient">Create Account</h1>
                <p className="text-gray-500">Sign up to start earning coins</p>
              </div>
              
              <AuthForm 
                type="sign-up" 
                onSuccess={(email) => {
                  setVerificationEmail(email);
                  setShowVerificationMessage(true);
                }}
                showVerificationOptions={false}
              />
            </>
          )}
          
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/sign-in')}
                className="text-brand-blue font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400 animate-fade-in">
            <p>By creating an account, you agree to our</p>
            <div className="flex justify-center space-x-1">
              <button className="text-brand-blue underline">Terms of Service</button>
              <span>&</span>
              <button className="text-brand-blue underline">Privacy Policy</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
