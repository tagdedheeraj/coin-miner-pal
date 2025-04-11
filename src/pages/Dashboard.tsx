
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import MiningCard from '@/components/mining/MiningCard';
import { useEarningsService } from '@/hooks/useEarningsService';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Initialize the earnings service
  useEarningsService();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name || 'User'}</h1>
          <p className="text-gray-500">Your daily mining dashboard</p>
        </div>
        
        <MiningCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Dashboard;
