import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import { ArrowLeft } from 'lucide-react';

const SignIn: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    if (user?.isAdmin) {
      return <Navigate to="/admin" replace />;
    }
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
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Welcome back</h1>
            <p className="text-gray-500">Sign in to continue mining</p>
          </div>
          
          <AuthForm 
            type="sign-in" 
            onSuccess={() => {
              // This callback will now be handled by the redirect logic above
            }}
          />
          
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/sign-up')}
                className="text-brand-blue font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
