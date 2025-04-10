
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
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';

/**
 * Get a document by a field/value query with Supabase-compatible return structure
 */
export const getDocumentsByField = async <T>(
  table: string,
  field: string,
  value: any,
  options?: {
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    limit?: number;
  }
): Promise<{ data: T[] | null; error: any }> => {
  try {
    let queryConstraints = [where(field, '==', value)];
    
    if (options?.orderByField) {
      queryConstraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    if (options?.limit) {
      queryConstraints.push(limit(options.limit));
    }
    
    const q = query(collection(db, table), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: [], error: null };
    }
    
    const docs = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...(doc.data() as Record<string, any>) 
    }));
    
    return { data: docs as unknown as T[], error: null };
  } catch (error) {
    console.error(`Error querying ${table} where ${field} = ${value}:`, error);
    return { data: null, error };
  }
};

/**
 * Get a single document by a field/value pair
 */
export const getDocumentByField = async <T>(
  table: string,
  field: string,
  value: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await getDocumentsByField<T>(table, field, value, { limit: 1 });
    
    if (!result.data || result.data.length === 0) {
      return { data: null, error: null };
    }
    
    return { data: result.data[0], error: null };
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
  options?: {
    filterField?: string;
    filterValue?: any;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
  }
): Promise<{ data: T[] | null; error: any }> => {
  try {
    let queryConstraints: any[] = [];
    
    if (options?.filterField && options?.filterValue !== undefined) {
      queryConstraints.push(where(options.filterField, '==', options.filterValue));
    }
    
    if (options?.orderByField) {
      queryConstraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    const q = queryConstraints.length > 0 
      ? query(collection(db, table), ...queryConstraints)
      : collection(db, table);
      
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...(doc.data() as Record<string, any>)
    }));
    
    return { data: data as unknown as T[], error: null };
  } catch (error) {
    console.error(`Error getting documents from ${table}:`, error);
    return { data: null, error };
  }
};

/**
 * Get a document by ID with Supabase-compatible return structure
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
        data: { 
          id: docSnap.id, 
          ...(docSnap.data() as Record<string, any>) 
        } as unknown as T, 
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

/**
 * Add a new document to a collection
 */
export const addDocument = async <T>(
  table: string,
  data: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const docRef = await addDoc(collection(db, table), {
      ...data,
      created_at: new Date().toISOString()
    });
    
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
 * Create document with specific ID
 */
export const setDocument = async <T>(
  table: string,
  id: string,
  data: any
): Promise<{ data: T | null; error: any }> => {
  try {
    const docRef = doc(db, table, id);
    await setDoc(docRef, {
      ...data,
      created_at: new Date().toISOString()
    });
    
    return { 
      data: { id, ...data } as unknown as T, 
      error: null 
    };
  } catch (error) {
    console.error(`Error setting document in ${table} with ID ${id}:`, error);
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
    await updateDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
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
