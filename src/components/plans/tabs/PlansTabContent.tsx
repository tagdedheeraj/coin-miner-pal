
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PlanItem from '../cards/PlanItem';
import { Skeleton } from '@/components/ui/skeleton';

interface ArbitragePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  miningSpeed: string;
  totalEarnings: number;
  withdrawal: string;
  color: string;
  limited?: boolean;
  limitedTo?: number;
}

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
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('arbitrage_plans')
          .select('*')
          .order('price', { ascending: true });
        
        if (error) {
          console.error('Error fetching plans:', error);
          return;
        }
        
        if (data) {
          // Map the database columns to our frontend model
          const mappedPlans = data.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            dailyEarnings: plan.daily_earnings,
            miningSpeed: plan.mining_speed,
            totalEarnings: plan.total_earnings,
            withdrawal: plan.withdrawal,
            color: plan.color || 'blue',
            limited: plan.limited || false,
            limitedTo: plan.limited_to
          }));
          
          setPlans(mappedPlans);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    
    // Set up a subscription to listen for changes in the plans table
    const planSubscription = supabase
      .channel('arbitrage_plans_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'arbitrage_plans' 
      }, () => {
        // Refetch plans when there's a change
        fetchPlans();
      })
      .subscribe();
      
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
