
import React from 'react';
import PaymentTimer from './PaymentTimer';

interface PaymentQRCodeProps {
  qrCodeImage: string;
  timeLeft: number;
}

const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({ qrCodeImage, timeLeft }) => {
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
      <PaymentTimer timeLeft={timeLeft} />
    </div>
  );
};

export default PaymentQRCode;
