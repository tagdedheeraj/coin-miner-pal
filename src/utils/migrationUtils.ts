
import { collection, addDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';

export const createFirestoreDoc = async (collectionName: string, data: DocumentData) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};
