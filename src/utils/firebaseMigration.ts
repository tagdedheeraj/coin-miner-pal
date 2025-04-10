
/**
 * Firebase migration helpers - these functions help with transitioning from Supabase to Firebase
 * by providing a consistent interface for common operations.
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  Firestore 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';

/**
 * Get a single document by a field/value pair
 */
export const getDocumentByField = async <T>(
  table: string,
  field: string,
  value: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const q = query(collection(db, table), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: null, error: null };
    }
    
    const doc = querySnapshot.docs[0];
    return { 
      data: { id: doc.id, ...doc.data() } as unknown as T, 
      error: null 
    };
  } catch (error) {
    console.error(`Error getting document from ${table} where ${field} = ${value}:`, error);
    return { data: null, error };
  }
};

/**
 * Get all documents from a collection with optional filtering
 */
export const getDocuments = async <T>(
  table: string,
  filterField?: string,
  filterValue?: any
): Promise<{ data: T[] | null; error: any }> => {
  try {
    let querySnapshot;
    
    if (filterField && filterValue !== undefined) {
      const q = query(collection(db, table), where(filterField, '==', filterValue));
      querySnapshot = await getDocs(q);
    } else {
      querySnapshot = await getDocs(collection(db, table));
    }
    
    const data = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    return { data: data as unknown as T[], error: null };
  } catch (error) {
    console.error(`Error getting documents from ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Add a new document to a collection
 */
export const addDocument = async <T>(
  table: string,
  data: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const docRef = await addDoc(collection(db, table), data);
    return { 
      data: { id: docRef.id, ...data } as unknown as T, 
      error: null 
    };
  } catch (error) {
    console.error(`Error adding document to ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Update a document in a collection
 */
export const updateDocument = async (
  table: string,
  id: string,
  data: any
): Promise<{ error: any }> => {
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
 * Delete a document from a collection
 */
export const deleteDocument = async (
  table: string,
  id: string
): Promise<{ error: any }> => {
  try {
    const docRef = doc(db, table, id);
    await deleteDoc(docRef);
    return { error: null };
  } catch (error) {
    console.error(`Error deleting document from ${table}:`, error);
    return { error };
  }
};

/**
 * Get a document by ID
 */
export const getDocumentById = async <T>(
  table: string,
  id: string
): Promise<{ data: T | null; error: any }> => {
  try {
    const docRef = doc(db, table, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        data: { id: docSnap.id, ...docSnap.data() } as unknown as T, 
        error: null 
      };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error(`Error getting document from ${table} with ID ${id}:`, error);
    return { data: null, error };
  }
};
