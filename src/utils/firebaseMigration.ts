
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const getDocumentByField = async (
  collectionName: string, 
  fieldName: string, 
  fieldValue: any
) => {
  try {
    const q = query(collection(db, collectionName), where(fieldName, '==', fieldValue));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

export const updateDocument = async (
  collectionName: string,
  documentId: string,
  data: any
) => {
  try {
    await updateDoc(doc(db, collectionName, documentId), data);
    return true;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};
