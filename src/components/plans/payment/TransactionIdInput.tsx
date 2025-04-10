
import React from 'react';
import { Input } from '@/components/ui/input';

interface TransactionIdInputProps {
  transactionId: string;
  setTransactionId: (value: string) => void;
}

const TransactionIdInput: React.FC<TransactionIdInputProps> = ({ 
  transactionId, 
  setTransactionId 
}) => {
  return (
    <div className="pt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Enter Transaction ID:</p>
      <Input
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        placeholder="0x..."
        className="font-mono"
      />
      <p className="text-xs text-gray-500 mt-1">
        After sending your payment, paste the transaction ID here for verification.
      </p>
    </div>
  );
};

export default TransactionIdInput;
