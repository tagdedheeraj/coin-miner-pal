
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
    toast.success('Mining started!');
  };

  const handleMiningStop = () => {
    toast.info('Mining stopped.');
  };

  const handleMiningComplete = (coins: number) => {
    toast.success(`Mining completed! You earned ${coins} Infinium coins.`);
  };

  const handleHourlyReward = () => {
    toast.success(`You mined ${miningRate} Infinium coins!`);
  };

  const handleCooldownError = () => {
    toast.error('Mining is on cooldown. Please wait until the cooldown period ends.');
  };

  const handleCooldownReset = () => {
    toast.success('Mining cooldown reset!');
  };
  
  const handleMiningContinued = () => {
    toast.info('Your mining session was continued from where you left off.');
  };

  return {
    handleMiningStart,
    handleMiningStop,
    handleMiningComplete,
    handleHourlyReward,
    handleCooldownError,
    handleCooldownReset,
    handleMiningContinued
  };
};
