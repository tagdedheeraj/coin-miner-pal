
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const AuthButtons: React.FC = () => {
  return (
    <>
      <Link to="/sign-in">
        <Button variant="outline" size="sm">Sign In</Button>
      </Link>
      <Link to="/sign-up">
        <Button size="sm">Sign Up</Button>
      </Link>
    </>
  );
};
