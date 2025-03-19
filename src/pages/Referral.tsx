
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ReferralCard from '@/components/referral/ReferralCard';

const Referral: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Refer & Earn</h1>
          <p className="text-gray-500">Invite friends and earn 250 coins per referral</p>
        </div>
        
        <ReferralCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Referral;
