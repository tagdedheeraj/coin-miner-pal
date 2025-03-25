
import React, { useState } from 'react';
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
import { Trash2, User, Search, LayoutGrid, DollarSign, Coins, BellRing, CheckCircle, XCircle, FileText } from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import ArbitragePlanManagement from '@/components/admin/ArbitragePlanManagement';
import { WithdrawalRequest } from '@/types/auth';

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
    rejectWithdrawalRequest
  } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [coinEmail, setCoinEmail] = useState('');
  const [coinAmount, setCoinAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // If not authenticated or not admin, redirect to sign-in
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Get all withdrawal requests
  const withdrawalRequests = getWithdrawalRequests();
  const pendingRequests = withdrawalRequests.filter(req => req.status === 'pending');
  
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleUpdateUsdtEarnings = async () => {
    if (!userEmail || !usdtAmount) {
      return;
    }

    try {
      await updateUserUsdtEarnings(userEmail, parseFloat(usdtAmount));
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
  
  const handleApproveWithdrawal = (requestId: string) => {
    if (window.confirm('Are you sure you want to approve this withdrawal request?')) {
      approveWithdrawalRequest(requestId);
    }
  };
  
  const handleRejectWithdrawal = (requestId: string) => {
    if (window.confirm('Are you sure you want to reject this withdrawal request?')) {
      rejectWithdrawalRequest(requestId);
    }
  };
  
  // Format date to local string
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
          <TabsList className="mb-6">
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
              <FileText className="h-4 w-4" /> Withdrawal Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingRequests.length}
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
                </div>
                
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
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
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
                {withdrawalRequests.length > 0 ? (
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
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
