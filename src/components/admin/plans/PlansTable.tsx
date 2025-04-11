
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';
import PlanRow from './PlanRow';
import EditablePlanRow from './EditablePlanRow';

interface PlansTableProps {
  plans: ArbitragePlan[];
  filteredPlans: ArbitragePlan[];
  editingPlan: ArbitragePlan | null;
  loading: boolean;
  onEditPlan: (plan: ArbitragePlan) => void;
  onDeletePlan: (planId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSavePlan: () => void;
  onCancelEdit: () => void;
}

const PlansTable: React.FC<PlansTableProps> = ({
  plans,
  filteredPlans,
  editingPlan,
  loading,
  onEditPlan,
  onDeletePlan,
  onInputChange,
  onCheckboxChange,
  onSavePlan,
  onCancelEdit
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price ($)</TableHead>
            <TableHead>Duration (days)</TableHead>
            <TableHead>Daily Earnings ($)</TableHead>
            <TableHead>Total Earnings ($)</TableHead>
            <TableHead>Mining Speed</TableHead>
            <TableHead>Withdrawal</TableHead>
            <TableHead>Limited</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlans.length > 0 ? (
            filteredPlans.map(plan => (
              <TableRow key={plan.id}>
                {editingPlan && editingPlan.id === plan.id ? (
                  <EditablePlanRow
                    plan={plan}
                    editingPlan={editingPlan}
                    onInputChange={onInputChange}
                    onCheckboxChange={onCheckboxChange}
                    onSave={onSavePlan}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <PlanRow 
                    plan={plan} 
                    onEdit={onEditPlan}
                    onDelete={onDeletePlan}
                  />
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                No plans found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlansTable;
