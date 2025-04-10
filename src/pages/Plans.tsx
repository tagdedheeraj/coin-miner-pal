
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import PlansCard from '@/components/plans/PlansCard';
import { DepositRequest } from '@/types/auth';
import { toast } from 'sonner';

const Plans: React.FC = () => {
  const { isAuthenticated, user, getUserDepositRequests } = useAuth();
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && getUserDepositRequests) {
      setIsLoading(true);
      getUserDepositRequests()
        .then(requests => {
          setDepositRequests(requests);
        })
        .catch(error => {
          console.error('Error fetching user deposit requests:', error);
          // Don't show toast to avoid spamming the user on RLS errors
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isAuthenticated, getUserDepositRequests]);

  // Add a refresh function that PlansCard can call after successful submission
  const refreshDepositRequests = () => {
    if (isAuthenticated && getUserDepositRequests) {
      setIsLoading(true);
      getUserDepositRequests()
        .then(requests => {
          setDepositRequests(requests);
        })
        .catch(error => {
          console.error('Error refreshing deposit requests:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Mining Plans</h1>
          <p className="text-gray-500">Boost your mining with premium plans and earn USDT daily</p>
        </div>
        
        <PlansCard 
          userDepositRequests={depositRequests} 
          onDepositSuccess={refreshDepositRequests}
        />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Plans;
