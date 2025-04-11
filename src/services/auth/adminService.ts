
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import { mapUserToDb, mapDbToUser } from '@/utils/supabaseUtils';
import { deleteUser as deleteFirebaseUser } from 'firebase/auth';
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
      console.log(`Updating USDT earnings for ${email} to ${amount}`);
      
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('User not found:', userError);
        toast.error('उपयोगकर्ता नहीं मिला');
        throw new Error('User not found');
      }
      
      const targetUser = mapDbToUser(userData);
      console.log('Found user to update:', targetUser);
      
      const userNotifications = targetUser.notifications || [];
      
      // Update USDT earnings and add notification
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
        
      if (error) {
        console.error('Error updating USDT earnings:', error);
        throw error;
      }
      
      console.log('USDT earnings updated successfully');
      toast.success(`${email} के लिए USDT अर्निंग अपडेट की गई`);
    } catch (error) {
      console.error('Error updating USDT earnings:', error);
      toast.error(error instanceof Error ? error.message : 'USDT अर्निंग अपडेट करने में विफल');
      throw error;
    }
  };

  const updateUserCoins = async (email: string, amount: number): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can update user coins');
      return;
    }

    try {
      console.log(`Updating coins for ${email} to ${amount}`);
      
      // Find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError) {
        console.error('User not found:', userError);
        toast.error('उपयोगकर्ता नहीं मिला');
        throw new Error('User not found');
      }
      
      const targetUser = mapDbToUser(userData);
      console.log('Found user to update coins:', targetUser);
      
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
        
      if (error) {
        console.error('Error updating coins:', error);
        throw error;
      }
      
      console.log('Coins updated successfully');
      toast.success(`${email} के लिए सिक्के अपडेट किए गए`);
    } catch (error) {
      console.error('Error updating coins:', error);
      toast.error(error instanceof Error ? error.message : 'सिक्के अपडेट करने में विफल');
      throw error;
    }
  };

  const deleteUserAccount = async (userId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      console.log(`Deleting user with ID: ${userId}`);
      
      // Delete from Supabase first
      const { error: supabaseError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (supabaseError) {
        console.error('Error deleting from Supabase:', supabaseError);
        throw supabaseError;
      }

      // Try to delete from Firebase - using the correct method from Firebase v9+
      try {
        // Find the user in Firebase by UID if possible
        console.log('Attempting to delete user from Firebase');
        
        // For direct deletion of other users, we need to use Admin SDK in a secure backend
        // This is a client-side operation, so we can only delete the current user
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userId) {
          await deleteFirebaseUser(currentUser);
          console.log('Firebase user deleted successfully');
        } else {
          console.log('Cannot delete Firebase user directly from client SDK for security reasons');
          // For deleting other users, we would need a server-side function
        }
      } catch (firebaseError) {
        console.error('Firebase deletion error:', firebaseError);
        // Continue even if Firebase deletion fails
      }

      console.log('User deleted successfully');
      toast.success('उपयोगकर्ता सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('उपयोगकर्ता हटाने में विफल');
      throw error;
    }
  };
  
  return {
    getAllUsers,
    updateUserUsdtEarnings,
    updateUserCoins,
    deleteUser: deleteUserAccount
  };
};
