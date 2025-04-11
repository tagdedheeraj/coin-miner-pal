
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';

interface PlanRowProps {
  plan: ArbitragePlan;
  onEdit: (plan: ArbitragePlan) => void;
}

const PlanRow: React.FC<PlanRowProps> = ({ plan, onEdit }) => {
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
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(plan)}
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </>
  );
};

export default PlanRow;
