
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const WithdrawalPage: React.FC = () => {
  const { user, requestWithdrawal, setWithdrawalAddress } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>(user?.withdrawalAddress || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast.error('Please enter a valid withdrawal address');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the withdrawal address if it changed
      if (address !== user?.withdrawalAddress) {
        await setWithdrawalAddress(address);
      }
      
      await requestWithdrawal(parseFloat(amount));
      setAmount('');
      toast.success('Withdrawal request submitted successfully');
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Withdraw Funds</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Withdrawal Address</Label>
              <Input
                id="address"
                placeholder="Enter your withdrawal address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDT)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setAmount(user?.usdtEarnings?.toString() || '0')}
                >
                  Max
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Available balance: {user?.usdtEarnings?.toFixed(2) || 0} USDT
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Withdrawal Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalPage;
