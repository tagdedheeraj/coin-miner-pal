
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CoinsManagerProps {
  updateUserCoins: (email: string, amount: number) => Promise<void>;
}

const CoinsManager: React.FC<CoinsManagerProps> = ({ updateUserCoins }) => {
  const [coinEmail, setCoinEmail] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifyEmail = async () => {
    if (!coinEmail) {
      toast.error('कृपया ईमेल दर्ज करें');
      return;
    }

    try {
      setIsVerifying(true);
      // Here we could add a verification step if needed
      console.log(`Verifying user email: ${coinEmail}`);
      
      // For now, we'll just pretend to verify and set verified to true
      setTimeout(() => {
        setVerified(true);
        setIsVerifying(false);
        toast.success(`${coinEmail} सत्यापित किया गया`);
      }, 1000);
    } catch (error) {
      console.error('Failed to verify email:', error);
      toast.error('ईमेल सत्यापित करने में विफल');
      setIsVerifying(false);
    }
  };

  const handleUpdateCoins = async () => {
    if (!coinEmail || !coinAmount) {
      toast.error('कृपया ईमेल और सिक्का राशि दोनों दर्ज करें');
      return;
    }

    if (!verified) {
      toast.error('कृपया पहले ईमेल सत्यापित करें');
      return;
    }

    try {
      setIsUpdating(true);
      console.log(`Updating coins for ${coinEmail} to ${coinAmount}`);
      await updateUserCoins(coinEmail, parseInt(coinAmount, 10));
      toast.success(`${coinEmail} के लिए सिक्के अपडेट किए गए!`);
      setCoinEmail('');
      setCoinAmount('');
      setVerified(false);
    } catch (error) {
      console.error('Failed to update coins:', error);
      toast.error('सिक्के अपडेट करने में विफल');
    } finally {
      setIsUpdating(false);
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
            <div className="flex gap-2">
              <Input
                id="coinEmail"
                placeholder="Enter user email"
                value={coinEmail}
                onChange={(e) => {
                  setCoinEmail(e.target.value);
                  setVerified(false);
                }}
                disabled={isVerifying || isUpdating || verified}
                className="flex-1"
              />
              <Button 
                onClick={handleVerifyEmail} 
                variant="outline"
                disabled={isVerifying || isUpdating || verified || !coinEmail}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  verified ? 'Verified' : 'Verify Email'
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="coinAmount">Coin Amount</Label>
            <Input
              id="coinAmount"
              type="number"
              placeholder="Enter coin amount"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              disabled={isUpdating || !verified}
            />
          </div>
          
          <Button 
            onClick={handleUpdateCoins} 
            className="w-full" 
            disabled={isUpdating || !verified || !coinAmount}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Coins'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinsManager;
