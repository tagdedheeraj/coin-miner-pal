
import React from 'react';
import { User } from '@/types/auth';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import EditableField from './EditableField';

interface UserTableProps {
  users: User[];
  editingUser: {
    email: string;
    field: 'usdtEarnings' | 'coins';
    value: string;
  } | null;
  setEditingUser: React.Dispatch<React.SetStateAction<{
    email: string;
    field: 'usdtEarnings' | 'coins';
    value: string;
  } | null>>;
  handleUpdateUser: () => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  editingUser, 
  setEditingUser, 
  handleUpdateUser, 
  handleDeleteUser 
}) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No users found
      </div>
    );
  }

  return (
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
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <EditableField
                  value={u.coins}
                  isEditing={editingUser?.email === u.email && editingUser?.field === 'coins'}
                  editValue={editingUser?.field === 'coins' ? editingUser.value : u.coins.toString()}
                  onEditStart={() => setEditingUser({ email: u.email, field: 'coins', value: u.coins.toString() })}
                  onEditChange={(value) => setEditingUser(prev => prev ? {...prev, value} : null)}
                  onEditSave={handleUpdateUser}
                  onEditCancel={() => setEditingUser(null)}
                />
              </TableCell>
              <TableCell>
                <EditableField
                  value={u.usdtEarnings || 0}
                  isEditing={editingUser?.email === u.email && editingUser?.field === 'usdtEarnings'}
                  editValue={editingUser?.field === 'usdtEarnings' ? editingUser.value : (u.usdtEarnings || 0).toString()}
                  onEditStart={() => setEditingUser({ email: u.email, field: 'usdtEarnings', value: (u.usdtEarnings || 0).toString() })}
                  onEditChange={(value) => setEditingUser(prev => prev ? {...prev, value} : null)}
                  onEditSave={handleUpdateUser}
                  onEditCancel={() => setEditingUser(null)}
                />
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
