
import React from 'react';
import { Clock } from 'lucide-react';

interface PaymentTimerProps {
  timeLeft: number;
}

const PaymentTimer: React.FC<PaymentTimerProps> = ({ timeLeft }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="text-center mt-3">
      <div className="flex items-center justify-center gap-2">
        <Clock className="h-4 w-4 text-red-500" />
        <p className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
          {formatTime(timeLeft)}
        </p>
      </div>
      <p className="text-xs text-gray-500 mt-1">Time remaining to complete payment</p>
    </div>
  );
};

export default PaymentTimer;
