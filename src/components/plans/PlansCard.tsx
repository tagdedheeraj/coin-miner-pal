
import React, { useState } from 'react';
import { DepositRequest } from '@/types/auth';
import PaymentModal from './payment/PaymentModal';
import PlansHeader from './PlansHeader';
import PlansTabContent from './tabs/PlansTabContent';
import EarningsTabContent from './tabs/EarningsTabContent';
import PlanCategories from './cards/PlanCategories';

interface PlansCardProps {
  userDepositRequests?: DepositRequest[];
}

const PlansCard: React.FC<PlansCardProps> = ({ userDepositRequests = [] }) => {
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
        <PaymentModal
          open={paymentModalOpen}
          onClose={handleClosePaymentModal}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planId={selectedPlan.id}
        />
      )}
    </div>
  );
};

export default PlansCard;
