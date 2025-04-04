
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
  // Ensure we have the correct path to QR code
  const qrCodeUrl = '/lovable-uploads/4a50216d-605c-490b-9895-b24721e207fa.png';
  const [qrCodeError, setQrCodeError] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Log QR path for debugging purposes
  useEffect(() => {
    console.log(`Loading QR code from: ${qrCodeUrl}`);
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
              {!qrCodeError ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain"
                  onLoad={() => console.log('QR code loaded successfully')}
                  onError={(e) => {
                    console.error('QR Code failed to load:', e);
                    setQrCodeError(true);
                  }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
                  QR Code could not be loaded
                </div>
              )}
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
