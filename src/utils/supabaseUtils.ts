
// This is a stub file to prevent build errors
// We are transitioning away from Supabase to Firebase

import { User, WithdrawalRequest, DepositRequest } from '@/types/auth';

// These functions are deprecated and will be replaced with Firebase equivalents
export const mapDbToUser = (data: any): User => {
  console.warn('mapDbToUser from supabaseUtils is deprecated');
  return {} as User;
};

export const mapUserToDb = (user: Partial<User>) => {
  console.warn('mapUserToDb from supabaseUtils is deprecated');
  return {};
};

export const mapDbToWithdrawal = (data: any): WithdrawalRequest => {
  console.warn('mapDbToWithdrawal from supabaseUtils is deprecated');
  return {} as WithdrawalRequest;
};

export const mapWithdrawalToDb = (withdrawal: Partial<WithdrawalRequest>) => {
  console.warn('mapWithdrawalToDb from supabaseUtils is deprecated');
  return {};
};

export const mapDbToDeposit = (data: any): DepositRequest => {
  console.warn('mapDbToDeposit from supabaseUtils is deprecated');
  return {} as DepositRequest;
};

export const mapDepositToDb = (deposit: Partial<DepositRequest>) => {
  console.warn('mapDepositToDb from supabaseUtils is deprecated');
  return {};
};
