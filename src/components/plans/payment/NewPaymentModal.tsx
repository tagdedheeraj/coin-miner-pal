
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Copy, Check, Loader2 } from 'lucide-react';

interface NewPaymentModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planId: string;
  onSuccess?: () => void;
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  open,
  onClose,
  planName,
  planPrice,
  planId,
  onSuccess
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, requestPlanPurchase } = useAuth();
  
  // USDT wallet address
  const walletAddress = '0xCce6b6b80C957aB0fB60FD91e32e336b1Ee83018';
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your transaction ID');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to purchase a plan');
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
      
      toast.success('Payment submitted successfully');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Subscribe to {planName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Instructions */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800 font-medium mb-1">How to subscribe:</p>
            <ol className="text-sm text-amber-800 list-decimal pl-5 space-y-1">
              <li>Send ${planPrice} USDT to the wallet address below</li>
              <li>Copy your transaction ID after payment</li>
              <li>Paste the transaction ID in the field below</li>
              <li>Click "Submit Payment" to complete</li>
            </ol>
          </div>
          
          {/* USDT Wallet Address */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">USDT Wallet Address (ERC20):</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-8"
              >
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs font-mono bg-white p-3 rounded border break-all">
              {walletAddress}
            </p>
          </div>
          
          {/* Transaction ID Input */}
          <div>
            <label htmlFor="transaction-id" className="block text-sm font-medium mb-2">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <Input
              id="transaction-id"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter your transaction ID (0x...)"
              className="font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be used to verify your payment
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !transactionId.trim()}
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

export default NewPaymentModal;
