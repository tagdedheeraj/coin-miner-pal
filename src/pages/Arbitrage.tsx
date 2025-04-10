
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Arbitrage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Arbitrage</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Arbitrage Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Welcome to our arbitrage platform. Here you can see your arbitrage investments and returns.
            </p>
            
            {user ? (
              <div className="bg-blue-50 p-4 rounded-md">
                <p>Your current balance: {user.usdtEarnings || 0} USDT</p>
              </div>
            ) : (
              <p>Please sign in to view your arbitrage investments.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Arbitrage;
