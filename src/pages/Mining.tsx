
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import MiningCard from '@/components/mining/MiningCard';

const Mining: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">माइनिंग</h1>
          <p className="text-gray-500">प्रति घंटे 2 सिक्के माइन करें, दैनिक 48 सिक्कों तक</p>
        </div>
        
        <MiningCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Mining;
