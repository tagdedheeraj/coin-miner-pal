
// Supabase client compatibility layer for Firebase migration
// This provides API compatibility during migration period

import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc, orderBy, limit } from "firebase/firestore";
import { db as firebaseDb, auth as firebaseAuth, storage as firebaseStorage } from '@/integrations/firebase/client';
import { logMigrationWarning } from '@/utils/migrationUtils';

// Export Firebase instances under Supabase-compatible names
export const db = firebaseDb;
export const auth = firebaseAuth;
export const storage = firebaseStorage;

// Mock Supabase client with Firebase implementations
export const supabase = {
  auth: {
    getUser: async () => {
      const user = firebaseAuth.currentUser;
      return {
        data: { user },
        error: user ? null : new Error('Not authenticated')
      };
    },
    signOut: async () => {
      try {
        await firebaseAuth.signOut();
        return { error: null };
      } catch (error) {
        return { error };
      }
    }
  },
  from: (table: string) => {
    logMigrationWarning(`Using 'supabase.from(${table})' - This is a compatibility layer`);
    
    return {
      select: (fields = '*') => {
        const selectQuery = {
          eq: async (column: string, value: any) => {
            try {
              const q = query(collection(firebaseDb, table), where(column, '==', value));
              const querySnapshot = await getDocs(q);
              const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          single: async () => {
            try {
              const querySnapshot = await getDocs(collection(firebaseDb, table));
              if (querySnapshot.empty) {
                return { data: null, error: null };
              }
              const doc = querySnapshot.docs[0];
              return { data: { id: doc.id, ...doc.data() }, error: null };
            } catch (error) {
              return { data: null, error };
            }
          },
          order: (column: string, { ascending = true } = {}) => {
            return {
              eq: async (filterColumn: string, value: any) => {
                try {
                  const q = query(
                    collection(firebaseDb, table),
                    where(filterColumn, '==', value),
                    orderBy(column, ascending ? 'asc' : 'desc')
                  );
                  const querySnapshot = await getDocs(q);
                  const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  return { data, error: null };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          }
        };

        // Fix for chaining methods - return as properties, not promises
        return selectQuery;
      },
      insert: async (data: any) => {
        try {
          const newDocRef = doc(collection(firebaseDb, table));
          await setDoc(newDocRef, { ...data, created_at: new Date().toISOString() });
          return { data: { id: newDocRef.id, ...data }, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
      update: (data: any) => {
        const updateQuery = {
          eq: async (column: string, value: any) => {
            try {
              const q = query(collection(firebaseDb, table), where(column, '==', value));
              const querySnapshot = await getDocs(q);
              
              if (querySnapshot.empty) {
                return { error: new Error('No document found to update') };
              }
              
              const docRef = doc(firebaseDb, table, querySnapshot.docs[0].id);
              await updateDoc(docRef, { ...data, updated_at: new Date().toISOString() });
              return { error: null };
            } catch (error) {
              return { error };
            }
          }
        };
        
        // Return as object, not promise
        return updateQuery;
      },
      delete: () => {
        const deleteQuery = {
          eq: async (column: string, value: any) => {
            try {
              const q = query(collection(firebaseDb, table), where(column, '==', value));
              const querySnapshot = await getDocs(q);
              
              if (querySnapshot.empty) {
                return { error: new Error('No document found to delete') };
              }
              
              const docRef = doc(firebaseDb, table, querySnapshot.docs[0].id);
              await deleteDoc(docRef);
              return { error: null };
            } catch (error) {
              return { error };
            }
          }
        };
        
        // Return as object, not promise
        return deleteQuery;
      },
      execute: async () => {
        try {
          const querySnapshot = await getDocs(collection(firebaseDb, table));
          return { error: null };
        } catch (error) {
          return { error };
        }
      },
      // Add base-level order method
      order: (column: string, { ascending = true } = {}) => {
        return {
          eq: async (filterColumn: string, value: any) => {
            try {
              const q = query(
                collection(firebaseDb, table),
                where(filterColumn, '==', value),
                orderBy(column, ascending ? 'asc' : 'desc')
              );
              const querySnapshot = await getDocs(q);
              const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              return { data, error: null };
            } catch (error) {
              return { data: null, error };
            }
          }
        };
      }
    };
  },
  storage: {
    from: (bucket: string) => {
      return {
        upload: async (path: string, file: File) => {
          logMigrationWarning('Storage operations not yet implemented in migration layer');
          return { data: null, error: new Error('Not implemented') };
        },
        getPublicUrl: (path: string) => {
          logMigrationWarning('Storage operations not yet implemented in migration layer');
          return { publicUrl: '' };
        }
      };
    }
  }
};

// Export a helper for Firebase operations that's type-compatible with Supabase responses
export const firebaseHelper = {
  // Other methods can be added as needed
};
