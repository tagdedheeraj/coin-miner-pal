
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import PlansCard from '@/components/plans/PlansCard';
import { DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const Plans: React.FC = () => {
  const { isAuthenticated, user, getUserDepositRequests } = useAuth();
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const fetchDepositRequests = async (showLoadingToast = false) => {
    if (!isAuthenticated || !getUserDepositRequests) return;
    
    if (showLoadingToast) {
      setIsFetching(true);
      toast.info("Refreshing your deposit requests...");
    }
    
    try {
      const requests = await getUserDepositRequests();
      setDepositRequests(requests);
    } catch (error) {
      console.error('Error fetching user deposit requests:', error);
      // Don't show toast to avoid spamming the user on RLS errors
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };
  
  useEffect(() => {
    // Fetch on initial load
    fetchDepositRequests();
    
    // Set up periodic refresh (every 60 seconds instead of 30)
    const intervalId = setInterval(() => fetchDepositRequests(), 60000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, getUserDepositRequests]);

  // Add a refresh function that PlansCard can call after successful submission
  const refreshDepositRequests = () => {
    fetchDepositRequests(true);
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
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl mb-4" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        ) : (
          <PlansCard 
            userDepositRequests={depositRequests} 
            onDepositSuccess={refreshDepositRequests}
            isRefreshing={isFetching}
          />
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Plans;
