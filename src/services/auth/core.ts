
import { Dispatch, SetStateAction } from 'react';
import { User } from '@/types/auth';
import { createAuthenticationService } from './authentication';
import { createRegistrationService } from './registration';
import { createPasswordService } from './passwordManagement/index';

export const coreAuthFunctions = (
  user: User | null, 
  setUser: Dispatch<SetStateAction<User | null>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) => {
  
  // Initialize authentication services
  const authenticationService = createAuthenticationService(user, setUser, setIsLoading);
  const registrationService = createRegistrationService(user, setUser, setIsLoading);
  const passwordService = createPasswordService(user);
  
  // Combine all core services
  return {
    ...authenticationService,
    ...registrationService,
    ...passwordService
  };
};
