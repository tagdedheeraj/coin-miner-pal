
import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SecurityItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  rightElement?: ReactNode;
}

const SecurityItem: React.FC<SecurityItemProps> = ({ 
  icon, 
  title, 
  description, 
  onClick,
  rightElement
}) => {
  return (
    <div 
      className={`flex items-center justify-between py-3 border-b border-gray-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {rightElement || (onClick && <ChevronRight size={18} className="text-gray-400" />)}
    </div>
  );
};

export default SecurityItem;
