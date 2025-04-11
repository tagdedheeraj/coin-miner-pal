
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlan } from '@/types/auth';
import { formatDistanceToNow, format, isAfter } from 'date-fns';

const ActivePlansTabContent: React.FC = () => {
  const { user } = useAuth();
  const activePlans = user?.activePlans || [];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Check if plan is expired
  const isPlanActive = (plan: UserPlan) => {
    try {
      const expiryDate = new Date(plan.expiryDate);
      return isAfter(expiryDate, new Date()) && plan.isActive;
    } catch (e) {
      return false;
    }
  };
  
  // Calculate time remaining
  const getTimeRemaining = (dateString: string) => {
    try {
      const expiryDate = new Date(dateString);
      if (isAfter(expiryDate, new Date())) {
        return formatDistanceToNow(expiryDate, { addSuffix: true });
      }
      return 'Expired';
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (activePlans.length === 0) {
    return (
      <Card className="p-6 mt-4 bg-gray-50">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-500 mb-2">You don't have any active plans yet</p>
          <p className="text-sm text-gray-400">Purchase a mining plan to start earning daily USDT</p>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 mt-4">
      {activePlans.map((plan) => (
        <Card key={plan.id} className={`overflow-hidden border ${isPlanActive(plan) ? 'border-green-200' : 'border-gray-200'}`}>
          <div className={`h-2 ${isPlanActive(plan) ? 'bg-green-500' : 'bg-gray-300'}`} />
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{plan.planName}</h3>
                <p className="text-gray-500 text-sm">
                  ${plan.amount.toFixed(2)} • {plan.dailyEarnings.toFixed(2)} USDT/day
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                isPlanActive(plan) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isPlanActive(plan) ? 'Active' : 'Expired'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium">{formatDate(plan.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Expiry Date</p>
                <p className="font-medium">{formatDate(plan.expiryDate)}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm font-medium">
                  {isPlanActive(plan) ? `Expires ${getTimeRemaining(plan.expiryDate)}` : 'Plan has expired'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivePlansTabContent;
