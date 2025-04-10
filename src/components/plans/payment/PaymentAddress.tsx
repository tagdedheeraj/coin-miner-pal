
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentAddressProps {
  walletAddress: string;
}

const PaymentAddress: React.FC<PaymentAddressProps> = ({ walletAddress }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address copied!",
        description: "The wallet address has been copied to your clipboard.",
      });
    });
  };
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-700">ERC20 Address:</p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs" 
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="text-xs font-mono bg-white p-2 rounded border break-all">
        {walletAddress}
      </p>
    </div>
  );
};

export default PaymentAddress;
