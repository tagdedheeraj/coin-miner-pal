
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface PlanFilterControlsProps {
  searchTerm: string;
  showOnlyActive: boolean;
  onSearchChange: (value: string) => void;
  onActiveFilterChange: (checked: boolean) => void;
}

const PlanFilterControls: React.FC<PlanFilterControlsProps> = ({
  searchTerm,
  showOnlyActive,
  onSearchChange,
  onActiveFilterChange
}) => {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search plans..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <Switch 
            checked={showOnlyActive} 
            onCheckedChange={onActiveFilterChange} 
            id="active-filter"
          />
          <label htmlFor="active-filter" className="text-sm">
            Show active plans only
          </label>
        </div>
      </div>
    </div>
  );
};

export default PlanFilterControls;
