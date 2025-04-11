
import React from 'react';
import { RefreshCw, Zap, Timer, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PlanFeature from './PlanFeature';
import PlanBadge from './PlanBadge';
import { getPlanBorderColor } from '../utils/planColors';

interface PlanItemProps {
  plan: {
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
  };
  onSubscribe: (plan: {id: string; name: string; price: number}) => void;
  disabled?: boolean;
}

const PlanItem: React.FC<PlanItemProps> = ({ plan, onSubscribe, disabled = false }) => {
  return (
    <Card 
      className={`w-full overflow-hidden border-t-4 shadow-md animate-scale-up ${disabled ? 'opacity-80' : ''}`}
      style={{ borderTopColor: getPlanBorderColor(plan.color) }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          <PlanBadge color={plan.color} price={plan.price} />
        </div>
        <CardDescription>
          Duration: {plan.duration} days
          {plan.limited && (
            <span className="ml-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              Limited to first {plan.limitedTo} users
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <PlanFeature 
            icon={RefreshCw} 
            iconColor="text-brand-blue" 
            label="Daily Earnings" 
            value={`$${plan.dailyEarnings}`} 
          />
          <PlanFeature 
            icon={Zap} 
            iconColor="text-brand-orange" 
            label="Mining Speed" 
            value={`${plan.miningSpeed} faster`} 
          />
          <PlanFeature 
            icon={Timer} 
            iconColor="text-green-500" 
            label="Total Earnings" 
            value={`$${plan.totalEarnings}`} 
          />
          <PlanFeature 
            icon={Clock} 
            iconColor="text-purple-500" 
            label="Withdrawal" 
            value={plan.withdrawal} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full rounded-xl h-12 bg-brand-orange hover:bg-brand-orange/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => onSubscribe({
            id: plan.id,
            name: plan.name,
            price: plan.price
          })}
          disabled={disabled}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanItem;
