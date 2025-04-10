
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/auth';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

const UserManagement: React.FC = () => {
  const { user, deleteUser, updateUserUsdtEarnings, updateUserCoins } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<{
    email: string;
    field: 'usdtEarnings' | 'coins';
    value: string;
  } | null>(null);

  useEffect(() => {
    // Fetch real users from Supabase
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real users from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*');
          
        if (error) throw error;
        
        // Map from database format to User format
        const mappedUsers = data.map(userData => ({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          coins: userData.coins,
          referralCode: userData.referral_code,
          hasSetupPin: userData.has_setup_pin,
          hasBiometrics: userData.has_biometrics,
          withdrawalAddress: userData.withdrawal_address,
          appliedReferralCode: userData.applied_referral_code,
          usdtEarnings: userData.usdt_earnings,
          notifications: userData.notifications,
          isAdmin: userData.is_admin
        }));
        
        setUsers(mappedUsers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setIsLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user]);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      if (editingUser.field === 'usdtEarnings') {
        await updateUserUsdtEarnings(
          editingUser.email, 
          parseFloat(editingUser.value)
        );
        toast.success('USDT earnings updated successfully');
      } else if (editingUser.field === 'coins') {
        await updateUserCoins(
          editingUser.email, 
          parseInt(editingUser.value, 10)
        );
        toast.success('Coins updated successfully');
      }
      
      // Update the local users state to reflect the change
      setUsers(users.map(u => {
        if (u.email === editingUser.email) {
          return {
            ...u,
            [editingUser.field]: editingUser.field === 'usdtEarnings' 
              ? parseFloat(editingUser.value) 
              : parseInt(editingUser.value, 10)
          };
        }
        return u;
      }));
      
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user?.isAdmin) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to view this page.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all users in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Coins</TableHead>
                  <TableHead>USDT Earnings</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {editingUser && editingUser.email === u.email && editingUser.field === 'coins' ? (
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              value={editingUser.value}
                              onChange={(e) => setEditingUser({...editingUser, value: e.target.value})}
                              className="w-24"
                              autoFocus
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleUpdateUser}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingUser(null)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{u.coins}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingUser({ email: u.email, field: 'coins', value: u.coins.toString() })}
                              className="opacity-50 hover:opacity-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingUser && editingUser.email === u.email && editingUser.field === 'usdtEarnings' ? (
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              value={editingUser.value}
                              onChange={(e) => setEditingUser({...editingUser, value: e.target.value})}
                              className="w-24"
                              autoFocus
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleUpdateUser}
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingUser(null)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{u.usdtEarnings || 0}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingUser({ 
                                email: u.email, 
                                field: 'usdtEarnings', 
                                value: (u.usdtEarnings || 0).toString() 
                              })}
                              className="opacity-50 hover:opacity-100"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{u.referralCode}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No users found
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

export default UserManagement;
