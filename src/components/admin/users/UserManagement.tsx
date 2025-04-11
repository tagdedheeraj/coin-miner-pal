
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2 } from 'lucide-react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { mapDbToUser } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

interface UserManagementProps {
  deleteUser: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ deleteUser }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    fetchAllUsers();
  }, []);
  
  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const mappedUsers = data?.map(dbUser => mapDbToUser(dbUser)) || [];
      setAllUsers(mappedUsers);
      toast.success('User list refreshed');
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      // Remove user from local state
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    }
  };
  
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
          <Button 
            variant="outline" 
            onClick={fetchAllUsers}
          >
            Refresh
          </Button>
        </div>
        
        {loadingUsers ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                      <TableCell>{u.email || 'N/A'}</TableCell>
                      <TableCell>{u.coins}</TableCell>
                      <TableCell>{u.usdtEarnings || 0}</TableCell>
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
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
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
