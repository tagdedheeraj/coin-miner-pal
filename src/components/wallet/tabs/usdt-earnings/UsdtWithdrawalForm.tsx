
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UsdtWithdrawalFormProps {
  availableBalance: number;
  onWithdraw: (amount: number) => Promise<void>;
  onCancel: () => void;
}

const UsdtWithdrawalForm: React.FC<UsdtWithdrawalFormProps> = ({ 
  availableBalance, 
  onWithdraw, 
  onCancel 
}) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  
  const processUsdtWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    
    if (amount < 50) {
      toast.error('Minimum withdrawal amount is $50');
      return;
    }
    
    if (amount > availableBalance) {
      toast.error(`Insufficient balance. You have $${availableBalance.toFixed(2)} available`);
      return;
    }
    
    try {
      await onWithdraw(amount);
      setWithdrawalAmount('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process withdrawal');
    }
  };
  
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-xl animate-scale-up">
      <p className="font-medium text-sm mb-3">Withdraw USDT (Minimum $50)</p>
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount in USDT</Label>
          <div className="flex mt-1">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">$</span>
            <Input
              id="amount"
              type="number"
              min="50"
              step="0.01"
              className="rounded-l-none"
              placeholder="50.00"
              value={withdrawalAmount}
              onChange={(e) => setWithdrawalAmount(e.target.value)}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>• Minimum withdrawal amount: $50</p>
          <p>• Network fee: 1 USDT</p>
          <p>• Processing time: 24 hours</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            className="flex-1" 
            onClick={processUsdtWithdrawal}
          >
            Withdraw
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsdtWithdrawalForm;
