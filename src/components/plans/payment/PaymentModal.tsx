
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PaymentAddress from './PaymentAddress';
import PaymentQRCode from './PaymentQRCode';
import TransactionIdInput from './TransactionIdInput';

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
        title: "Deposit request submitted!",
        description: "Your transaction is now pending for admin approval.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting deposit request:', error);
      
      let errorMessage = "There was an error submitting your deposit request. Please try again.";
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
        <DialogHeader>
          <DialogTitle>Complete your payment</DialogTitle>
          <DialogDescription>
            Send ${planPrice} to the following address to purchase {planName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
