
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useRewardedAd, useInterstitialAd } from '@/hooks/useAdMob';
import AdWatcherProgress from './AdWatcherProgress';
import AdWatcherStatus from './AdWatcherStatus';
import OfferwallSection from './OfferwallSection';

const RewardsCard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [adWatched, setAdWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastAdTime, setLastAdTime] = useState<Date | null>(null);
  const [processingOfferwall, setProcessingOfferwall] = useState(false);
  const MAX_DAILY_ADS = 10;
  
  // Load saved state
  useEffect(() => {
    const savedState = localStorage.getItem('rewardsState');
    if (savedState) {
      try {
        const { adWatched, lastAdTime } = JSON.parse(savedState);
        setAdWatched(adWatched || 0);
        setLastAdTime(lastAdTime ? new Date(lastAdTime) : null);
      } catch (error) {
        console.error('Failed to parse saved rewards state', error);
      }
    }
  }, []);
  
  // Save state when it changes
  useEffect(() => {
    localStorage.setItem('rewardsState', JSON.stringify({
      adWatched,
      lastAdTime: lastAdTime?.toISOString()
    }));
  }, [adWatched, lastAdTime]);
  
  // Check if enough time has passed since last ad
  const canWatchAd = () => {
    if (!lastAdTime) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastAdTime.getTime();
    return timeDiff >= 60000; // 1 minute cooldown
  };
  
  // Countdown timer
  useEffect(() => {
    if (!isWatchingAd && lastAdTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDiff = now.getTime() - lastAdTime.getTime();
        const timeRemaining = Math.max(60000 - timeDiff, 0);
        
        if (timeRemaining === 0) {
          clearInterval(interval);
          setCountdown(0);
        } else {
          setCountdown(timeRemaining);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isWatchingAd, lastAdTime]);
  
  // Reset daily count at midnight
  useEffect(() => {
    const resetDaily = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        setAdWatched(0);
        toast.info('Daily ad count has been reset!');
        resetDaily(); // Set up next day's reset
      }, timeUntilMidnight);
    };
    
    resetDaily();
  }, []);
  
  // Handle rewarded ad completion
  const onRewardedAdCompleted = () => {
    setAdWatched(prev => prev + 1);
    setLastAdTime(new Date());
    
    // Give reward to user
    if (user) {
      updateUser({ coins: (user.coins || 0) + 1 });
    }
    
    setIsWatchingAd(false);
    toast.success('Ad completed! You earned 1 Infinium coin');
  };
  
  // Setup AdMob hooks
  const { showRewardedAd, isLoading: isRewardedAdLoading } = useRewardedAd(
    onRewardedAdCompleted,
    () => setIsWatchingAd(false)
  );
  
  const { showInterstitialAd, isLoading: isInterstitialAdLoading } = useInterstitialAd();
  
  // Watch Ad button handler
  const handleWatchAd = async () => {
    if (!canWatchAd()) {
      toast.error('Please wait for the cooldown to finish');
      return;
    }
    
    if (adWatched >= MAX_DAILY_ADS) {
      toast.error(`You have reached the daily limit of ${MAX_DAILY_ADS} ads`);
      return;
    }
    
    setIsWatchingAd(true);
    await showRewardedAd();
  };
  
  // Offerwall item click handler
  const handleOfferwallItemClick = async (reward: number, type: string) => {
    if (processingOfferwall) return;
    
    setProcessingOfferwall(true);
    toast.info(`Starting ${type}...`);
    
    try {
      await showInterstitialAd();
      
      // Give reward to user
      if (user) {
        updateUser({ coins: (user.coins || 0) + reward });
      }
      toast.success(`You earned ${reward} Infinium coins!`);
    } catch (error) {
      console.error('Error with offerwall:', error);
      toast.error('Failed to complete offer. Please try again.');
    } finally {
      setProcessingOfferwall(false);
    }
  };
  
  // Helper for button text
  const getWatchButtonText = () => {
    if (isWatchingAd || isRewardedAdLoading) return 'Loading Ad...';
    if (adWatched >= MAX_DAILY_ADS) return 'Limit Reached';
    if (countdown > 0) return 'Cooldown';
    return 'Watch Ad';
  };
  
  return (
    <div className="w-full">
      <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center mr-3">
            <Gift className="text-brand-pink" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Watch Ads</h3>
            <p className="text-sm text-gray-500">Watch ads to earn coins</p>
          </div>
        </div>
        
        <AdWatcherProgress adWatched={adWatched} maxAds={MAX_DAILY_ADS} />
        
        <AdWatcherStatus isWatchingAd={isWatchingAd} countdown={countdown} />
        
        <Button 
          onClick={handleWatchAd}
          disabled={isWatchingAd || isRewardedAdLoading || adWatched >= MAX_DAILY_ADS || !canWatchAd()}
          className="w-full rounded-xl h-12 bg-brand-pink hover:bg-brand-pink/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {getWatchButtonText()}
          <Video className="ml-1" size={18} />
        </Button>
      </div>
      
      <OfferwallSection 
        isDisabled={processingOfferwall || isInterstitialAdLoading} 
        onItemClick={handleOfferwallItemClick}
      />
    </div>
  );
};

export default RewardsCard;
