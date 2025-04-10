
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
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
  );
};

export default UserSearch;
