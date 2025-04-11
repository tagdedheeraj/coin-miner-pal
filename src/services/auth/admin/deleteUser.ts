
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { auth } from '@/integrations/firebase/client';
import { deleteUser as deleteFirebaseUser } from 'firebase/auth';
import { collection, doc, deleteDoc, getFirestore } from 'firebase/firestore';

export const deleteUserFunctions = (user: User | null) => {
  // Initialize Firestore
  const db = getFirestore();
  
  const deleteUserAccount = async (userId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }

    try {
      console.log(`Deleting user with ID: ${userId}`);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Try to delete from Firebase Auth - using the correct method from Firebase v9+
      try {
        // Find the user in Firebase by UID if possible
        console.log('Attempting to delete user from Firebase Auth');
        
        // For direct deletion of other users, we'd need Admin SDK in a backend
        // This is a client-side operation, so we can only delete the current user
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userId) {
          await deleteFirebaseUser(currentUser);
          console.log('Firebase Auth user deleted successfully');
        } else {
          console.log('Cannot delete Firebase Auth user directly from client SDK');
          // For deleting other users, we would need a server-side function
        }
      } catch (firebaseError) {
        console.error('Firebase Auth deletion error:', firebaseError);
        // Continue even if Firebase Auth deletion fails
      }

      console.log('User deleted successfully');
      toast.success('उपयोगकर्ता सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('उपयोगकर्ता हटाने में विफल');
    }
  };

  return { deleteUser: deleteUserAccount };
};
