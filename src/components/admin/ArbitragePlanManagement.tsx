
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';
import PlansTable from './plans/PlansTable';
import { 
  fetchArbitragePlans,
  updateArbitragePlan,
  createArbitragePlan,
  subscribeToPlanChanges
} from '@/services/arbitragePlanService';

const ArbitragePlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<ArbitragePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<ArbitragePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      const data = await fetchArbitragePlans();
      setPlans(data);
      setLoading(false);
    };
    
    loadPlans();
    
    // Set up a subscription to listen for changes
    const planSubscription = subscribeToPlanChanges(() => {
      loadPlans();
    });
      
    return () => {
      planSubscription.unsubscribe();
    };
  }, []);
  
  const handleEditPlan = (plan: ArbitragePlan) => {
    setEditingPlan({...plan});
  };
  
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    const success = await updateArbitragePlan(editingPlan);
    
    if (success) {
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      setEditingPlan(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingPlan(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    const { name, value } = e.target;
    
    setEditingPlan({
      ...editingPlan,
      [name]: name === 'name' ? value : 
              name === 'limited' ? value === 'true' :
              name === 'limitedTo' && value === '' ? undefined :
              parseFloat(value) || 0
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      limited: e.target.checked
    });
  };

  const handleCreateNewPlan = async () => {
    const success = await createArbitragePlan();
    
    if (success) {
      // Refresh the plans list
      const data = await fetchArbitragePlans();
      setPlans(data);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Arbitrage Plan Management</CardTitle>
        <CardDescription>Manage all arbitrage plans in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search plans..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            className="flex items-center gap-1"
            onClick={handleCreateNewPlan}
          >
            <Plus className="h-4 w-4" /> Add New Plan
          </Button>
        </div>
        
        <PlansTable
          plans={plans}
          filteredPlans={filteredPlans}
          editingPlan={editingPlan}
          loading={loading}
          onEditPlan={handleEditPlan}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onSavePlan={handleSavePlan}
          onCancelEdit={handleCancelEdit}
        />
      </CardContent>
    </Card>
  );
};

export default ArbitragePlanManagement;
