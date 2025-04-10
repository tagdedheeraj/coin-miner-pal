
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Award, LogOut, User, Wallet, LayoutDashboard, Settings, Users } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  closeMenu: () => void;
  handleSignOut: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, closeMenu, handleSignOut }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="md:hidden absolute top-14 left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-lg">
      <nav className="container mx-auto px-4 py-2 flex flex-col">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
            <Link to="/mining" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              <Award className="mr-2 h-4 w-4" />
              Mining
            </Link>
            <Link to="/rewards" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              <Award className="mr-2 h-4 w-4" />
              Rewards
            </Link>
            <Link to="/wallet" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Link>
            <Link to="/profile" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            
            {user?.isAdmin && (
              <>
                <Link to="/admin" 
                  className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
                <Link to="/admin-dashboard" 
                  className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}>
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
                <Link to="/admin-management" 
                  className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                  onClick={closeMenu}>
                  <Users className="mr-2 h-4 w-4" />
                  Admin Management
                </Link>
              </>
            )}
          
            <Button variant="ghost" size="sm" className="justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Link to="/sign-in" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              Sign In
            </Link>
            <Link to="/sign-up" 
              className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
              onClick={closeMenu}>
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};
