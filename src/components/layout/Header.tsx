
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesktopNav } from './desktop-nav/DesktopNav';
import { MobileNav } from './mobile-nav/MobileNav';
import { ProfileDropdown } from './profile-dropdown/ProfileDropdown';
import { AuthButtons } from './auth-buttons/AuthButtons';
import { NotificationDropdown } from './NotificationDropdown';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
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
        <DesktopNav getLinkClass={getLinkClass} />

        {/* Auth Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <ProfileDropdown handleSignOut={handleSignOut} />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
        
        {/* Mobile Navigation Menu */}
        <MobileNav 
          isOpen={isOpen} 
          closeMenu={closeMenu} 
          handleSignOut={handleSignOut} 
        />
      </div>
    </header>
  );
};

export default Header;
