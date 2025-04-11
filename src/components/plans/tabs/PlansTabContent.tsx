
import React from 'react';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';
import PlanItem from '../cards/PlanItem';

interface PlansTabContentProps {
  onOpenPaymentModal: (plan: {id: string; name: string; price: number}) => void;
  isRefreshing?: boolean;
}

const PlansTabContent: React.FC<PlansTabContentProps> = ({ 
  onOpenPaymentModal,
  isRefreshing = false
}) => {
  return (
    <div className="space-y-6">
      {mockArbitragePlans.map((plan) => (
        <PlanItem 
          key={plan.id} 
          plan={plan}
          onSubscribe={onOpenPaymentModal}
          disabled={isRefreshing}
        />
      ))}
    </div>
  );
};

export default PlansTabContent;
