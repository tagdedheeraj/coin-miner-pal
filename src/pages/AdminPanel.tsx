
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, User, Search, LayoutGrid, DollarSign, Coins, BellRing, CheckCircle, XCircle, FileText, CreditCard } from 'lucide-react';
import ArbitragePlanManagement from '@/components/admin/ArbitragePlanManagement';
import { WithdrawalRequest, DepositRequest, User as UserType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { mapDbToUser } from '@/utils/supabaseUtils';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    deleteUser, 
    updateUserUsdtEarnings, 
    updateUserCoins, 
    sendNotificationToAllUsers,
    getWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    getDepositRequests,
    approveDepositRequest,
    rejectDepositRequest
  } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [coinEmail, setCoinEmail] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      if (user?.isAdmin) {
        try {
          const requests = await getWithdrawalRequests();
          setWithdrawalRequests(requests);
        } catch (error) {
          console.error('Error fetching withdrawal requests:', error);
        } finally {
          setLoadingWithdrawals(false);
        }
      }
    };
    
    const fetchDepositRequests = async () => {
      if (user?.isAdmin) {
        try {
          const requests = await getDepositRequests();
          setDepositRequests(requests);
        } catch (error) {
          console.error('Error fetching deposit requests:', error);
        } finally {
          setLoadingDeposits(false);
        }
      }
    };
    
    const fetchAllUsers = async () => {
      if (user?.isAdmin) {
        try {
          setLoadingUsers(true);
          const { data, error } = await supabase
            .from('users')
            .select('*');
          
          if (error) {
            throw error;
          }
          
          const mappedUsers = data?.map(dbUser => mapDbToUser(dbUser)) || [];
          setAllUsers(mappedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to fetch users');
        } finally {
          setLoadingUsers(false);
        }
      }
    };
    
    fetchWithdrawalRequests();
    fetchDepositRequests();
    fetchAllUsers();
  }, [user, getWithdrawalRequests, getDepositRequests]);
  
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  const pendingWithdrawals = withdrawalRequests.filter(req => req.status === 'pending');
  const pendingDeposits = depositRequests.filter(req => req.status === 'pending');
  
  const filteredUsers = allUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      // Remove user from local state
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleUpdateUsdtEarnings = async () => {
    if (!userEmail || !usdtAmount) {
      return;
    }

    try {
      await updateUserUsdtEarnings(userEmail, parseFloat(usdtAmount));
      // Update user in local state
      setAllUsers(prev => prev.map(u => {
        if (u.email === userEmail) {
          return { ...u, usdtEarnings: parseFloat(usdtAmount) };
        }
        return u;
      }));
      setUserEmail('');
      setUsdtAmount('');
    } catch (error) {
      console.error('Failed to update USDT earnings:', error);
    }
  };

  const handleUpdateCoins = async () => {
    if (!coinEmail || !coinAmount) {
      return;
    }

    try {
      await updateUserCoins(coinEmail, parseInt(coinAmount, 10));
      // Update user in local state
      setAllUsers(prev => prev.map(u => {
        if (u.email === coinEmail) {
          return { ...u, coins: parseInt(coinAmount, 10) };
        }
        return u;
      }));
      setCoinEmail('');
      setCoinAmount('');
    } catch (error) {
      console.error('Failed to update coins:', error);
    }
  };

  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      return;
    }

    sendNotificationToAllUsers(notificationMessage.trim());
    setNotificationMessage('');
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
    <div className="min-h-screen bg-gray-50 pb-20 pt-16">
      <Header />
      
      <main className="container px-4 py-6 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
          <p className="text-gray-500">Manage users and system settings</p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> Arbitrage Plans
            </TabsTrigger>
            <TabsTrigger value="usdt" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> USDT Earnings
            </TabsTrigger>
            <TabsTrigger value="coins" className="flex items-center gap-2">
              <Coins className="h-4 w-4" /> Coins
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Withdrawals
              {pendingWithdrawals.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingWithdrawals.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Deposits
              {pendingDeposits.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingDeposits.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Refresh users list
                      const fetchAllUsers = async () => {
                        try {
                          setLoadingUsers(true);
                          const { data, error } = await supabase
                            .from('users')
                            .select('*');
                          
                          if (error) {
                            throw error;
                          }
                          
                          const mappedUsers = data?.map(dbUser => mapDbToUser(dbUser)) || [];
                          setAllUsers(mappedUsers);
                          toast.success('User list refreshed');
                        } catch (error) {
                          console.error('Error fetching users:', error);
                          toast.error('Failed to refresh users');
                        } finally {
                          setLoadingUsers(false);
                        }
                      };
                      fetchAllUsers();
                    }}
                  >
                    Refresh
                  </Button>
                </div>
                
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading users...</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Coins</TableHead>
                          <TableHead>USDT Earnings</TableHead>
                          <TableHead>Referral Code</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(u => (
                            <TableRow key={u.id}>
                              <TableCell className="font-mono text-xs">{u.id}</TableCell>
                              <TableCell className="font-medium">{u.name || 'N/A'}</TableCell>
                              <TableCell>{u.email || 'N/A'}</TableCell>
                              <TableCell>{u.coins}</TableCell>
                              <TableCell>{u.usdtEarnings || 0}</TableCell>
                              <TableCell className="font-mono text-xs">{u.referralCode}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="plans">
            <ArbitragePlanManagement />
          </TabsContent>
          
          <TabsContent value="usdt">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Update USDT Earnings</CardTitle>
                <CardDescription>Manually update a user's USDT earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email</Label>
                    <Input
                      id="email"
                      placeholder="Enter user email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">USDT Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter USDT amount"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleUpdateUsdtEarnings} className="w-full">
                    Update USDT Earnings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coins">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Update User Coins</CardTitle>
                <CardDescription>Manually update a user's coin balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coinEmail">User Email</Label>
                    <Input
                      id="coinEmail"
                      placeholder="Enter user email"
                      value={coinEmail}
                      onChange={(e) => setCoinEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coinAmount">Coin Amount</Label>
                    <Input
                      id="coinAmount"
                      type="number"
                      placeholder="Enter coin amount"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleUpdateCoins} className="w-full">
                    Update Coins
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Send Global Notification</CardTitle>
                <CardDescription>Send a notification to all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notificationMessage">Notification Message</Label>
                    <Textarea
                      id="notificationMessage"
                      placeholder="Enter notification message"
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button onClick={handleSendNotification} className="w-full">
                    Send Notification to All Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="withdrawals">
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
          </TabsContent>
          
          <TabsContent value="deposits">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
