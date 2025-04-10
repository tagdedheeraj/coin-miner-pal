
import React, { useState, useContext } from 'react';
import { AuthStateContext } from './AuthStateContext';
import { User } from '@/types/auth';

export const useAuthData = () => {
  const authState = useContext(AuthStateContext);
  
  if (!authState) {
    throw new Error('useAuthData must be used within an AuthStateProvider');
  }
  
  const { user: initialUser, isLoading: initialIsLoading } = authState;
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(initialIsLoading);
  
  return {
    user,
    setUser,
    isLoading,
    setIsLoading
  };
};
