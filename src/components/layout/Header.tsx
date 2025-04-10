import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, Home, User, LogOut, Award, Wallet, Users, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const getLinkClass = (path: string) => {
    return cn(
      "text-sm font-normal",
      location.pathname === path ? "text-brand-blue" : "text-gray-600 hover:text-brand-blue"
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center font-bold text-xl text-brand-blue">
          Infinium
        </Link>
        
        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-600 hover:text-brand-blue focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className={cn("hidden md:flex items-center space-x-1 flex-grow justify-center",
          isOpen ? "hidden" : "")}>
          {isAuthenticated && (
            <>
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
            </>
          )}
        </nav>

        {/* Auth Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
        
        {/* Mobile Navigation Menu */}
        {isOpen && (
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
        )}
      </div>
    </header>
  );
};

export default Header;
