
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { DepositRequest } from '@/types/auth';

interface DepositRequestManagerProps {
  getDepositRequests: () => Promise<DepositRequest[]>;
  approveDepositRequest: (requestId: string) => Promise<void>;
  rejectDepositRequest: (requestId: string) => Promise<void>;
}

const DepositRequestManager: React.FC<DepositRequestManagerProps> = ({
  getDepositRequests,
  approveDepositRequest,
  rejectDepositRequest
}) => {
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  useEffect(() => {
    fetchDepositRequests();
  }, []);

  const fetchDepositRequests = async () => {
    try {
      setLoadingDeposits(true);
      const requests = await getDepositRequests();
      setDepositRequests(requests);
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
    } finally {
      setLoadingDeposits(false);
    }
  };

  const handleApproveDeposit = async (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this deposit request? This will activate the plan for the user.')) {
      try {
        await approveDepositRequest(requestId);
        const updatedRequests = await getDepositRequests();
        setDepositRequests(updatedRequests);
      } catch (error) {
        console.error('Error approving deposit:', error);
      }
    }
  };

  const handleRejectDeposit = async (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this deposit request?')) {
      try {
        await rejectDepositRequest(requestId);
        const updatedRequests = await getDepositRequests();
        setDepositRequests(updatedRequests);
      } catch (error) {
        console.error('Error rejecting deposit:', error);
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
        <CardTitle>Deposit Requests</CardTitle>
        <CardDescription>Approve or reject user plan purchase deposits</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingDeposits ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading deposit requests...</p>
          </div>
        ) : depositRequests.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>{formatDate(request.timestamp)}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{request.userEmail}</TableCell>
                    <TableCell>{request.planName}</TableCell>
                    <TableCell>${request.amount.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {request.transactionId}
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
                            onClick={() => handleApproveDeposit(request.id)}
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRejectDeposit(request.id)}
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
            No deposit requests found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepositRequestManager;
