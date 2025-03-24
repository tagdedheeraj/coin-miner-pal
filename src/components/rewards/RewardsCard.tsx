
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, ChevronRight, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatTime } from '@/utils/formatters';
import { toast } from 'sonner';

const RewardsCard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [adWatched, setAdWatched] = useState(0);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [lastAdTime, setLastAdTime] = useState<Date | null>(null);
  
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
    return timeDiff >= 60000; // 1 minute
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
  
  // Simulate watching an ad
  const watchAd = () => {
    if (!canWatchAd()) {
      toast.error('Please wait for the cooldown to finish');
      return;
    }
    
    if (adWatched >= 10) {
      toast.error('You have reached the daily limit of 10 ads');
      return;
    }
    
    setIsWatchingAd(true);
    toast.info('Ad started... This will take 5 seconds');
    
    // Simulate an ad that takes 5 seconds to watch
    setTimeout(() => {
      setIsWatchingAd(false);
      setAdWatched(prev => prev + 1);
      setLastAdTime(new Date());
      
      // Give reward to user
      if (user) {
        updateUser({ coins: (user.coins || 0) + 1 });
      }
      
      toast.success('Ad completed! You earned 1 Infinium coin');
    }, 5000);
  };
  
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
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Daily Progress</p>
              <p className="text-xs text-gray-500">10 ads maximum per day</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold">{adWatched} <span className="text-sm text-gray-400">/ 10</span></p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
            <div
              className="bg-brand-pink h-2 rounded-full transition-all duration-500"
              style={{ width: `${(adWatched / 10) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {isWatchingAd ? (
          <div className="text-center p-4 bg-gray-50 rounded-xl mb-6">
            <p className="text-sm font-medium mb-2">Watching ad...</p>
            <div className="animate-pulse-subtle">
              <div className="w-12 h-12 bg-brand-pink/20 rounded-full mx-auto flex items-center justify-center">
                <Play size={24} className="text-brand-pink ml-1" />
              </div>
            </div>
          </div>
        ) : (
          countdown > 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded-xl mb-6">
              <p className="text-sm font-medium mb-2">Next ad in</p>
              <p className="text-2xl font-bold text-brand-pink">{formatTime(countdown)}</p>
            </div>
          ) : null
        )}
        
        <Button 
          onClick={watchAd}
          disabled={isWatchingAd || adWatched >= 10 || !canWatchAd()}
          className="w-full rounded-xl h-12 bg-brand-pink hover:bg-brand-pink/90 font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isWatchingAd ? 'Watching...' : adWatched >= 10 ? 'Limit Reached' : countdown > 0 ? 'Cooldown' : 'Watch Ad'}
        </Button>
      </div>
      
      <div className="glass-card rounded-2xl p-6 animate-scale-up animation-delay-100">
        <h3 className="font-semibold text-lg mb-3">Offerwall</h3>
        <p className="text-sm text-gray-500 mb-6">Complete offers to earn extra coins</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm">Complete a survey</p>
              <p className="text-xs text-gray-500">5-10 minutes</p>
            </div>
            <div className="flex items-center">
              <p className="font-semibold text-brand-pink mr-2">+10</p>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm">Install an app</p>
              <p className="text-xs text-gray-500">2-3 minutes</p>
            </div>
            <div className="flex items-center">
              <p className="font-semibold text-brand-pink mr-2">+5</p>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm">Watch a video</p>
              <p className="text-xs text-gray-500">30 seconds</p>
            </div>
            <div className="flex items-center">
              <p className="font-semibold text-brand-pink mr-2">+2</p>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsCard;
