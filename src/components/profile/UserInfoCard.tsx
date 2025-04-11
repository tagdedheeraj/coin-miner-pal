
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/auth';

interface UserInfoCardProps {
  user: User;
  signOut: () => void;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ user, signOut }) => {
  return (
    <div className="glass-card rounded-2xl p-6 mb-6 animate-scale-up">
      <div className="flex items-center mb-6">
        <div className="w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl mr-4">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="font-semibold text-xl">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        onClick={signOut}
        className="w-full rounded-xl h-12 border-gray-200 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300"
      >
        <LogOut size={16} className="mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default UserInfoCard;
