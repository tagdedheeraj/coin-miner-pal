
import React, { useState } from 'react';
import { DepositRequest } from '@/types/auth';
import NewPaymentModal from './payment/NewPaymentModal';
import PlansHeader from './PlansHeader';
import PlansTabContent from './tabs/PlansTabContent';
import EarningsTabContent from './tabs/EarningsTabContent';
import PlanCategories from './cards/PlanCategories';

interface PlansCardProps {
  userDepositRequests?: DepositRequest[];
  onDepositSuccess?: () => void;
}

const PlansCard: React.FC<PlansCardProps> = ({ 
  userDepositRequests = [],
  onDepositSuccess
}) => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'earnings'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  // Get Indian time formatted as a string
  const getIndianTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date().toLocaleString('en-IN', options) + ' IST';
  };

  const handleOpenPaymentModal = (plan: {id: string; name: string; price: number}) => {
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  const handleDepositSuccess = () => {
    // Call the parent component's refresh function if provided
    if (onDepositSuccess) {
      onDepositSuccess();
    }
  };

  return (
    <div className="w-full">
      <PlansHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
      
      {activeTab === 'plans' ? (
        <PlansTabContent onOpenPaymentModal={handleOpenPaymentModal} />
      ) : (
        <EarningsTabContent getIndianTime={getIndianTime} />
      )}
      
      <PlanCategories />

      {selectedPlan && (
        <NewPaymentModal
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

export default PlansCard;
