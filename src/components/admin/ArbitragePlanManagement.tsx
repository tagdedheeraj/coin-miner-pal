
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
import { Search, Plus, RefreshCw } from 'lucide-react';
import { ArbitragePlan } from '@/types/arbitragePlans';
import PlansTable from './plans/PlansTable';
import { 
  fetchArbitragePlans,
  updateArbitragePlan,
  createArbitragePlan,
  subscribeToPlanChanges
} from '@/services/arbitragePlanService';
import { toast } from 'sonner';

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
      try {
        const data = await fetchArbitragePlans(true); // Force fresh data
        console.log("Fetched plans:", data);
        setPlans(data);
      } catch (error) {
        console.error("Error loading plans:", error);
        toast.error("योजनाओं को लोड करने में त्रुटि हुई");
      } finally {
        setLoading(false);
      }
    };
    
    loadPlans();
    
    // Set up a subscription to listen for changes
    const planSubscription = subscribeToPlanChanges(() => {
      console.log("Plan changes detected, refreshing...");
      loadPlans();
    });
      
    return () => {
      console.log("Unsubscribing from plan changes");
      planSubscription.unsubscribe();
    };
  }, []);
  
  const handleEditPlan = (plan: ArbitragePlan) => {
    console.log("Editing plan:", plan);
    setEditingPlan({...plan});
  };
  
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    setLoading(true);
    console.log("Saving plan changes:", editingPlan);
    
    const success = await updateArbitragePlan(editingPlan);
    
    if (success) {
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      setEditingPlan(null);
      
      // Refresh plans from server to ensure we have the latest data
      const updatedPlans = await fetchArbitragePlans(true);
      setPlans(updatedPlans);
    }
    
    setLoading(false);
  };
  
  const handleCancelEdit = () => {
    console.log("Cancelling edit");
    setEditingPlan(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingPlan) return;
    
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    
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
    
    console.log(`Changing limited to ${e.target.checked}`);
    setEditingPlan({
      ...editingPlan,
      limited: e.target.checked
    });
  };

  const handleCreateNewPlan = async () => {
    setLoading(true);
    console.log("Creating new plan");
    
    const success = await createArbitragePlan();
    
    if (success) {
      // Refresh the plans list
      const data = await fetchArbitragePlans(true);
      console.log("Plans after creating new one:", data);
      setPlans(data);
    }
    
    setLoading(false);
  };
  
  const handleRefreshPlans = async () => {
    setLoading(true);
    console.log("Manually refreshing plans");
    
    try {
      const freshPlans = await fetchArbitragePlans(true);
      console.log("Refreshed plans:", freshPlans);
      setPlans(freshPlans);
      toast.success("योजनाएं रिफ्रेश की गईं");
    } catch (error) {
      console.error("Error refreshing plans:", error);
      toast.error("योजनाओं को रिफ्रेश करने में त्रुटि हुई");
    } finally {
      setLoading(false);
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
            onClick={handleRefreshPlans}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button 
            className="flex items-center gap-1"
            onClick={handleCreateNewPlan}
            disabled={loading}
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
