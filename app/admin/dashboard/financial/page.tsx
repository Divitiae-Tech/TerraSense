// app/finance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Components
import FinancialSummary from '@/components/finance/FinanceSummary';
import ProfitLossChart from '@/components/finance/ProfitLossChart';
import ExpenseBreakdownChart from '@/components/finance/ExpenseBreakdownChart';
import TransactionsTable from '@/components/finance/TransactionTable';
import ManualTransactionForm from '@/components/finance/ManualTransactionForm';
import CustomReportWidget from '@/components/finance/CustomReportWidget';
import ForecastChart from '@/components/finance/ForecastChart';
import AIInsightsPanel from '@/components/finance/AllInsightsPanel';

export default function FinancialPage() {
  // 📌 In-Memory Transaction Store (Replaces DB for now)
  const [transactions, setTransactions] = useState<any[]>([
    // Seed with initial mock data
    {
      id: 'txn-001',
      date: '2025-08-12',
      type: 'Income',
      crop: 'Maize',
      amount: 5000,
      description: 'Sold harvest to local market',
      category: 'Sales',
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      notes: 'Bulk sale to ABC Market',
    },
    {
      id: 'txn-002',
      date: '2025-08-11',
      type: 'Expense',
      crop: 'Wheat',
      amount: 2000,
      description: 'Premium fertilizer purchase',
      category: 'Inputs',
      status: 'completed',
      paymentMethod: 'Cash',
      notes: 'Organic NPK blend',
    },
  ]);

  const [dateRange, setDateRange] = useState<string>('last30');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // ✅ Add new transaction to in-memory list
  const handleAddTransaction = (newTransaction: any) => {
    const transactionWithId = {
      ...newTransaction,
      id: `txn-${Date.now()}`, // Simple unique ID for demo
    };
    setTransactions((prev) => [transactionWithId, ...prev]); // Add to top
  };

  // ✅ Optional: Simulate loading saved state from localStorage (session persistence)
  useEffect(() => {
    const saved = localStorage.getItem('demo_transactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('demo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Financial Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track income, expenses, and AI insights (Demo Mode - Data in Memory)</p>
        </div>
        <ManualTransactionForm onAddTransaction={handleAddTransaction} />
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-1 bg-white shadow-sm rounded-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <AIInsightsPanel />
          <FinancialSummary dateRange={dateRange} transactions={transactions} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ProfitLossChart dateRange={dateRange} transactions={transactions} />
            <ExpenseBreakdownChart dateRange={dateRange} transactions={transactions} />
          </div>
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit-loss" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Overview</CardTitle>
            </CardHeader>
            <ProfitLossChart dateRange={dateRange} transactions={transactions} />
          </Card>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <ExpenseBreakdownChart dateRange={dateRange} transactions={transactions} />
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-6">
          <TransactionsTable transactions={transactions} setTransactions={setTransactions} />
        </TabsContent>

        {/* Forecasts */}
        <TabsContent value="forecasts" className="space-y-6 mt-6">
          <ForecastChart dateRange={dateRange} />
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports" className="mt-6">
          <CustomReportWidget onReportGenerated={(report) => console.log('Report generated:', report)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}