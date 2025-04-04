
import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown, Check, Clock, Copy, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planId: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  planName, 
  planPrice,
  planId
}) => {
  const { toast } = useToast();
  const { user, requestPlanPurchase } = useAuth();
  const [transactionId, setTransactionId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const walletAddress = '0xCce6b6b80C957aB0fB60FD91e32e336b1Ee83018';
  
  // Use a direct base64 encoding for the QR code to avoid loading issues
  const qrCodeBase64 = "data:image/png;base64,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";
  const [qrCodeError, setQrCodeError] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Log info about QR code for debugging purposes
  useEffect(() => {
    console.log(`Using base64 QR code`);
  }, []);
  
  useEffect(() => {
    if (open) {
      setTransactionId('');
      setCopied(false);
      setTimeLeft(600);
      setIsSubmitting(false);
      setQrCodeError(false);
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
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
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please enter your transaction ID to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await requestPlanPurchase({
        planId,
        planName,
        amount: planPrice,
        transactionId: transactionId.trim(),
        timestamp: new Date().toISOString(),
        userId: user?.id || '',
        userEmail: user?.email || '',
        userName: user?.name || '',
      });
      
      toast({
        title: "Deposit request submitted!",
        description: "Your transaction is now pending for admin approval.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      toast({
        title: "Failed to submit",
        description: "There was an error submitting your deposit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete your payment</DialogTitle>
          <DialogDescription>
            Send ${planPrice} to the following address to purchase {planName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
          
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white p-3 rounded-lg border">
              {/* Using base64 encoded QR code to avoid loading issues */}
              <img 
                src={qrCodeBase64}
                alt="Payment QR Code" 
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  console.error('Base64 QR Code failed to load:', e);
                  setQrCodeError(true);
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Scan QR code to pay</p>
              <div className="flex items-center justify-center mt-2 gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <p className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>
          
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
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !transactionId.trim() || timeLeft === 0}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
