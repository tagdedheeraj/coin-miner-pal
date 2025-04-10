
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
import { 
  Trash2, User, Search, LayoutGrid, DollarSign, 
  Coins, BellRing, CheckCircle, XCircle, 
  FileText, CreditCard, Settings, Users, BarChart
} from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import { toast } from 'sonner';

const AdminDashboard: React.FC = () => {
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
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingDeposits: 0
  });
  
  // Fetch data on component mount
  useEffect(() => {
    if (user?.isAdmin) {
      fetchWithdrawalRequests();
      fetchDepositRequests();
      calculateDashboardStats();
    }
  }, [user]);
  
  // Redirect non-admin users
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/sign-in" replace />;
  }
  
  // Fetch withdrawal requests
  const fetchWithdrawalRequests = async () => {
    try {
      const requests = await getWithdrawalRequests();
      setWithdrawalRequests(requests);
      setLoadingWithdrawals(false);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
      setLoadingWithdrawals(false);
    }
  };
  
  // Fetch deposit requests
  const fetchDepositRequests = async () => {
    try {
      const requests = await getDepositRequests();
      setDepositRequests(requests);
      setLoadingDeposits(false);
    } catch (error) {
      console.error('Error fetching deposit requests:', error);
      setLoadingDeposits(false);
    }
  };
  
  // Calculate dashboard statistics
  const calculateDashboardStats = () => {
    setDashboardStats({
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.coins > 0).length,
      totalRevenue: depositRequests
        .filter(req => req.status === 'approved')
        .reduce((total, req) => total + req.amount, 0),
      pendingWithdrawals: withdrawalRequests.filter(req => req.status === 'pending').length,
      pendingDeposits: depositRequests.filter(req => req.status === 'pending').length
    });
  };
  
  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle user deletion
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं?')) {
      deleteUser(userId);
      toast.success('उपयोगकर्ता सफलतापूर्वक हटा दिया गया');
    }
  };

  // Update USDT earnings
  const handleUpdateUsdtEarnings = async () => {
    if (!userEmail || !usdtAmount) {
      toast.error('कृपया ईमेल और USDT राशि दर्ज करें');
      return;
    }

    try {
      await updateUserUsdtEarnings(userEmail, parseFloat(usdtAmount));
      setUserEmail('');
      setUsdtAmount('');
      toast.success('USDT कमाई अपडेट की गई');
    } catch (error) {
      console.error('Failed to update USDT earnings:', error);
      toast.error('USDT कमाई अपडेट करने में विफल');
    }
  };

  // Update user coins
  const handleUpdateCoins = async () => {
    if (!coinEmail || !coinAmount) {
      toast.error('कृपया ईमेल और सिक्के की राशि दर्ज करें');
      return;
    }

    try {
      await updateUserCoins(coinEmail, parseInt(coinAmount, 10));
      setCoinEmail('');
      setCoinAmount('');
      toast.success('सिक्के अपडेट किए गए');
    } catch (error) {
      console.error('Failed to update coins:', error);
      toast.error('सिक्के अपडेट करने में विफल');
    }
  };

  // Send notification to all users
  const handleSendNotification = () => {
    if (!notificationMessage.trim()) {
      toast.error('कृपया सूचना संदेश दर्ज करें');
      return;
    }

    sendNotificationToAllUsers(notificationMessage.trim());
    setNotificationMessage('');
    toast.success('सभी उपयोगकर्ताओं को सूचना भेजी गई');
  };
  
  // Handle approving withdrawal request
  const handleApproveWithdrawal = async (requestId: string) => {
    if (window.confirm('क्या आप वाकई इस निकासी अनुरोध को स्वीकृत करना चाहते हैं?')) {
      try {
        await approveWithdrawalRequest(requestId);
        await fetchWithdrawalRequests();
        toast.success('निकासी अनुरोध स्वीकृत किया गया');
      } catch (error) {
        console.error('Error approving withdrawal:', error);
        toast.error('निकासी स्वीकृत करने में विफल');
      }
    }
  };
  
  // Handle rejecting withdrawal request
  const handleRejectWithdrawal = async (requestId: string) => {
    if (window.confirm('क्या आप वाकई इस निकासी अनुरोध को अस्वीकार करना चाहते हैं?')) {
      try {
        await rejectWithdrawalRequest(requestId);
        await fetchWithdrawalRequests();
        toast.success('निकासी अनुरोध अस्वीकार किया गया');
      } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        toast.error('निकासी अस्वीकार करने में विफल');
      }
    }
  };
  
  // Handle approving deposit request
  const handleApproveDeposit = async (requestId: string) => {
    if (window.confirm('क्या आप वाकई इस जमा अनुरोध को स्वीकृत करना चाहते हैं?')) {
      try {
        await approveDepositRequest(requestId);
        await fetchDepositRequests();
        toast.success('जमा अनुरोध स्वीकृत किया गया');
      } catch (error) {
        console.error('Error approving deposit:', error);
        toast.error('जमा स्वीकृत करने में विफल');
      }
    }
  };
  
  // Handle rejecting deposit request
  const handleRejectDeposit = async (requestId: string) => {
    if (window.confirm('क्या आप वाकई इस जमा अनुरोध को अस्वीकार करना चाहते हैं?')) {
      try {
        await rejectDepositRequest(requestId);
        await fetchDepositRequests();
        toast.success('जमा अनुरोध अस्वीकार किया गया');
      } catch (error) {
        console.error('Error rejecting deposit:', error);
        toast.error('जमा अस्वीकार करने में विफल');
      }
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('hi-IN', {
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
          <h1 className="text-2xl font-bold mb-1">एडमिन पैनल</h1>
          <p className="text-gray-500">अपनी वेबसाइट और ऐप को यहां से प्रबंधित करें</p>
        </div>
        
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">कुल उपयोगकर्ता</p>
                  <h3 className="text-2xl font-bold mt-1">{dashboardStats.totalUsers}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">सक्रिय उपयोगकर्ता</p>
                  <h3 className="text-2xl font-bold mt-1">{dashboardStats.activeUsers}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">कुल राजस्व</p>
                  <h3 className="text-2xl font-bold mt-1">${dashboardStats.totalRevenue.toFixed(2)}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">अनुरोध लंबित</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {dashboardStats.pendingWithdrawals + dashboardStats.pendingDeposits}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Admin Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" /> उपयोगकर्ता
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" /> प्लान
            </TabsTrigger>
            <TabsTrigger value="usdt" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> USDT अपडेट
            </TabsTrigger>
            <TabsTrigger value="coins" className="flex items-center gap-2">
              <Coins className="h-4 w-4" /> सिक्के अपडेट
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" /> सूचनाएँ
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> निकासी अनुरोध
              {withdrawalRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {withdrawalRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> जमा अनुरोध
              {depositRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {depositRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> सेटिंग्स
            </TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>उपयोगकर्ता प्रबंधन</CardTitle>
                <CardDescription>सभी उपयोगकर्ताओं को देखें और प्रबंधित करें</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="उपयोगकर्ताओं की खोज करें..." 
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
                        <TableHead>नाम</TableHead>
                        <TableHead>ईमेल</TableHead>
                        <TableHead>सिक्के</TableHead>
                        <TableHead>USDT कमाई</TableHead>
                        <TableHead>रेफरल कोड</TableHead>
                        <TableHead>कार्रवाई</TableHead>
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
                            कोई उपयोगकर्ता नहीं मिला
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Plans Tab */}
          <TabsContent value="plans">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>प्लान प्रबंधन</CardTitle>
                <CardDescription>सभी प्लान देखें और प्रबंधित करें</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  प्लान प्रबंधन अभी विकास के अधीन है
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* USDT Tab */}
          <TabsContent value="usdt">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>USDT कमाई अपडेट करें</CardTitle>
                <CardDescription>किसी उपयोगकर्ता की USDT कमाई मैन्युअल रूप से अपडेट करें</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">उपयोगकर्ता ईमेल</Label>
                    <Input
                      id="email"
                      placeholder="उपयोगकर्ता ईमेल दर्ज करें"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">USDT राशि</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="USDT राशि दर्ज करें"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleUpdateUsdtEarnings} className="w-full">
                    USDT कमाई अपडेट करें
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coins Tab */}
          <TabsContent value="coins">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>उपयोगकर्ता सिक्के अपडेट करें</CardTitle>
                <CardDescription>किसी उपयोगकर्ता के सिक्के बैलेंस को मैन्युअल रूप से अपडेट करें</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coinEmail">उपयोगकर्ता ईमेल</Label>
                    <Input
                      id="coinEmail"
                      placeholder="उपयोगकर्ता ईमेल दर्ज करें"
                      value={coinEmail}
                      onChange={(e) => setCoinEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coinAmount">सिक्के की राशि</Label>
                    <Input
                      id="coinAmount"
                      type="number"
                      placeholder="सिक्के की राशि दर्ज करें"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleUpdateCoins} className="w-full">
                    सिक्के अपडेट करें
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>सार्वजनिक सूचना भेजें</CardTitle>
                <CardDescription>सभी उपयोगकर्ताओं को एक सूचना भेजें</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notificationMessage">सूचना संदेश</Label>
                    <Textarea
                      id="notificationMessage"
                      placeholder="सूचना संदेश दर्ज करें"
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <Button onClick={handleSendNotification} className="w-full">
                    सभी उपयोगकर्ताओं को सूचना भेजें
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>निकासी अनुरोध</CardTitle>
                <CardDescription>उपयोगकर्ता निकासी अनुरोधों का प्रबंधन करें</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingWithdrawals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">निकासी अनुरोध लोड हो रहे हैं...</p>
                  </div>
                ) : withdrawalRequests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>दिनांक</TableHead>
                          <TableHead>उपयोगकर्ता</TableHead>
                          <TableHead>ईमेल</TableHead>
                          <TableHead>राशि</TableHead>
                          <TableHead>निकासी पता</TableHead>
                          <TableHead>स्थिति</TableHead>
                          <TableHead>कार्रवाई</TableHead>
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
                                  लंबित
                                </span>
                              ) : request.status === 'approved' ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  स्वीकृत
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  अस्वीकृत
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
                    कोई निकासी अनुरोध नहीं मिला
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Deposits Tab */}
          <TabsContent value="deposits">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>जमा अनुरोध</CardTitle>
                <CardDescription>उपयोगकर्ता जमा अनुरोधों को स्वीकृत या अस्वीकृत करें</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDeposits ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">जमा अनुरोध लोड हो रहे हैं...</p>
                  </div>
                ) : depositRequests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>दिनांक</TableHead>
                          <TableHead>उपयोगकर्ता</TableHead>
                          <TableHead>ईमेल</TableHead>
                          <TableHead>प्लान</TableHead>
                          <TableHead>राशि</TableHead>
                          <TableHead>लेनदेन आईडी</TableHead>
                          <TableHead>स्थिति</TableHead>
                          <TableHead>कार्रवाई</TableHead>
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
                                  लंबित
                                </span>
                              ) : request.status === 'approved' ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  स्वीकृत
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                  अस्वीकृत
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
                    कोई जमा अनुरोध नहीं मिला
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>एप्लिकेशन सेटिंग्स</CardTitle>
                <CardDescription>एप्लिकेशन सेटिंग्स प्रबंधित करें</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  सेटिंग्स प्रबंधन अभी विकास के अधीन है
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
