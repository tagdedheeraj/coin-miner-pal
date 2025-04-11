
import React, { useState, useCallback } from 'react';
import { DepositRequest } from '@/types/auth';
import PaymentModal from './payment/PaymentModal';
import PlansHeader from './PlansHeader';
import PlansTabContent from './tabs/PlansTabContent';
import EarningsTabContent from './tabs/EarningsTabContent';
import PlanCategories from './cards/PlanCategories';

interface PlansCardProps {
  userDepositRequests?: DepositRequest[];
  onDepositSuccess?: () => void;
  isRefreshing?: boolean;
}

const PlansCard: React.FC<PlansCardProps> = ({ 
  userDepositRequests = [],
  onDepositSuccess,
  isRefreshing = false
}) => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'earnings'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  // Get Indian time formatted as a string
  const getIndianTime = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date().toLocaleString('en-IN', options) + ' IST';
  }, []);

  const handleOpenPaymentModal = useCallback((plan: {id: string; name: string; price: number}) => {
    console.log('Opening payment modal for plan:', plan.name);
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  }, []);

  const handleClosePaymentModal = useCallback(() => {
    setPaymentModalOpen(false);
    setSelectedPlan(null);
  }, []);

  const handleDepositSuccess = useCallback(() => {
    // Call the parent component's refresh function if provided
    if (onDepositSuccess) {
      onDepositSuccess();
    }
  }, [onDepositSuccess]);

  return (
    <div className="w-full">
      <PlansHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
      />
      
      {activeTab === 'plans' ? (
        <PlansTabContent 
          onOpenPaymentModal={handleOpenPaymentModal} 
          isRefreshing={isRefreshing}
        />
      ) : (
        <EarningsTabContent getIndianTime={getIndianTime} />
      )}
      
      <PlanCategories />

      {selectedPlan && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planId={selectedPlan.id}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
};

export default React.memo(PlansCard); // Use memo for performance
