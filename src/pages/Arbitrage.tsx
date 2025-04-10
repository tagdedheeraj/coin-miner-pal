
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import PaymentModal from '@/components/plans/payment/PaymentModal';

const ArbitragePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Example arbitrage plans
  const arbitragePlans = [
    {
      id: "basic",
      name: "Basic Arbitrage",
      price: 100,
      dailyReturn: 0.5,
      duration: 30,
      features: [
        "0.5% daily returns",
        "30-day duration",
        "Basic analysis tools",
        "Email support"
      ],
      recommended: false
    },
    {
      id: "standard",
      name: "Standard Arbitrage",
      price: 500,
      dailyReturn: 0.8,
      duration: 60,
      features: [
        "0.8% daily returns",
        "60-day duration",
        "Advanced analysis tools",
        "Priority email support",
        "Weekly market reports"
      ],
      recommended: true
    },
    {
      id: "premium",
      name: "Premium Arbitrage",
      price: 1000,
      dailyReturn: 1.2,
      duration: 90,
      features: [
        "1.2% daily returns",
        "90-day duration",
        "Full suite of analysis tools",
        "24/7 dedicated support",
        "Daily market reports",
        "Strategy consultation"
      ],
      recommended: false
    }
  ];

  const handlePurchase = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const calculateTotalReturn = (dailyReturn: number, days: number, investment: number) => {
    const totalReturn = investment * (1 + (dailyReturn / 100) * days);
    return totalReturn.toFixed(2);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Arbitrage Plans</h1>
      <p className="text-gray-600 mb-6">
        Take advantage of market price differences and earn daily returns on your investment
      </p>
      
      <div className="grid md:grid-cols-3 gap-6">
        {arbitragePlans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.recommended ? 'border-blue-500' : ''}`}>
            {plan.recommended && (
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-blue-500">Recommended</Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <div className="mt-2 text-2xl font-bold">${plan.price}</div>
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {plan.dailyReturn}% daily return
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{plan.duration} days duration</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">Total potential return:</div>
                  <div className="text-xl font-bold">
                    ${calculateTotalReturn(plan.dailyReturn, plan.duration, plan.price)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => handlePurchase(plan)}
                >
                  Purchase Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedPlan && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planId={selectedPlan.id}
          onSuccess={() => {
            // Handle success
          }}
        />
      )}
    </div>
  );
};

export default ArbitragePage;
