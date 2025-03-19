
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
          <h1 className="text-2xl font-bold mb-1">Mining</h1>
          <p className="text-gray-500">Mine 2 coins per hour, up to 48 coins daily</p>
        </div>
        
        <MiningCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Mining;
