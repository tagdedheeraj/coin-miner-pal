
import { User } from '@/types/auth';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const approveDepositFunctions = (user: User | null) => {
  const db = getFirestore();
  
  const approveDepositRequest = async (requestId: string): Promise<void> => {
    if (!user?.isAdmin) {
      toast.error('Only admins can approve deposit requests');
      return;
    }
    
    try {
      // Get the deposit request
      const requestRef = doc(db, 'deposit_requests', requestId);
      const requestSnapshot = await getDoc(requestRef);
      
      if (!requestSnapshot.exists()) {
        throw new Error('Deposit request not found');
      }
      
      const requestData = requestSnapshot.data();
      
      if (requestData.status !== 'pending') {
        throw new Error('This request has already been processed');
      }
      
      // Update request status
      await updateDoc(requestRef, {
        status: 'approved',
        reviewed_at: new Date().toISOString()
      });
      
      // Find the user
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('email', '==', requestData.user_email));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        throw new Error('User not found');
      }
      
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();
      const userNotifications = userData.notifications || [];
      const userActivePlans = userData.active_plans || [];
      
      // Get the plan details
      const planRef = doc(db, 'arbitrage_plans', requestData.plan_id);
      const planSnapshot = await getDoc(planRef);
      
      if (!planSnapshot.exists()) {
        throw new Error('Plan not found');
      }
      
      const planData = planSnapshot.data();
      
      // Calculate plan expiry date based on the current date and plan duration
      const startDate = new Date();
      const expiryDate = new Date();
      // Use the plan's duration property to set the correct expiry date
      expiryDate.setDate(expiryDate.getDate() + (planData.duration || 30));
      
      // Create user plan record
      const userPlan = {
        id: uuidv4(),
        planId: requestData.plan_id,
        planName: requestData.plan_name,
        amount: requestData.amount,
        dailyEarnings: planData.daily_earnings || 0,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        depositId: requestId,
        miningSpeed: planData.mining_speed || '1x'
      };
      
      // Update user with notification and active plan
      await updateDoc(doc(db, 'users', userDoc.id), {
        notifications: [
          ...userNotifications,
          {
            id: uuidv4(),
            message: `Your deposit for ${requestData.plan_name} has been approved! Your plan is now active.`,
            read: false,
            createdAt: new Date().toISOString()
          }
        ],
        active_plans: [
          ...userActivePlans,
          userPlan
        ]
      });
      
      // Create plan history record
      const planHistoryRef = collection(db, 'plan_history');
      await addDoc(planHistoryRef, {
        userId: userDoc.id,
        userEmail: requestData.user_email,
        userName: requestData.user_name,
        planId: requestData.plan_id,
        planName: requestData.plan_name,
        amount: requestData.amount,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        dailyEarnings: planData.daily_earnings || 0,
        depositId: requestId,
        createdAt: new Date().toISOString()
      });
      
      toast.success('Deposit request approved successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to approve deposit request');
    }
  };

  return { approveDepositRequest };
};
