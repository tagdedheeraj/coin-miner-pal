
import React from 'react';
import { Play } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

interface AdWatcherStatusProps {
  isWatchingAd: boolean;
  countdown: number;
}

const AdWatcherStatus: React.FC<AdWatcherStatusProps> = ({ isWatchingAd, countdown }) => {
  if (isWatchingAd) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-xl mb-6">
        <p className="text-sm font-medium mb-2">Watching ad...</p>
        <div className="animate-pulse-subtle">
          <div className="w-12 h-12 bg-brand-pink/20 rounded-full mx-auto flex items-center justify-center">
            <Play size={24} className="text-brand-pink ml-1" />
          </div>
        </div>
      </div>
    );
  } 
  
  if (countdown > 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-xl mb-6">
        <p className="text-sm font-medium mb-2">Next ad in</p>
        <p className="text-2xl font-bold text-brand-pink">{formatTime(countdown)}</p>
      </div>
    );
  }
  
  return null;
};

export default AdWatcherStatus;
