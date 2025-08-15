// components/finance/FinancialSummary.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { SecureDataHandler } from "@/lib/secureDataHandler";

interface FinancialSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  previousIncome: number;
  previousExpenses: number;
  previousProfit: number;
  cashFlow: number;
  debtToEquity: number;
  returnOnAssets: number;
  currentRatio: number;
  operatingExpenses: number;
  ebitda: number;
  workingCapital: number;
}

interface FinancialSummaryProps {
  dateRange: string;
  transactions?: any[];
}

const FinancialSummary = ({ dateRange, transactions }: FinancialSummaryProps) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock data - In real app, this would come from an API call
  const mockSummary: FinancialSummaryData = {
    totalIncome: 125000,
    totalExpenses: 95000,
    netProfit: 30000,
    profitMargin: 24,
    previousIncome: 118000,
    previousExpenses: 88000,
    previousProfit: 30000,
    cashFlow: 45000,
    debtToEquity: 0.45,
    returnOnAssets: 12.5,
    currentRatio: 2.3,
    operatingExpenses: 65000,
    ebitda: 35000,
    workingCapital: 20000
  };

  const incomeChange = ((mockSummary.totalIncome - mockSummary.previousIncome) / mockSummary.previousIncome * 100).toFixed(1);
  const expenseChange = ((mockSummary.totalExpenses - mockSummary.previousExpenses) / mockSummary.previousExpenses * 100).toFixed(1);
  const profitChange = ((mockSummary.netProfit - mockSummary.previousProfit) / mockSummary.previousProfit * 100).toFixed(1);

  const formatNumber = (num: number) => {
    return isClient ? num.toLocaleString() : num.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {SecureDataHandler.maskFinancialData(mockSummary.totalIncome)}
          </div>
          <div className="flex items-center mt-2">
            {parseFloat(incomeChange) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs md:text-sm ${parseFloat(incomeChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {incomeChange}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-red-600">
            {SecureDataHandler.maskFinancialData(mockSummary.totalExpenses)}
          </div>
          <div className="flex items-center mt-2">
            {parseFloat(expenseChange) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            )}
            <span className={`text-xs md:text-sm ${parseFloat(expenseChange) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {expenseChange}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {SecureDataHandler.maskFinancialData(mockSummary.netProfit)}
          </div>
          <div className="flex items-center mt-2">
            {parseFloat(profitChange) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs md:text-sm ${parseFloat(profitChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {profitChange}% vs previous period
            </span>
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Profit Margin</CardTitle>
            <Badge variant={mockSummary.profitMargin > 20 ? "default" : "destructive"}>
              {mockSummary.profitMargin}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">
            {mockSummary.profitMargin}%
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            {mockSummary.profitMargin > 20 ? "Healthy margin" : "Needs improvement"}
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {SecureDataHandler.maskFinancialData(mockSummary.cashFlow)}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            Operating cash flow
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Debt-to-Equity</CardTitle>
            <Badge variant={mockSummary.debtToEquity < 0.5 ? "default" : "destructive"}>
              {mockSummary.debtToEquity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">
            {mockSummary.debtToEquity}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            {mockSummary.debtToEquity < 0.5 ? "Healthy leverage" : "High leverage risk"}
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Return on Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {mockSummary.returnOnAssets}%
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            Asset efficiency
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Current Ratio</CardTitle>
            <Badge variant={mockSummary.currentRatio > 1.5 ? "default" : "destructive"}>
              {mockSummary.currentRatio}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">
            {mockSummary.currentRatio}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            {mockSummary.currentRatio > 1.5 ? "Good liquidity" : "Liquidity concerns"}
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Operating Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-red-600">
            {SecureDataHandler.maskFinancialData(mockSummary.operatingExpenses)}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            Core business costs
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">EBITDA</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {SecureDataHandler.maskFinancialData(mockSummary.ebitda)}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            Earnings before interest, taxes, depreciation, and amortization
          </div>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Working Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {SecureDataHandler.maskFinancialData(mockSummary.workingCapital)}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-2">
            Short-term liquidity
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;