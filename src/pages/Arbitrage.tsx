
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArbitragePlan } from '@/types/auth';
import { toast } from 'sonner';

const Arbitrage = () => {
  const { user, arbitragePlans, requestPlanPurchase } = useAuth();
  const [plans, setPlans] = useState<ArbitragePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ArbitragePlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (arbitragePlans) {
      setPlans(arbitragePlans);
    }
  }, [arbitragePlans]);

  const handlePlanSelection = (plan: ArbitragePlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePurchase = (transactionId: string) => {
    if (!selectedPlan) return;
    
    requestPlanPurchase({
      userId: user?.id || '',
      userEmail: user?.email || '',
      userName: user?.name || '',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      transactionId,
      createdAt: new Date().toISOString()
    })
    .then(() => {
      setShowPaymentModal(false);
      toast.success('Purchase request submitted successfully');
    })
    .catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to submit purchase request');
    });
  };

  return (
    <div className="container max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Arbitrage Plans</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-800">
        <h2 className="text-xl font-semibold mb-2">What is Arbitrage?</h2>
        <p>
          Arbitrage is a trading strategy that takes advantage of price differences of the same asset in different markets.
          Our platform automates this process, allowing you to earn profits without active trading.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader className={`bg-${plan.color}-50 text-${plan.color}-900`}>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-gray-700">
                {plan.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4 flex-grow">
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500 ml-1">USD</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{plan.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily ROI:</span>
                  <span className="font-medium text-green-600">{plan.dailyRoi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Return:</span>
                  <span className="font-medium text-green-600">{plan.totalReturn}%</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full bg-${plan.color}-600 hover:bg-${plan.color}-700`}
                onClick={() => handlePlanSelection(plan)}
              >
                Select Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* We would normally create a proper payment modal component here,
          but for simplicity, we'll just use a mock representation */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Purchase {selectedPlan.name}</h2>
            <p className="mb-4">Total amount: ${selectedPlan.price} USD</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Transaction ID</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                placeholder="Enter transaction ID after payment"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handlePurchase("mock-transaction-id")}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arbitrage;
