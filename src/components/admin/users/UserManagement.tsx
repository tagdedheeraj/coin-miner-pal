
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, RefreshCw } from 'lucide-react';
import { User } from '@/types/auth';
import { toast } from 'sonner';

interface UserManagementProps {
  deleteUser: (userId: string) => void;
  users?: User[]; // Make this prop optional
}

const UserManagement: React.FC<UserManagementProps> = ({ deleteUser, users: providedUsers }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    if (providedUsers && providedUsers.length > 0) {
      // If users are provided as props, use them
      console.log('Using provided users:', providedUsers.length);
      setAllUsers(providedUsers);
      setLoadingUsers(false);
    } else {
      // No users provided and no way to fetch them without calling getAllUsers
      console.log('No users provided');
      setAllUsers([]);
      setLoadingUsers(false);
      toast.error('No users data available. Please refresh.');
    }
  }, [providedUsers]);
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं?')) {
      deleteUser(userId);
      // Remove user from local state
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('उपयोगकर्ता सफलतापूर्वक हटा दिया गया');
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
