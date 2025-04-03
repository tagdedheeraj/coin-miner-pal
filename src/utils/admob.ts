
// AdMob IDs and configuration
export const AD_CONFIG = {
  APP_ID: 'ca-app-pub-4331289011392918~8728147616',
  REWARDED_AD_ID: 'ca-app-pub-4331289011392918/3134299337',
  INTERSTITIAL_AD_ID: 'ca-app-pub-4331289011392918/2751155956',
  BANNER_AD_ID: 'ca-app-pub-4331289011392918/4629120506',
  
  // Test IDs for development
  TEST_REWARDED_AD_ID: 'ca-app-pub-3940256099942544/5224354917',
  TEST_INTERSTITIAL_AD_ID: 'ca-app-pub-3940256099942544/1033173712',
  TEST_BANNER_AD_ID: 'ca-app-pub-3940256099942544/6300978111',
};

// Use test ads during development
const isProduction = process.env.NODE_ENV === 'production';

// Get the appropriate ad unit ID based on environment
export const getAdUnitId = (adType: 'REWARDED' | 'INTERSTITIAL' | 'BANNER'): string => {
  switch (adType) {
    case 'REWARDED':
      return isProduction ? AD_CONFIG.REWARDED_AD_ID : AD_CONFIG.TEST_REWARDED_AD_ID;
    case 'INTERSTITIAL':
      return isProduction ? AD_CONFIG.INTERSTITIAL_AD_ID : AD_CONFIG.TEST_INTERSTITIAL_AD_ID;
    case 'BANNER':
      return isProduction ? AD_CONFIG.BANNER_AD_ID : AD_CONFIG.TEST_BANNER_AD_ID;
  }
};

// Mock implementations for web environment
export const showRewardedAdMock = (onAdRewarded: () => void): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('Showing mock rewarded ad');
    setTimeout(() => {
      onAdRewarded();
      resolve(true);
    }, 5000); // Simulate 5-second ad
  });
};

export const showInterstitialAdMock = (): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log('Showing mock interstitial ad');
    setTimeout(() => {
      resolve(true);
    }, 3000); // Simulate 3-second ad
  });
};
