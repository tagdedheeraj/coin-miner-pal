
import React from 'react';
import { History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { formatToIndianTime } from '@/utils/formatters';

const HistoryTab: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Placeholder for transaction history data - would be replaced with real data
  const mockUsdtTransactions = [];
  
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
      
      {mockUsdtTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date (IST)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsdtTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{formatToIndianTime(tx.date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'Earning' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.type}
                    </span>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={`text-right ${
                    tx.amount > 0 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
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
