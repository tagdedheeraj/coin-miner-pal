
import React from 'react';
import { Clock } from 'lucide-react';

interface PaymentQRCodeProps {
  qrCodeImage: string;
  timeLeft: number;
}

const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({ qrCodeImage, timeLeft }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div className="flex flex-col items-center space-y-3">
      <p className="text-sm font-medium text-center">Scan QR Code to make payment</p>
      <div className="bg-white p-3 rounded-lg border shadow-sm">
        <img 
          src={qrCodeImage}
          alt="Payment QR Code" 
          className="w-60 h-60 object-contain"
          onError={(e) => {
            console.error('QR Code failed to load:', e);
            e.currentTarget.src = 'https://placehold.co/240x240/e2e8f0/64748b?text=QR+Code+Unavailable';
          }}
        />
      </div>
      <div className="text-center mt-3">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 text-red-500" />
          <p className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">Time remaining to complete payment</p>
      </div>
    </div>
  );
};

export default PaymentQRCode;
