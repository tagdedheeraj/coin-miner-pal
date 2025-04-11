
// Format coins to 2 decimal places
export const formatCoins = (coins: number): string => {
  return coins.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format USD value (1 coin = $0.02)
export const formatUSD = (coins: number): string => {
  const usdValue = coins * 0.02;
  return usdValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format time duration in a human-readable format
export const formatTime = (milliseconds: number): string => {
  if (milliseconds <= 0) return '0:00';
  
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format time remaining until next mining session
export const formatTimeRemaining = (milliseconds: number | null): string => {
  if (milliseconds === null) return 'Ready to mine';
  
  if (milliseconds <= 0) return 'Ready to mine';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  
  return `${seconds}s`;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format wallet address for display
export const formatWalletAddress = (address: string | null): string => {
  if (!address) return 'No address set';
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
};

// Format date to Indian Time (IST)
export const formatToIndianTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
