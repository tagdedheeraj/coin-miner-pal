
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';

interface EditablePlanRowProps {
  plan: ArbitragePlan;
  editingPlan: ArbitragePlan;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditablePlanRow: React.FC<EditablePlanRowProps> = ({
  plan,
  editingPlan,
  onInputChange,
  onCheckboxChange,
  onSave,
  onCancel
}) => {
  return (
    <>
      <TableCell className="font-mono text-xs">{plan.id}</TableCell>
      <TableCell>
        <Input 
          name="name"
          value={editingPlan.name}
          onChange={onInputChange}
          className="w-full max-w-[200px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="price"
          type="number"
          value={editingPlan.price}
          onChange={onInputChange}
          className="w-full max-w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="duration"
          type="number"
          value={editingPlan.duration}
          onChange={onInputChange}
          className="w-full max-w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="dailyEarnings"
          type="number"
          step="0.01"
          value={editingPlan.dailyEarnings}
          onChange={onInputChange}
          className="w-full max-w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="totalEarnings"
          type="number"
          value={editingPlan.totalEarnings}
          onChange={onInputChange}
          className="w-full max-w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="miningSpeed"
          value={editingPlan.miningSpeed}
          onChange={onInputChange}
          className="w-full max-w-[80px]"
        />
      </TableCell>
      <TableCell>
        <Input 
          name="withdrawal"
          value={editingPlan.withdrawal}
          onChange={onInputChange}
          className="w-full max-w-[100px]"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <input 
            type="checkbox"
            checked={editingPlan.limited}
            onChange={onCheckboxChange}
            className="mr-2"
          />
          {editingPlan.limited && (
            <Input 
              name="limitedTo"
              type="number"
              value={editingPlan.limitedTo || ''}
              onChange={onInputChange}
              placeholder="Limit"
              className="w-full max-w-[80px]"
            />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSave}
            className="text-green-600 hover:text-green-800 hover:bg-green-50"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
};

export default EditablePlanRow;
