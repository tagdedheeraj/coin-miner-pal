
import { User, DepositRequest } from '@/types/auth';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';

export const depositServiceFunctions = (user: User | null) => {

  const requestPlanPurchase = async (depositData: Omit<DepositRequest, 'id' | 'status' | 'reviewedAt'>): Promise<void> => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Create the deposit request
      const depositRequest: Omit<DepositRequest, 'id'> = {
        ...depositData,
        status: 'pending',
      };
      
      // Save to Firestore
      await addDoc(collection(db, 'depositRequests'), depositRequest);
      
      // Add notification to user
      const notification = {
        id: Date.now().toString(),
        message: `Your deposit for ${depositData.planName} of $${depositData.amount} is being reviewed.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update user document with notification
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [...userNotifications, notification]
        });
      }
      
      toast.success('Deposit request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit deposit request');
      throw error;
    }
  };
  
  const getDepositRequests = async (): Promise<DepositRequest[]> => {
    if (!user?.isAdmin) {
      return [];
    }
    
    try {
      const depositRequestsRef = collection(db, 'depositRequests');
      const querySnapshot = await getDocs(depositRequestsRef);
      
      const depositRequests: DepositRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        depositRequests.push({
          id: doc.id,
          ...doc.data()
        } as DepositRequest);
      });
      
      return depositRequests;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch deposit requests');
      return [];
    }
  };
  
  const approveDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const requestRef = doc(db, 'depositRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Deposit request not found');
        return;
      }
      
      const request = requestDoc.data() as DepositRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString()
      });
      
      // Find the user and send notification
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your deposit for ${request.planName} has been approved! Your plan is now active.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve deposit request');
    }
  };
  
  const rejectDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can reject deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const requestRef = doc(db, 'depositRequests', requestId);
      const requestDoc = await getDoc(requestRef);
      
      if (!requestDoc.exists()) {
        toast.error('Deposit request not found');
        return;
      }
      
      const request = requestDoc.data() as DepositRequest;
      
      if (request.status !== 'pending') {
        toast.error('This request has already been processed');
        return;
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString()
      });
      
      // Find the user and send notification
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', request.userEmail));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data() as User;
        
        const userRef = doc(db, 'users', userId);
        const userNotifications = userData.notifications || [];
        
        await updateDoc(userRef, {
          notifications: [
            ...userNotifications,
            {
              id: Date.now().toString(),
              message: `Your deposit for ${request.planName} has been rejected. Please contact support for more information.`,
              read: false,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      toast.success('Deposit request rejected successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject deposit request');
    }
  };
  
  return {
    requestPlanPurchase,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  };
};
