
import React from 'react';

interface PlanBadgeProps {
  color: string;
  price: number;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ color, price }) => {
  // Get the color class based on plan color
  const getColorClass = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-brand-blue text-white';
      case 'green': return 'bg-brand-green text-white';
      case 'purple': return 'bg-purple-600 text-white';
      case 'red': return 'bg-red-600 text-white';
      case 'cyan': return 'bg-cyan-500 text-white';
      case 'amber': return 'bg-amber-500 text-white';
      case 'gold': return 'bg-yellow-500 text-white';
      case 'pink': return 'bg-pink-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClass(color)}`}>
      ${price}
    </span>
  );
};

export default PlanBadge;
