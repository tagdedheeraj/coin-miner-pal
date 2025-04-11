
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User, DollarSign, BarChart } from 'lucide-react';

interface DashboardStatsProps {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  pendingRequests: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalUsers,
  activeUsers,
  totalRevenue,
  pendingRequests
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">कुल उपयोगकर्ता</p>
              <h3 className="text-2xl font-bold mt-1">{totalUsers}</h3>
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
              <h3 className="text-2xl font-bold mt-1">{activeUsers}</h3>
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
              <h3 className="text-2xl font-bold mt-1">${totalRevenue.toFixed(2)}</h3>
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
              <h3 className="text-2xl font-bold mt-1">{pendingRequests}</h3>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <BarChart className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
