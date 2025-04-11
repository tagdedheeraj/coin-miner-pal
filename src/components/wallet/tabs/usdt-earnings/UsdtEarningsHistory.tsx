
import React from 'react';
import { BarChart4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatToIndianTime } from '@/utils/formatters';

interface EarningsEntry {
  id: string;
  date: string;
  planName: string;
  amount: number;
}

interface UsdtEarningsHistoryProps {
  earningsData: EarningsEntry[];
}

const UsdtEarningsHistory: React.FC<UsdtEarningsHistoryProps> = ({ earningsData }) => {
  const navigate = useNavigate();
  
  if (earningsData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center">
        <BarChart4 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h4 className="font-medium text-gray-800 mb-2">No Earnings Yet</h4>
        <p className="text-sm text-gray-500">
          Purchase an arbitrage plan to start earning USDT daily.
        </p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/plans')}
        >
          View Arbitrage Plans
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h4 className="font-medium text-gray-800 mb-4">Earnings History</h4>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date (IST)</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earningsData.map((earning) => (
              <TableRow key={earning.id}>
                <TableCell className="font-medium">{formatToIndianTime(earning.date)}</TableCell>
                <TableCell>{earning.planName}</TableCell>
                <TableCell className="text-right text-green-600">${earning.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsdtEarningsHistory;
