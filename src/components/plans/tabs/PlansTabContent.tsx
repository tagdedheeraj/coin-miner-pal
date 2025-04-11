
import React, { useState, useEffect } from 'react';
import PlanItem from '../cards/PlanItem';
import { Skeleton } from '@/components/ui/skeleton';
import { ArbitragePlan } from '@/types/arbitragePlans';
import { fetchArbitragePlans, subscribeToPlanChanges } from '@/services/arbitragePlanService';

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

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await fetchArbitragePlans();
        setPlans(data);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
    
    // Set up a subscription to listen for changes in the plans table
    const planSubscription = subscribeToPlanChanges(() => {
      loadPlans();
    });
      
    return () => {
      // Clean up the subscription when component unmounts
      planSubscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
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

export default PlansTabContent;
