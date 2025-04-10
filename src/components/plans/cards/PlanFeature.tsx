
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlanFeatureProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ icon: Icon, iconColor, label, value }) => {
  return (
    <div className="flex items-center space-x-2">
      <Icon size={18} className={iconColor} />
      <span>{label}: <strong>{value}</strong></span>
    </div>
  );
};

export default PlanFeature;
