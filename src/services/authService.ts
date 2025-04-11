
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { generateReferralCode } from '@/utils/referral';
import { coreAuthFunctions } from './auth/core';
import { userServiceFunctions } from './auth/userService';
import { referralServiceFunctions } from './auth/referralService';
import { notificationServiceFunctions } from './auth/notificationService';
import { adminServiceFunctions } from './auth/admin'; // Updated import path
import { withdrawalServiceFunctions } from './auth/withdrawalService';
import { depositServiceFunctions } from './auth/depositService';

export const authFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  // Initialize all service functions
  const core = coreAuthFunctions(user, setUser, setIsLoading);
  const userService = userServiceFunctions(user, setUser);
  const referralService = referralServiceFunctions(user, setUser);
  const notificationService = notificationServiceFunctions(user, setUser);
  const adminService = adminServiceFunctions(user);
  const withdrawalService = withdrawalServiceFunctions(user, setUser);
  const depositService = depositServiceFunctions(user, setUser);
  
  // Combine all services into one object
  return {
    // Core authentication
    ...core,
    
    // User management
    ...userService,
    
    // Referral management
    ...referralService,
    
    // Notification management
    ...notificationService,
    
    // Admin functions
    ...adminService,
    
    // Withdrawal management
    ...withdrawalService,
    
    // Deposit management
    ...depositService
  };
};
