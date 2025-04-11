
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface PlanActionButtonsProps {
  onRefresh: () => Promise<void>;
  onCreate: () => Promise<void>;
  loading: boolean;
}

const PlanActionButtons: React.FC<PlanActionButtonsProps> = ({
  onRefresh,
  onCreate,
  loading
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        className="flex items-center gap-1"
        onClick={onRefresh}
        variant="outline"
        disabled={loading}
      >
        <RefreshCw className="h-4 w-4" /> Refresh
      </Button>
      <Button 
        className="flex items-center gap-1"
        onClick={onCreate}
        disabled={loading}
      >
        <Plus className="h-4 w-4" /> Add New Plan
      </Button>
    </div>
  );
};

export default PlanActionButtons;
