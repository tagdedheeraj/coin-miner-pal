
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import RewardsCard from '@/components/rewards/RewardsCard';

const Rewards: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Rewards</h1>
          <p className="text-gray-500">Watch ads and complete offers to earn coins</p>
        </div>
        
        <RewardsCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Rewards;
