
import React from 'react';
import { ChevronRight } from 'lucide-react';

interface OfferwallItemProps {
  title: string;
  description: string;
  reward: number;
  isDisabled: boolean;
  onClick: () => void;
}

const OfferwallItem: React.FC<OfferwallItemProps> = ({
  title,
  description,
  reward,
  isDisabled,
  onClick,
}) => {
  return (
    <div 
      onClick={isDisabled ? undefined : onClick}
      className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl 
        ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100 transition-colors cursor-pointer'}`}
    >
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex items-center">
        <p className="font-semibold text-brand-pink mr-2">+{reward}</p>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    </div>
  );
};

export default OfferwallItem;
