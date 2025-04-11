
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';

interface PlanRowProps {
  plan: ArbitragePlan;
  onEdit: (plan: ArbitragePlan) => void;
  onDelete: (planId: string) => void;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, onEdit, onDelete }) => {
  return (
    <>
      <TableCell className="font-mono text-xs">{plan.id}</TableCell>
      <TableCell className="font-medium">{plan.name}</TableCell>
      <TableCell>${plan.price}</TableCell>
      <TableCell>{plan.duration}</TableCell>
      <TableCell>${plan.dailyEarnings.toFixed(2)}</TableCell>
      <TableCell>${plan.totalEarnings}</TableCell>
      <TableCell>{plan.miningSpeed}</TableCell>
      <TableCell>{plan.withdrawal}</TableCell>
      <TableCell>
        {plan.limited ? `Yes (${plan.limitedTo})` : 'No'}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(plan)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(plan.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
};

export default PlanRow;
