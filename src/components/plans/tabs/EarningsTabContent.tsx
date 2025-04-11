
import React, { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { formatToIndianTime } from '@/utils/formatters';

interface EarningsTabContentProps {
  getIndianTime: () => string;
}

const EarningsTabContent: React.FC<EarningsTabContentProps> = ({ getIndianTime }) => {
  const { user } = useAuth();
  const [earningsData, setEarningsData] = useState<Array<{
    date: string;
    amount: number;
    status: string;
    planName: string;
  }>>([]);
  
  // Calculate earnings based on user's active plans
  useEffect(() => {
    if (!user?.activePlans) return;
    
    // Get current date for proper display
    const today = new Date();
    
    // Generate last 5 days of earnings
    const earnings = [];
    
    // For each active plan, calculate daily earnings for the past 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // For each active plan
      user.activePlans.forEach(plan => {
        const startDate = new Date(plan.startDate);
        const expiryDate = new Date(plan.expiryDate);
        
        // Only add earnings if the date is between start and expiry
        if (date >= startDate && date <= expiryDate) {
          const status = i === 0 ? 'Processing' : i === 1 ? 'Pending' : 'Paid';
          
          earnings.push({
            date: date.toISOString().split('T')[0],
            amount: plan.dailyEarnings,
            status,
            planName: plan.planName
          });
        }
      });
    }
    
    // Sort by date (newest first)
    earnings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setEarningsData(earnings);
  }, [user?.activePlans]);

  return (
    <div className="glass-card rounded-2xl p-6 animate-scale-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Arbitrage Plan Earnings</h3>
        <span className="text-sm text-gray-500">Next payout: {getIndianTime()}</span>
      </div>
      
      {earningsData.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earningsData.map((earning, i) => (
                <TableRow key={i}>
                  <TableCell>{earning.date}</TableCell>
                  <TableCell>{earning.planName}</TableCell>
                  <TableCell>${earning.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              <span className="font-bold text-brand-green">
                ${earningsData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No earnings yet</p>
          <p className="text-sm mt-2">Purchase an arbitrage plan to start earning USDT daily</p>
        </div>
      )}
    </div>
  );
};

export default EarningsTabContent;
