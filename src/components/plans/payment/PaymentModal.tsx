
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PaymentAddress from './PaymentAddress';
import PaymentQRCode from './PaymentQRCode';
import TransactionIdInput from './TransactionIdInput';
import PaymentTimer from './PaymentTimer';
import { ArrowLeft } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planId: string;
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onClose, 
  planName, 
  planPrice,
  planId,
  onSuccess
}) => {
  const { toast } = useToast();
  const { user, requestPlanPurchase } = useAuth();
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const walletAddress = '0xCce6b6b80C957aB0fB60FD91e32e336b1Ee83018';
  
  // Use the user-provided QR code image
  const qrCodeImage = "/lovable-uploads/0855ed5a-4c5d-42b4-883e-fe77f0e01d33.png";
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (open) {
      setTransactionId('');
      setTimeLeft(600);
      setIsSubmitting(false);
      
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
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please enter your transaction ID to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to purchase plans.",
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
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      });
      
      toast({
        title: "Payment Submitted!",
        description: "Your plan will be activated as soon as payment is confirmed by admin. Check back soon!",
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      
      let errorMessage = "There was an error submitting your payment. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Failed to submit",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="mr-2 h-8 w-8"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <DialogTitle>Complete your payment</DialogTitle>
            <DialogDescription>
              Send ${planPrice} USDT to activate {planName} plan
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> After making payment, enter the transaction ID below and click Submit. 
              Your plan will be activated after admin confirmation.
            </p>
          </div>
          
          <PaymentAddress walletAddress={walletAddress} />
          <PaymentQRCode qrCodeImage={qrCodeImage} timeLeft={timeLeft} />
          <TransactionIdInput 
            transactionId={transactionId} 
            setTransactionId={setTransactionId} 
          />
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
            {isSubmitting ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
