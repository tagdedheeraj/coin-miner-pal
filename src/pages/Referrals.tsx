
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CheckCircle2, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

const ReferralsPage: React.FC = () => {
  const { user, applyReferralCode } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleApplyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await applyReferralCode(referralCode.trim());
      setReferralCode('');
    } catch (error) {
      console.error('Apply referral code error:', error);
      toast.error('Failed to apply referral code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!user?.referralCode) return;
    
    navigator.clipboard.writeText(user.referralCode)
      .then(() => {
        setCopied(true);
        toast.success('Referral code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const shareReferralCode = () => {
    if (!user?.referralCode) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join me on our platform',
        text: `Use my referral code ${user.referralCode} to sign up and get bonus coins!`,
        url: window.location.origin,
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Referrals</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.referralCode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 p-3 rounded-md flex-1 text-center font-mono text-lg">
                    {user.referralCode}
                  </div>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={copyToClipboard}
                    className="min-w-10 h-10"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  className="w-full" 
                  onClick={shareReferralCode}
                  variant="outline"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Referral Code
                </Button>
                <p className="text-sm text-gray-500">
                  Share your referral code with friends and earn 250 coins for each friend who joins!
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Your referral code will be available soon.
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Apply a Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.appliedReferralCode ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  You've already applied a referral code: {user.appliedReferralCode}
                </p>
                <p className="text-sm text-gray-500">
                  You received 200 bonus coins for using a referral code!
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyReferralCode} className="space-y-4">
                <Input
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="uppercase"
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Applying...' : 'Apply Code'}
                </Button>
                <p className="text-sm text-gray-500">
                  Earn 200 coins by applying a friend's referral code!
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReferralsPage;
