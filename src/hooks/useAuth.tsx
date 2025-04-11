
import { useContext, useMemo, useEffect, useState } from 'react';
import { AuthContext } from '@/contexts/auth/AuthProvider';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { mapDbToUser } from '@/utils/firebaseUtils';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Set up real-time listener for current user
  useEffect(() => {
    if (context.user) {
      const db = getFirestore();
      const userRef = doc(db, 'users', context.user.id);
      
      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const updatedUser = mapDbToUser({
            id: context.user.id,
            ...userData
          });
          
          // Update local storage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update context
          context.updateUser(updatedUser);
        }
      }, (error) => {
        console.error('Error in user real-time updates:', error);
      });
      
      return () => unsubscribe();
    }
  }, [context.user?.id]);
  
  // Memoize the context so it doesn't cause unnecessary re-renders
  return useMemo(() => context, [context]);
};
