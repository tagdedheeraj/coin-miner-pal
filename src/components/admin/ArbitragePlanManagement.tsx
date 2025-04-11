
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X, Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ArbitragePlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  totalEarnings: number;
  miningSpeed: string;
  withdrawal: string;
  color: string;
  limited: boolean;
  limitedTo?: number;
}

const ArbitragePlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<ArbitragePlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<ArbitragePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    fetchPlans();
    
    // Set up a subscription to listen for changes
    const planSubscription = supabase
      .channel('arbitrage_plans_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'arbitrage_plans' 
      }, () => {
        fetchPlans();
      })
      .subscribe();
      
    return () => {
      planSubscription.unsubscribe();
    };
  }, []);
  
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('arbitrage_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) {
        toast.error('Failed to fetch plans');
        console.error('Error fetching plans:', error);
        return;
      }
      
      if (data) {
        const mappedPlans = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          dailyEarnings: plan.daily_earnings,
          miningSpeed: plan.mining_speed,
          totalEarnings: plan.total_earnings,
          withdrawal: plan.withdrawal,
          color: plan.color || 'blue',
          limited: plan.limited || false,
          limitedTo: plan.limited_to
        }));
        
        setPlans(mappedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditPlan = (plan: ArbitragePlan) => {
    setEditingPlan({...plan});
  };
  
  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    try {
      // Map the plan to database columns
      const dbPlan = {
        id: editingPlan.id,
        name: editingPlan.name,
        price: editingPlan.price,
        duration: editingPlan.duration,
        daily_earnings: editingPlan.dailyEarnings,
        mining_speed: editingPlan.miningSpeed,
        total_earnings: editingPlan.totalEarnings,
        withdrawal: editingPlan.withdrawal,
        color: editingPlan.color,
        limited: editingPlan.limited,
        limited_to: editingPlan.limitedTo
      };
      
      const { error } = await supabase
        .from('arbitrage_plans')
        .update(dbPlan)
        .eq('id', editingPlan.id);
      
      if (error) {
        toast.error('Failed to update plan');
        console.error('Error updating plan:', error);
        return;
      }
      
      toast.success('Plan updated successfully');
      
      // Update local state
      setPlans(plans.map(plan => 
        plan.id === editingPlan.id ? editingPlan : plan
      ));
      
      setEditingPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan changes');
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
    // Create a new plan with default values
    const newPlan = {
      name: 'New Plan',
      price: 50,
      duration: 30,
      daily_earnings: 2,
      mining_speed: '1.5x',
      total_earnings: 60,
      withdrawal: 'Daily',
      color: 'blue',
      limited: false
    };
    
    try {
      const { data, error } = await supabase
        .from('arbitrage_plans')
        .insert(newPlan)
        .select();
      
      if (error) {
        toast.error('Failed to create new plan');
        console.error('Error creating plan:', error);
        return;
      }
      
      if (data && data[0]) {
        toast.success('New plan created');
        fetchPlans();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create new plan');
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
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
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
                        <>
                          <TableCell className="font-mono text-xs">{plan.id}</TableCell>
                          <TableCell>
                            <Input 
                              name="name"
                              value={editingPlan.name}
                              onChange={handleInputChange}
                              className="w-full max-w-[200px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="price"
                              type="number"
                              value={editingPlan.price}
                              onChange={handleInputChange}
                              className="w-full max-w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="duration"
                              type="number"
                              value={editingPlan.duration}
                              onChange={handleInputChange}
                              className="w-full max-w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="dailyEarnings"
                              type="number"
                              step="0.01"
                              value={editingPlan.dailyEarnings}
                              onChange={handleInputChange}
                              className="w-full max-w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="totalEarnings"
                              type="number"
                              value={editingPlan.totalEarnings}
                              onChange={handleInputChange}
                              className="w-full max-w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="miningSpeed"
                              value={editingPlan.miningSpeed}
                              onChange={handleInputChange}
                              className="w-full max-w-[80px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              name="withdrawal"
                              value={editingPlan.withdrawal}
                              onChange={handleInputChange}
                              className="w-full max-w-[100px]"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <input 
                                type="checkbox"
                                checked={editingPlan.limited}
                                onChange={handleCheckboxChange}
                                className="mr-2"
                              />
                              {editingPlan.limited && (
                                <Input 
                                  name="limitedTo"
                                  type="number"
                                  value={editingPlan.limitedTo || ''}
                                  onChange={handleInputChange}
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
                                onClick={handleSavePlan}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={handleCancelEdit}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
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
                              onClick={() => handleEditPlan(plan)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
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
        )}
      </CardContent>
    </Card>
  );
};

export default ArbitragePlanManagement;
