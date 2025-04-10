
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './contexts/auth/AuthProvider';
import { Toaster } from 'sonner';

function App() {
  console.log('App component rendering');
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-6">Infinium Miner</h1>
            <p className="text-center mb-8">Welcome! Sign in to start using the application.</p>
            
            <div className="flex justify-center">
              <a href="/sign-in" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign In
              </a>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
