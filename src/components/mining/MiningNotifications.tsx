
import { toast } from "sonner";

interface MiningNotificationsProps {
  isMining: boolean;
  miningProgress: number;
  miningRate: number;
  coinsMinedInSession: number;
}

export const useMiningNotifications = ({
  isMining,
  miningProgress,
  miningRate,
  coinsMinedInSession,
}: MiningNotificationsProps) => {
  const handleMiningStart = () => {
    toast.success('Mining started! Your mining session will continue even if you close the app.');
  };

  const handleMiningStop = () => {
    toast.info('Mining stopped. You can resume mining anytime.');
  };

  const handleMiningComplete = (coins: number) => {
    toast.success(`Mining completed! You earned ${coins} Infinium coins.`, {
      duration: 5000,
    });
  };

  const handleHourlyReward = () => {
    toast.success(`You mined ${miningRate} Infinium coins!`, {
      description: 'Hourly reward added to your wallet.',
    });
  };

  const handleCooldownError = () => {
    toast.error('Mining is on cooldown. Please wait until the cooldown period ends.', {
      description: 'Cooldown helps stabilize the Infinium economy.',
    });
  };

  const handleCooldownReset = () => {
    toast.success('Mining cooldown reset!');
  };
  
  const handleMiningContinued = () => {
    toast.info('Your mining session was continued from where you left off.', {
      description: 'Mining progress is saved automatically.',
      duration: 5000,
    });
  };

  const handleMiningNetworkError = () => {
    toast.error('Network error occurred while mining.', {
      description: 'Your progress is saved locally and will sync when connection is restored.',
    });
  };

  const handleMiningDataLoaded = () => {
    toast.success('Mining data synchronized!', {
      description: 'Your mining progress has been loaded from the server.',
    });
  };

  return {
    handleMiningStart,
    handleMiningStop,
    handleMiningComplete,
    handleHourlyReward,
    handleCooldownError,
    handleCooldownReset,
    handleMiningContinued,
    handleMiningNetworkError,
    handleMiningDataLoaded
  };
};
