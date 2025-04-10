
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const fetchDepositRequests = async () => {
    if (isAuthenticated && getUserDepositRequests) {
      setIsLoading(true);
      setFetchError(null);
      try {
        const requests = await getUserDepositRequests();
        setDepositRequests(requests);
      } catch (error) {
        console.error('Error fetching user deposit requests:', error);
        setFetchError('Unable to load your deposit requests. Please try again later.');
        // Don't show toast to avoid spamming the user on RLS errors
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  useEffect(() => {
    fetchDepositRequests();
    
    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(fetchDepositRequests, 30000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, getUserDepositRequests]);

  // Add a refresh function that PlansCard can call after successful submission
  const refreshDepositRequests = () => {
    toast.info("Refreshing your deposit requests...");
    fetchDepositRequests();
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
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <p className="text-gray-500">Loading your plans...</p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-100 mb-6">
            <p className="text-red-700 text-sm">{fetchError}</p>
            <button 
              onClick={fetchDepositRequests}
              className="text-xs mt-2 text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <PlansCard 
            userDepositRequests={depositRequests} 
            onDepositSuccess={refreshDepositRequests}
          />
        )}
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Plans;
