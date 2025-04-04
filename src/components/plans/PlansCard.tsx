
import React, { useState } from 'react';
import { LayoutGrid, ChevronRight, Check, Clock, Zap, RefreshCw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatUSD } from '@/utils/formatters';
import PaymentModal from './PaymentModal';
import { mockArbitragePlans } from '@/data/mockArbitragePlans';

const PlansCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'earnings'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);
  
  // Mock arbitrage earnings data
  const earningsData = [
    { date: "2023-10-01", amount: 0.96, status: "Paid" },
    { date: "2023-10-02", amount: 0.96, status: "Paid" },
    { date: "2023-10-03", amount: 0.96, status: "Paid" },
    { date: "2023-10-04", amount: 0.96, status: "Processing" },
    { date: "2023-10-05", amount: 0.96, status: "Pending" },
  ];

  // Get Indian time formatted as a string
  const getIndianTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date().toLocaleString('en-IN', options) + ' IST';
  };

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

  const handleOpenPaymentModal = (plan: {id: string; name: string; price: number}) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const renderPlans = () => (
    <div className="space-y-6">
      {mockArbitragePlans.map((plan, index) => (
        <Card 
          key={plan.id} 
          className="w-full overflow-hidden border-t-4 shadow-md animate-scale-up"
          style={{ 
            borderTopColor: plan.color === 'blue' ? '#3B82F6' :
                            plan.color === 'green' ? '#10B981' :
                            plan.color === 'purple' ? '#8B5CF6' :
                            plan.color === 'red' ? '#EF4444' :
                            plan.color === 'cyan' ? '#06B6D4' :
                            plan.color === 'amber' ? '#F59E0B' :
                            plan.color === 'gold' ? '#EAB308' :
                            plan.color === 'pink' ? '#EC4899' : '#6B7280',
            animationDelay: `${index * 100}ms`
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
              onClick={() => handleOpenPaymentModal({
                id: plan.id,
                name: plan.name,
                price: plan.price
              })}
            >
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderEarnings = () => (
    <div className="glass-card rounded-2xl p-6 animate-scale-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Arbitrage Plan Earnings</h3>
        <span className="text-sm text-gray-500">Next payout: {getIndianTime()}</span>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earningsData.map((earning, i) => (
            <TableRow key={i}>
              <TableCell>{earning.date}</TableCell>
              <TableCell>${earning.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  earning.status === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : earning.status === 'Processing' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {earning.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Earnings:</span>
          <span className="font-bold text-brand-green">${earningsData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center mr-3">
            <LayoutGrid className="text-brand-orange" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Mining Plans</h3>
            <p className="text-sm text-gray-500">Boost your mining power</p>
          </div>
        </div>
        
        <div className="flex space-x-2 border-b mb-6">
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'plans' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500'}`}
            onClick={() => setActiveTab('plans')}
          >
            Plans
          </button>
          <button
            className={`pb-2 px-4 font-medium ${activeTab === 'earnings' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500'}`}
            onClick={() => setActiveTab('earnings')}
          >
            Earnings
          </button>
        </div>
        
        {activeTab === 'plans' ? renderPlans() : renderEarnings()}
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-6">Plan Categories</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Boosting Plans</p>
              <p className="text-xs text-gray-500">Increase your mining rate</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium">Arbitrage Plans</p>
              <p className="text-xs text-gray-500">Profit from market differences</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Special Offers</p>
              <p className="text-xs text-gray-500">Limited time opportunities</p>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planId={selectedPlan.id}
        />
      )}
    </div>
  );
};

export default PlansCard;
