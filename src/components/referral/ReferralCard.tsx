
import React, { useState } from 'react';
import { Share2, Copy, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ReferralCard: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const copyReferralCode = () => {
    if (!user) return;
    
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied to clipboard');
  };
  
  const shareReferral = () => {
    if (!user) return;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Infinium Mining',
        text: `Use my referral code ${user.referralCode} to get 250 coins when you sign up!`,
        url: window.location.origin,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyReferralCode();
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center mr-3">
            <Share2 className="text-brand-indigo" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Refer & Earn</h3>
            <p className="text-sm text-gray-500">Invite friends, earn coins</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-brand-indigo to-brand-blue rounded-xl p-5 mb-6 text-white">
          <div className="mb-4">
            <p className="text-xs text-white/70 mb-2">Your referral code</p>
            <div className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
              <p className="font-mono font-bold">{user.referralCode}</p>
              <button 
                onClick={copyReferralCode}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {copied ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <Copy size={16} className="text-white" />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-center bg-white/10 rounded-lg p-4">
            <p className="text-sm mb-1">Reward per referral</p>
            <p className="text-2xl font-bold">250 coins</p>
          </div>
        </div>
        
        <Button 
          onClick={shareReferral}
          className="w-full rounded-xl h-12 bg-brand-indigo hover:bg-brand-indigo/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Share2 size={16} className="mr-2" />
          Share Referral Code
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">How it works</h3>
          <div className="w-8 h-8 rounded-full bg-brand-indigo/10 flex items-center justify-center">
            <Users className="text-brand-indigo" size={16} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-brand-indigo text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div className="ml-8">
              <p className="font-medium text-sm">Share your code</p>
              <p className="text-xs text-gray-500 mt-1">
                Send your unique referral code to friends
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-brand-indigo text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div className="ml-8">
              <p className="font-medium text-sm">Friends sign up</p>
              <p className="text-xs text-gray-500 mt-1">
                They create an account using your code
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-brand-indigo text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div className="ml-8">
              <p className="font-medium text-sm">Both earn rewards</p>
              <p className="text-xs text-gray-500 mt-1">
                You get 250 coins and they get 250 bonus coins
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
