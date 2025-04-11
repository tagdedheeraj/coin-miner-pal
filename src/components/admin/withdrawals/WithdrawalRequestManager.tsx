
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { WithdrawalRequest } from '@/types/auth';

interface WithdrawalRequestManagerProps {
  getWithdrawalRequests: () => Promise<WithdrawalRequest[]>;
  approveWithdrawalRequest: (requestId: string) => Promise<void>;
  rejectWithdrawalRequest: (requestId: string) => Promise<void>;
}

const WithdrawalRequestManager: React.FC<WithdrawalRequestManagerProps> = ({
  getWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
}) => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoadingWithdrawals(true);
      const requests = await getWithdrawalRequests();
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleApproveWithdrawal = async (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this withdrawal request?')) {
      try {
        await approveWithdrawalRequest(requestId);
        const updatedRequests = await getWithdrawalRequests();
        setWithdrawalRequests(updatedRequests);
      } catch (error) {
        console.error('Error approving withdrawal:', error);
      }
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this withdrawal request?')) {
      try {
        await rejectWithdrawalRequest(requestId);
        const updatedRequests = await getWithdrawalRequests();
        setWithdrawalRequests(updatedRequests);
      } catch (error) {
        console.error('Error rejecting withdrawal:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>Manage user withdrawal requests</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingWithdrawals ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading withdrawal requests...</p>
          </div>
        ) : withdrawalRequests.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Withdrawal Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{request.userEmail}</TableCell>
                    <TableCell>${request.amount.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {request.address}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending
                        </span>
                      ) : request.status === 'approved' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Rejected
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleApproveWithdrawal(request.id)}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRejectWithdrawal(request.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No withdrawal requests found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalRequestManager;
