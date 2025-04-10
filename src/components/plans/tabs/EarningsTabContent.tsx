
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface EarningsTabContentProps {
  getIndianTime: () => string;
}

const EarningsTabContent: React.FC<EarningsTabContentProps> = ({ getIndianTime }) => {
  // Mock arbitrage earnings data
  const earningsData = [
    { date: "2023-10-01", amount: 0.96, status: "Paid" },
    { date: "2023-10-02", amount: 0.96, status: "Paid" },
    { date: "2023-10-03", amount: 0.96, status: "Paid" },
    { date: "2023-10-04", amount: 0.96, status: "Processing" },
    { date: "2023-10-05", amount: 0.96, status: "Pending" },
  ];

  return (
    <div className="glass-card rounded-2xl p-6 animate-scale-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Arbitrage Plan Earnings</h3>
        <span className="text-sm text-gray-500">Next payout: {getIndianTime()}</span>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earningsData.map((earning, i) => (
            <TableRow key={i}>
              <TableCell>{earning.date}</TableCell>
              <TableCell>${earning.amount.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  earning.status === 'Paid' 
                    ? 'bg-green-100 text-green-800' 
                    : earning.status === 'Processing' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {earning.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Earnings:</span>
          <span className="font-bold text-brand-green">${earningsData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default EarningsTabContent;
