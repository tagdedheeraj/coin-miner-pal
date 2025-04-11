
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ReferralCard from '@/components/referral/ReferralCard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Referral: React.FC = () => {
  const { isAuthenticated, applyReferralCode, user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  
  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await applyReferralCode(referralCode.trim());
      setReferralCode('');
    } catch (error) {
      console.error('Referral Error:', error);
      // Don't show "Invalid referral code" error if the code is actually invalid
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply referral code';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Refer & Earn</h1>
          <p className="text-gray-500">Invite friends and earn 250 coins when they use your code</p>
        </div>
        
        {!user?.appliedReferralCode ? (
          <Card className="p-4 mb-6 animate-scale-up">
            <h2 className="text-lg font-semibold mb-3">Apply Referral Code</h2>
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter referral code" 
                value={referralCode} 
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleApplyReferralCode} 
                disabled={isSubmitting}
                className="bg-brand-indigo hover:bg-brand-indigo/90"
              >
                {isSubmitting ? 'Applying...' : 'Apply'}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              The 250 coin bonus will be added to the referrer's account immediately
            </p>
          </Card>
        ) : (
          <Card className="p-4 mb-6 animate-scale-up">
            <h2 className="text-lg font-semibold mb-3">Referral Applied</h2>
            <p className="text-green-600">You have successfully applied a referral code!</p>
          </Card>
        )}
        
        <ReferralCard />
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Referral;
