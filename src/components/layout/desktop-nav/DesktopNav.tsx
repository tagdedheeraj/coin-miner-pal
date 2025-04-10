
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DesktopNavProps {
  getLinkClass: (path: string) => string;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ getLinkClass }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="hidden md:flex items-center space-x-1 flex-grow justify-center">
      <Link to="/dashboard" className={getLinkClass('/dashboard')}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          Dashboard
        </Button>
      </Link>
      <Link to="/mining" className={getLinkClass('/mining')}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          Mining
        </Button>
      </Link>
      <Link to="/rewards" className={getLinkClass('/rewards')}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          Rewards
        </Button>
      </Link>
      <Link to="/wallet" className={getLinkClass('/wallet')}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          Wallet
        </Button>
      </Link>
      <Link to="/profile" className={getLinkClass('/profile')}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          Profile
        </Button>
      </Link>
      
      {user?.isAdmin && (
        <>
          <Link to="/admin" className={getLinkClass('/admin')}>
            <Button variant="ghost" size="sm" className="text-sm font-normal">
              Admin Panel
            </Button>
          </Link>
          <Link to="/admin-dashboard" className={getLinkClass('/admin-dashboard')}>
            <Button variant="ghost" size="sm" className="text-sm font-normal">
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/admin-management" className={getLinkClass('/admin-management')}>
            <Button variant="ghost" size="sm" className="text-sm font-normal">
              Admin Management
            </Button>
          </Link>
        </>
      )}
    </nav>
  );
};
