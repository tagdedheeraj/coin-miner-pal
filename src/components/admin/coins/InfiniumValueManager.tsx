
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

const InfiniumValueManager: React.FC = () => {
  const { user } = useAuth();
  const [coinValue, setCoinValue] = useState('0.02');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCoinValue = async () => {
      try {
        const db = getFirestore();
        const settingsRef = doc(db, 'settings', 'system');
        const settingsDoc = await getDoc(settingsRef);
        
        if (settingsDoc.exists()) {
          const { infiniumCoinValue } = settingsDoc.data();
          if (infiniumCoinValue) {
            setCoinValue(infiniumCoinValue.toString());
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching coin value:', error);
        toast.error('Failed to load coin value');
        setIsLoading(false);
      }
    };
    
    fetchCoinValue();
  }, []);
  
  const handleUpdateCoinValue = async () => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update coin value');
      return;
    }
    
    const value = parseFloat(coinValue);
    if (isNaN(value) || value <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    
    setIsUpdating(true);
    try {
      const db = getFirestore();
      const settingsRef = doc(db, 'settings', 'system');
      
      // Check if document exists
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        await updateDoc(settingsRef, {
          infiniumCoinValue: value
        });
      } else {
        // If document doesn't exist, create it first
        await updateDoc(settingsRef, {
          infiniumCoinValue: value
        });
      }
      
      toast.success(`Infinium coin value updated to $${value}`);
    } catch (error) {
      console.error('Error updating coin value:', error);
      toast.error('Failed to update coin value');
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Infinium Coin Value</CardTitle>
        <CardDescription>Manage the USD value of Infinium Coins</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coinValue">Coin Value (USD)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="coinValue"
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={coinValue}
                    onChange={(e) => setCoinValue(e.target.value)}
                    disabled={isUpdating}
                    className="pl-8"
                  />
                </div>
                <Button 
                  onClick={handleUpdateCoinValue} 
                  disabled={isUpdating || coinValue === '0.02'}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Value'
                  )}
                </Button>
              </div>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
              <p>Current Value: <strong>${coinValue} USD per Infinium Coin</strong></p>
              <p className="mt-1">
                This value affects earnings calculations and withdrawal conversions across the platform.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfiniumValueManager;
