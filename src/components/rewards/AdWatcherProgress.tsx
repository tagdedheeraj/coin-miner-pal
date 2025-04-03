
import React from 'react';

interface AdWatcherProgressProps {
  adWatched: number;
  maxAds: number;
}

const AdWatcherProgress: React.FC<AdWatcherProgressProps> = ({ adWatched, maxAds }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Daily Progress</p>
          <p className="text-xs text-gray-500">{maxAds} ads maximum per day</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{adWatched} <span className="text-sm text-gray-400">/ {maxAds}</span></p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
        <div
          className="bg-brand-pink h-2 rounded-full transition-all duration-500"
          style={{ width: `${(adWatched / maxAds) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AdWatcherProgress;
