
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import PaymentAddress from './PaymentAddress';
import PaymentQRCode from './PaymentQRCode';
import TransactionIdInput from './TransactionIdInput';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
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
      toast.error("Transaction ID required. Please enter your transaction ID to continue.");
      return;
    }
    
    if (!user) {
      toast.error("Authentication required. Please sign in to purchase plans.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting deposit request for user:', user.id);
      
      // Prepare deposit request data
      const depositData = {
        user_id: user.id,
        user_email: user.email || '',
        user_name: user.name || 'User',
        plan_id: planId,
        plan_name: planName,
        amount: planPrice,
        transaction_id: transactionId.trim(),
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      
      console.log('Deposit data prepared:', depositData);
      
      // Insert deposit request
      const { data, error } = await supabase
        .from('deposit_requests')
        .insert(depositData);
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to submit deposit request: ${error.message}`);
      }
      
      console.log('Deposit request submitted successfully');
      
      toast.success("Payment Submitted! Your plan will be activated as soon as payment is confirmed by admin.");
      
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
      
      toast.error(errorMessage);
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
            Send ${planPrice} USDT to activate {planName} plan
          </DialogDescription>
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : 'Submit Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
