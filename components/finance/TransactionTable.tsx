// components/finance/TransactionsTable.tsx
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: string;
  crop: string;
  amount: number;
  description: string;
  category: string;
  status: string;
  paymentMethod: string;
  notes: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionsTable = ({ transactions, setTransactions }: TransactionsTableProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((t) => {
    return (
      (typeFilter === 'all' || t.type.toLowerCase() === typeFilter) &&
      (cropFilter === 'all' || t.crop.toLowerCase() === cropFilter.toLowerCase()) &&
      (categoryFilter === 'all' || t.category.toLowerCase() === categoryFilter.toLowerCase()) &&
      (statusFilter === 'all' || t.status.toLowerCase() === statusFilter) &&
      (searchQuery === '' || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const formatAmount = (amount: number) => amount.toLocaleString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <Filter className="h-4 w-4 mr-1" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="maize">Maize</SelectItem>
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="soybeans">Soybeans</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="inputs">Inputs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Type</th>
                <th className="p-2">Crop</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Category</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">
                    <Badge variant={t.type === 'Income' ? 'default' : 'destructive'}>
                      {t.type}
                    </Badge>
                  </td>
                  <td className="p-2">{t.crop}</td>
                  <td className={`p-2 ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                    R{formatAmount(t.amount)}
                  </td>
                  <td className="p-2">{t.category}</td>
                  <td className="p-2">
                    <Badge variant={t.status === 'completed' ? 'secondary' : 'outline'}>
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;