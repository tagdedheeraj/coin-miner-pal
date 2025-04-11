
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';
import { deleteUser as deleteFirebaseUser, getAuth } from 'firebase/auth';
import { collection, getDocs, query, where, getFirestore, deleteDoc, doc } from 'firebase/firestore';

export const adminServiceFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  
  const getAllUsers = async (): Promise<User[]> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can access user list');
      return [];
    }

    try {
      console.log('Fetching all users from Supabase...');
      
      // Get users from Supabase
      const { data: supabaseUsers, error: supabaseError } = await supabase
        .from('users')
        .select('*');
      
      if (supabaseError) {
        console.error('Supabase error fetching users:', supabaseError);
        throw supabaseError;
      }
      
      console.log('Received users from Supabase:', supabaseUsers);
      
      // Map all users from Supabase format to our User format
      const mappedUsers = supabaseUsers?.map(dbUser => mapDbToUser(dbUser)) || [];
      console.log('Mapped users:', mappedUsers);
      
      return mappedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return [];
    }
  };

  const updateUserUsdtEarnings = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update USDT earnings');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      
      // Update USDT earnings and add notification in both Supabase and Firebase
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          referralCode: targetUser.referralCode,
          usdtEarnings: amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your USDT earnings have been updated from ${targetUser.usdtEarnings || 0} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
        
      if (error) throw error;
      
      toast.success(`USDT earnings updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update USDT earnings');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) throw new Error('User not found');
      
      const targetUser = mapDbToUser(userData);
      const userNotifications = targetUser.notifications || [];
      
      // Update coins and add notification
      const { error } = await supabase
        .from('users')
        .update(mapUserToDb({
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          referralCode: targetUser.referralCode,
          coins: amount,
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your coin balance has been updated from ${targetUser.coins} to ${amount} by admin.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        }))
        .eq('id', targetUser.id);
        
      if (error) throw error;
      
      toast.success(`Coins updated for ${email}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update coins');
      throw error;
    }
  };

  const deleteUserAccount = async (userId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      // Delete from Supabase first
      const { error: supabaseError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (supabaseError) throw supabaseError;

      // Try to delete from Firebase - using the correct method from Firebase v9+
      try {
        // We need to get the current auth user, not try to fetch by ID directly
        // Firebase Admin SDK would have getUser(), but we're using client SDK
        const currentUser = auth.currentUser;
        
        // Only attempt deletion if we're trying to delete the current user
        if (currentUser && currentUser.uid === userId) {
          await deleteFirebaseUser(currentUser);
        } else {
          console.log('Cannot delete Firebase user directly from client SDK for security reasons');
          // Note: We would need Firebase Admin SDK or a server function to delete other users
        }
      } catch (firebaseError) {
        console.error('Firebase deletion error:', firebaseError);
        // Continue even if Firebase deletion fails
      }

      toast.success('User deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user');
      throw error;
    }
  };
  
  return {
    getAllUsers,
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUserAccount
  };
};
