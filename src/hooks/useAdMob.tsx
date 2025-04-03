
import { useState } from 'react';
import { toast } from 'sonner';
import { showRewardedAdMock, showInterstitialAdMock } from '@/utils/admob';

// Hook for rewarded ads
export function useRewardedAd(onReward: () => void, onFail?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const showRewardedAd = async () => {
    setIsLoading(true);
    
    try {
      toast.info('Ad started... This will take 5 seconds');
      
      // In a real mobile app, we'd use the actual AdMob API here
      // For web environment, we use our mock implementation
      await showRewardedAdMock(onReward);
    } catch (error) {
      console.error('Failed to load or show rewarded ad', error);
      toast.error('Failed to show ad. Please try again.');
      onFail?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { showRewardedAd, isLoading };
}

// Hook for interstitial ads
export function useInterstitialAd(onCompleted?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const showInterstitialAd = async () => {
    setIsLoading(true);
    
    try {
      // In a real mobile app, we'd use the actual AdMob API
      // For web environment, we use our mock implementation
      await showInterstitialAdMock();
      onCompleted?.();
    } catch (error) {
      console.error('Failed to load or show interstitial ad', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { showInterstitialAd, isLoading };
}
