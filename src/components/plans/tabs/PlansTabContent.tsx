
import React, { useState, useEffect, useCallback } from 'react';
import PlanItem from '../cards/PlanItem';
import { Skeleton } from '@/components/ui/skeleton';
import { ArbitragePlan } from '@/types/arbitragePlans';
import { fetchArbitragePlans, subscribeToPlanChanges } from '@/services/arbitragePlans';

interface PlansTabContentProps {
  onOpenPaymentModal: (plan: {id: string; name: string; price: number}) => void;
  isRefreshing?: boolean;
}

const PlansTabContent: React.FC<PlansTabContentProps> = ({ 
  onOpenPaymentModal,
  isRefreshing = false
}) => {
  const [plans, setPlans] = useState<ArbitragePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching arbitrage plans...');
      const data = await fetchArbitragePlans(true);
      console.log('Fetched plans:', data);
      // Sort plans by price before setting state
      setPlans(data.sort((a, b) => a.price - b.price));
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
    
    const planSubscription = subscribeToPlanChanges(() => {
      console.log('Plans updated, reloading...');
      loadPlans();
    });
      
    return () => {
      planSubscription.unsubscribe();
    };
  }, [loadPlans]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-xl">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadPlans}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.length > 0 ? (
        plans.map((plan) => (
          <PlanItem 
            key={plan.id} 
            plan={plan}
            onSubscribe={onOpenPaymentModal}
            disabled={isRefreshing}
          />
        ))
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No mining plans available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(PlansTabContent);
