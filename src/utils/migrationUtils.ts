
/**
 * Utility functions to help with the migration from Supabase to Firebase
 * This file provides temporary compatibility layer functions that will be removed
 * once the migration is complete
 */

import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

/**
 * Log a migration warning to help identify code that needs updating
 */
export const logMigrationWarning = (message: string) => {
  console.warn(`[Migration Warning] ${message}`);
};

/**
 * Mock function to emulate Supabase query but using Firebase Firestore
 */
export const mockSupabaseQuery = async (
  table: string, 
  whereClause?: { field: string; value: any },
  orderBy?: { field: string; ascending: boolean }
) => {
  try {
    let q;
    if (whereClause) {
      q = query(collection(db, table), where(whereClause.field, '==', whereClause.value));
    } else {
      q = collection(db, table);
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Simple client-side sorting if orderBy is provided
    if (orderBy) {
      data.sort((a, b) => {
        if (a[orderBy.field] < b[orderBy.field]) return orderBy.ascending ? -1 : 1;
        if (a[orderBy.field] > b[orderBy.field]) return orderBy.ascending ? 1 : -1;
        return 0;
      });
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error in mockSupabaseQuery for ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Helper function to update a document in Firestore
 */
export const updateFirestoreDoc = async (
  table: string,
  id: string,
  data: any
) => {
  try {
    const docRef = doc(db, table, id);
    await updateDoc(docRef, data);
    return { error: null };
  } catch (error) {
    console.error(`Error updating document in ${table}:`, error);
    return { error };
  }
};

/**
 * Helper function to create a document in Firestore
 */
export const createFirestoreDoc = async (
  table: string,
  data: any,
  id?: string
) => {
  try {
    if (id) {
      const docRef = doc(db, table, id);
      await setDoc(docRef, data);
      return { data: { id, ...data }, error: null };
    } else {
      const docRef = await addDoc(collection(db, table), data);
      return { data: { id: docRef.id, ...data }, error: null };
    }
  } catch (error) {
    console.error(`Error creating document in ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Helper function to get a document from Firestore by ID
 */
export const getFirestoreDoc = async (
  table: string,
  id: string
) => {
  try {
    const docRef = doc(db, table, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error(`Error getting document from ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Helper function to delete a document from Firestore
 */
export const deleteFirestoreDoc = async (
  table: string,
  id: string
) => {
  try {
    const docRef = doc(db, table, id);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    console.error(`Error deleting document from ${table}:`, error);
    return { error };
  }
};
