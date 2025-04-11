
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UsdtEarningsManagerProps {
  updateUserUsdtEarnings: (email: string, amount: number) => Promise<void>;
}

const UsdtEarningsManager: React.FC<UsdtEarningsManagerProps> = ({ updateUserUsdtEarnings }) => {
  const [userEmail, setUserEmail] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateUsdtEarnings = async () => {
    if (!userEmail || !usdtAmount) {
      toast.error('कृपया ईमेल और USDT राशि दोनों दर्ज करें');
      return;
    }

    try {
      setIsUpdating(true);
      console.log(`Updating USDT earnings for ${userEmail} to ${usdtAmount}`);
      await updateUserUsdtEarnings(userEmail, parseFloat(usdtAmount));
      setUserEmail('');
      setUsdtAmount('');
    } catch (error) {
      console.error('Failed to update USDT earnings:', error);
      toast.error('USDT अर्निंग अपडेट करने में विफल');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update USDT Earnings</CardTitle>
        <CardDescription>Manually update a user's USDT earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">USDT Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter USDT amount"
              value={usdtAmount}
              onChange={(e) => setUsdtAmount(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          
          <Button 
            onClick={handleUpdateUsdtEarnings} 
            className="w-full"
            disabled={isUpdating || !userEmail || !usdtAmount}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update USDT Earnings'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsdtEarningsManager;
