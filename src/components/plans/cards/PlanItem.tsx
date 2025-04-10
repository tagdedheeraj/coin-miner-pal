
import React from 'react';
import { RefreshCw, Zap, Timer, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
}

const PlanItem: React.FC<PlanItemProps> = ({ plan, onSubscribe }) => {
  // Render the color badge based on plan color
  const getColorClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-brand-blue text-white';
      case 'green': return 'bg-brand-green text-white';
      case 'purple': return 'bg-purple-600 text-white';
      case 'red': return 'bg-red-600 text-white';
      case 'cyan': return 'bg-cyan-500 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'pink': return 'bg-pink-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card 
      className="w-full overflow-hidden border-t-4 shadow-md animate-scale-up"
      style={{ 
        borderTopColor: plan.color === 'blue' ? '#3B82F6' :
                        plan.color === 'green' ? '#10B981' :
                        plan.color === 'purple' ? '#8B5CF6' :
                        plan.color === 'red' ? '#EF4444' :
                        plan.color === 'cyan' ? '#06B6D4' :
                        plan.color === 'amber' ? '#F59E0B' :
                        plan.color === 'gold' ? '#EAB308' :
                        plan.color === 'pink' ? '#EC4899' : '#6B7280'
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClass(plan.color)}`}>${plan.price}</span>
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
          <div className="flex items-center space-x-2">
            <RefreshCw size={18} className="text-brand-blue" />
            <span>Daily Earnings: <strong>${plan.dailyEarnings}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap size={18} className="text-brand-orange" />
            <span>Mining Speed: <strong>{plan.miningSpeed} faster</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Timer size={18} className="text-green-500" />
            <span>Total Earnings: <strong>${plan.totalEarnings}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-purple-500" />
            <span>Withdrawal: <strong>{plan.withdrawal}</strong></span>
          </div>
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
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanItem;
