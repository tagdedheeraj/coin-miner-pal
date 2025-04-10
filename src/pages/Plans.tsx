
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import PlansCard from '@/components/plans/PlansCard';
import { DepositRequest } from '@/types/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Plans: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const fetchDepositRequests = async () => {
    if (!isAuthenticated || !user) {
      return;
    }
    
    setIsLoading(true);
    setFetchError(null);
    
    try {
      console.log('Fetching deposit requests for user:', user.id);
      
      // Try direct query with no joins to minimize RLS issues
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching deposit requests:', error);
        
        if (error.code === '42P17' || error.message.includes('infinite recursion')) {
          setFetchError('There was an issue with database permissions. Please contact support.');
        } else {
          setFetchError(`Unable to load your deposit requests: ${error.message}`);
        }
        return;
      }
      
      if (!data) {
        console.log('No data returned from query');
        setDepositRequests([]);
        return;
      }
      
      console.log('Deposit requests fetched successfully:', data.length);
      
      // Transform data to match DepositRequest type
      const transformedData: DepositRequest[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        userEmail: item.user_email,
        userName: item.user_name || 'User',
        planId: item.plan_id,
        planName: item.plan_name,
        amount: item.amount,
        transactionId: item.transaction_id,
        status: item.status as 'pending' | 'approved' | 'rejected',
        timestamp: item.timestamp,
        reviewedAt: item.reviewed_at
      }));
      
      setDepositRequests(transformedData);
    } catch (error) {
      console.error('Unexpected error in fetchDepositRequests:', error);
      setFetchError('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User is authenticated, fetching deposit requests');
      fetchDepositRequests();
      
      // Set up periodic refresh (every 60 seconds)
      const intervalId = setInterval(fetchDepositRequests, 60000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user]);

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
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
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
