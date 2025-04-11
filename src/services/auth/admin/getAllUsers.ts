
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { collection, getDocs, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { mapDbToUser } from '@/utils/firebaseUtils';
import { mockUsers } from '@/data/mockUsers';

// Cache for users
let cachedUsers: User[] = [];
let lastFetchTime = 0;

export const getAllUsersFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const getAllUsers = async (forceFresh = true): Promise<User[]> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can view all users');
      return [];
    }
    
    const currentTime = Date.now();
    const cacheExpired = (currentTime - lastFetchTime) > (2 * 60 * 1000); // 2 minutes cache
    
    if (!forceFresh && !cacheExpired && cachedUsers.length > 0) {
      console.log("Returning cached users", cachedUsers);
      return cachedUsers;
    }

    try {
      console.log('Fetching all users from Firestore');
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push(mapDbToUser({
          id: doc.id,
          ...data
        }));
      });
      
      // Update cache
      cachedUsers = users;
      lastFetchTime = currentTime;
      
      console.log('Fetched users:', users);
      
      if (users.length === 0) {
        console.log('No users found, returning mock data');
        return mockUsers;
      }
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      return mockUsers;
    }
  };
  
  // Function to set up real-time listener for users
  const subscribeToUsers = (callback: (users: User[]) => void) => {
    if (!user?.isAdmin) {
      return { unsubscribe: () => {} };
    }
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push(mapDbToUser({
          id: doc.id,
          ...data
        }));
      });
      
      // Update cache
      cachedUsers = users;
      lastFetchTime = Date.now();
      
      callback(users);
    }, (error) => {
      console.error('Error in users subscription:', error);
      toast.error('Failed to subscribe to user updates');
    });
    
    return { unsubscribe };
  };

  return { 
    getAllUsers,
    subscribeToUsers
  };
};
