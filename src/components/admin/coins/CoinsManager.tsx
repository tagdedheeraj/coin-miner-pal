
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CoinsManagerProps {
  updateUserCoins: (email: string, amount: number) => Promise<void>;
}

const CoinsManager: React.FC<CoinsManagerProps> = ({ updateUserCoins }) => {
  const [coinEmail, setCoinEmail] = useState('');
  const [coinAmount, setCoinAmount] = useState('');

  const handleUpdateCoins = async () => {
    if (!coinEmail || !coinAmount) {
      return;
    }

    try {
      await updateUserCoins(coinEmail, parseInt(coinAmount, 10));
      setCoinEmail('');
      setCoinAmount('');
    } catch (error) {
      console.error('Failed to update coins:', error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Update User Coins</CardTitle>
        <CardDescription>Manually update a user's coin balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coinEmail">User Email</Label>
            <Input
              id="coinEmail"
              placeholder="Enter user email"
              value={coinEmail}
              onChange={(e) => setCoinEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coinAmount">Coin Amount</Label>
            <Input
              id="coinAmount"
              type="number"
              placeholder="Enter coin amount"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
            />
          </div>
          
          <Button onClick={handleUpdateCoins} className="w-full">
            Update Coins
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinsManager;
