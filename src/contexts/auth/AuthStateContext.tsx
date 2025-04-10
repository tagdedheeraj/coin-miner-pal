
import { createContext, ReactNode } from 'react';
import { User } from '@/types/auth';

interface AuthStateContextType {
  user: User | null;
  isLoading: boolean;
}

export const AuthStateContext = createContext<AuthStateContextType | null>(null);

interface AuthStateProviderProps {
  children: ReactNode;
  value: AuthStateContextType;
}

export const AuthStateProvider: React.FC<AuthStateProviderProps> = ({ 
  children, 
  value 
}) => {
  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
};
