
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
import { toast } from "sonner";
import { parseNotifications } from '@/utils/notificationUtils';
import UserSearch from './users/UserSearch';
import UserTable from './users/UserTable';
import UserLoadingState from './users/UserLoadingState';

const UserManagement: React.FC = () => {
  const { user, deleteUser, updateUserUsdtEarnings, updateUserCoins, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<{
    email: string;
    field: 'usdtEarnings' | 'coins';
    value: string;
  } | null>(null);

  useEffect(() => {
    // Fetch users from local storage
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users from the auth context
        const allUsers = await getAllUsers();
        
        setUsers(allUsers);
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
  }, [user, getAllUsers]);

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
        <UserSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        {isLoading ? (
          <UserLoadingState />
        ) : (
          <UserTable 
            users={filteredUsers} 
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            handleUpdateUser={handleUpdateUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
