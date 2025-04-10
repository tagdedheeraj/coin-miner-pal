
// Re-export Firebase client for backward compatibility with existing imports
import { auth, db, storage } from '@/integrations/firebase/client';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Create a mock supabase client that redirects operations to Firebase
export const supabase = {
  // Authentication methods
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        // This is just a compatibility layer, actual auth is handled in auth service
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    signUp: async () => {
      // This is just a compatibility layer, actual auth is handled in auth service
      return { error: null };
    },
    updateUser: async () => {
      // This is just a compatibility layer, actual auth is handled in auth service
      return { error: null };
    },
    getUser: async () => {
      try {
        const currentUser = auth.currentUser;
        return { 
          data: { user: currentUser }, 
          error: null 
        };
      } catch (error) {
        return { data: { user: null }, error };
      }
    }
  },
  // Database methods
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: async (column: string, value: any) => {
            try {
              const q = query(collection(db, table), where(column, '==', value));
              const querySnapshot = await getDocs(q);
              const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              return { data, error: null };
            } catch (error) {
              console.error(`Error querying ${table}:`, error);
              return { data: null, error };
            }
          },
          single: async () => {
            try {
              const querySnapshot = await getDocs(collection(db, table));
              const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))[0] || null;
              return { data, error: null };
            } catch (error) {
              console.error(`Error querying ${table}:`, error);
              return { data: null, error };
            }
          },
          order: (column: string, { ascending }: { ascending: boolean }) => {
            // Simple implementation without actual ordering (would require more complex Firebase query)
            return {
              eq: async (column: string, value: any) => {
                try {
                  const q = query(collection(db, table), where(column, '==', value));
                  const querySnapshot = await getDocs(q);
                  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  return { data, error: null };
                } catch (error) {
                  console.error(`Error querying ${table}:`, error);
                  return { data: null, error };
                }
              }
            };
          }
        };
      },
      insert: (data: any) => {
        return {
          // Return an object with a synchronous structure
          async execute() {
            try {
              await addDoc(collection(db, table), data);
              return { error: null };
            } catch (error) {
              console.error(`Error inserting into ${table}:`, error);
              return { error };
            }
          }
        };
      },
      update: (data: any) => {
        return {
          eq: async (column: string, value: any) => {
            try {
              // Find the document first
              const q = query(collection(db, table), where(column, '==', value));
              const querySnapshot = await getDocs(q);
              
              if (querySnapshot.empty) {
                throw new Error(`No ${table} found with ${column} = ${value}`);
              }
              
              // Update the document
              const docRef = doc(db, table, querySnapshot.docs[0].id);
              await updateDoc(docRef, data);
              
              return { error: null };
            } catch (error) {
              console.error(`Error updating ${table}:`, error);
              return { error };
            }
          }
        };
      }
    };
  }
};

// Re-export Firebase services as well
export { auth, db, storage };
