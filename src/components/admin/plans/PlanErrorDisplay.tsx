
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PlanErrorDisplayProps {
  error: string | null;
}

const PlanErrorDisplay: React.FC<PlanErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 flex items-center text-red-800">
      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
      <p>{error}</p>
    </div>
  );
};

export default PlanErrorDisplay;
