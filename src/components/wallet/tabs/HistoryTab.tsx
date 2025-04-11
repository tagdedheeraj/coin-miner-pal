
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { formatToIndianTime } from '@/utils/formatters';
import { WithdrawalRequest } from '@/types/auth';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import app from '@/integrations/firebase/client';

const HistoryTab: React.FC = () => {
  const { user } = useAuth();
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      if (!user) return;
      
      try {
        // Properly access Firebase Firestore
        const db = getFirestore(app);
        
        const withdrawalsRef = collection(db, 'withdrawal_requests');
        const userWithdrawals = await getDocs(
          query(
            withdrawalsRef,
            where('user_id', '==', user.id),
            orderBy('created_at', 'desc')
          )
        );
          
        const history: WithdrawalRequest[] = [];
        userWithdrawals.forEach(doc => {
          const data = doc.data();
          history.push({
            id: doc.id,
            userId: data.user_id,
            userEmail: data.user_email,
            userName: data.user_name,
            amount: data.amount,
            address: data.address,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          });
        });
        
        setWithdrawalHistory(history);
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWithdrawalHistory();
  }, [user]);
  
  if (!user) return null;
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  return (
    <div className="glass-card rounded-2xl p-6 animate-scale-up">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-3">
          <History className="text-purple-500" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Transaction History</h3>
          <p className="text-sm text-gray-500">All your USDT transactions</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : withdrawalHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date (IST)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawalHistory.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{formatToIndianTime(tx.createdAt)}</TableCell>
                  <TableCell>Withdrawal</TableCell>
                  <TableCell className="text-right text-blue-600">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h4 className="font-medium text-gray-800 mb-2">No Transaction History</h4>
          <p className="text-sm text-gray-500">
            Your USDT transactions will appear here once you start earning or making withdrawals.
          </p>
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 p-4 rounded-xl">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Note:</span> Withdrawals are processed within 24 hours. The minimum withdrawal amount is $50 USDT.
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;
