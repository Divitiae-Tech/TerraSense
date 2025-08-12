// components/finance/CustomReportWidget.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { SecureDataHandler } from '@/lib/secureDataHandler';

// Define report types
type ReportType = 'profit-loss' | 'expense-breakdown' | 'crop-performance' | 'cash-flow' | 'budget-vs-actual';
type ChartType = 'line' | 'bar' | 'pie' | 'area';

// Mock data
const mockReportData = {
  profitLoss: [
    { date: 'Jan', income: 25000, expenses: 21000, profit: 4000 },
    { date: 'Feb', income: 18000, expenses: 20000, profit: -2000 },
    { date: 'Mar', income: 23000, expenses: 20000, profit: 3000 },
    { date: 'Apr', income: 30000, expenses: 25000, profit: 5000 },
    { date: 'May', income: 19000, expenses: 20000, profit: -1000 },
    { date: 'Jun', income: 32000, expenses: 25000, profit: 7000 },
  ],
  expenseBreakdown: [
    { name: 'Fertilizer', value: 25000 },
    { name: 'Seeds', value: 15000 },
    { name: 'Labor', value: 20000 },
    { name: 'Fuel', value: 10000 },
    { name: 'Pesticides', value: 5000 },
  ],
  cropPerformance: [
    { crop: 'Maize', roi: 20, profit: 6000 },
    { crop: 'Wheat', roi: 15, profit: 3750 },
    { crop: 'Soybeans', roi: 25, profit: 3750 },
    { crop: 'Sunflower', roi: 8, profit: 960 },
  ],
  cashFlow: [
    { month: 'Jan', inflow: 25000, outflow: 21000 },
    { month: 'Feb', inflow: 18000, outflow: 20000 },
    { month: 'Mar', inflow: 23000, outflow: 20000 },
    { month: 'Apr', inflow: 30000, outflow: 25000 },
  ],
  budgetVsActual: [
    { category: 'Fertilizer', budget: 25000, actual: 24000 },
    { category: 'Seeds', budget: 15000, actual: 16000 },
    { category: 'Labor', budget: 20000, actual: 21000 },
    { category: 'Fuel', budget: 12000, actual: 13500 },
  ],
};

// Chart colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface CustomReportWidgetProps {
  onReportGenerated: (report: any) => void;
}

export default function CustomReportWidget({ onReportGenerated }: CustomReportWidgetProps) {
  const [reportType, setReportType] = useState<ReportType>('profit-loss');
  const [dateRange, setDateRange] = useState('last30');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ Map reportType to correct dataset
  const getDataForReport = () => {
    switch (reportType) {
      case 'profit-loss':
        return mockReportData.profitLoss;
      case 'expense-breakdown':
        return mockReportData.expenseBreakdown;
      case 'crop-performance':
        return mockReportData.cropPerformance;
      case 'cash-flow':
        return mockReportData.cashFlow;
      case 'budget-vs-actual':
        return mockReportData.budgetVsActual;
      default:
        return [];
    }
  };

  const data = getDataForReport();

  // ✅ Auto-switch chart type based on report type for better UX
  useEffect(() => {
    if (reportType === 'expense-breakdown' || reportType === 'budget-vs-actual') {
      setChartType('pie');
    } else if (reportType === 'crop-performance') {
      setChartType('bar');
    } else {
      setChartType('line');
    }
  }, [reportType]);

  // ✅ Generate report
  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const report = {
        type: reportType,
        dateRange,
        chartType,
        data,
        generatedAt: new Date().toISOString(),
      };
      onReportGenerated(report);
      setIsGenerating(false);
    }, 1000);
  };

  // ✅ Render dynamic chart based on type
  const renderChart = () => {
    // Line Chart
    if (chartType === 'line' && (reportType === 'profit-loss' || reportType === 'cash-flow')) {
      const dataKey = reportType === 'profit-loss' ? 'profit' : 'inflow';
      const lineData = data.map((d: any) => ({
        ...d,
        [dataKey]: SecureDataHandler.maskFinancialData(d[dataKey]),
      }));

      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={reportType === 'cash-flow' ? 'month' : 'date'} stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
              formatter={(value, name) => [`R${SecureDataHandler.maskFinancialData(Number(value))}`, name]}
            />
            <Legend />
            {Object.keys(data[0] || {}).map((key) => {
              if (key === 'date' || key === 'month') return null;
              const strokeMap: Record<string, string> = {
                income: '#10b981',
                expenses: '#ef4444',
                profit: '#3b82f6',
                inflow: '#10b981',
                outflow: '#ef4444',
              };
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={strokeMap[key] || '#666'}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Bar Chart
    if (chartType === 'bar' && reportType === 'crop-performance') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="crop" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              formatter={(value, name) => [`R${SecureDataHandler.maskFinancialData(Number(value))}`, name]}
            />
            <Legend />
            <Bar dataKey="profit" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Pie Chart
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, value }) => `${name}: R${value.toLocaleString()}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`R${SecureDataHandler.maskFinancialData(Number(value))}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Area Chart (fallback)
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              formatter={(value) => [`R${SecureDataHandler.maskFinancialData(Number(value))}`]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#818cf8"
              fill="url(#colorProfit)"
              name="Net Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return <p className="text-center text-gray-500">No chart available</p>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Custom Report Generator</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateReport}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Report Type</label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select report" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit-loss">Profit & Loss</SelectItem>
                <SelectItem value="expense-breakdown">Expense Breakdown</SelectItem>
                <SelectItem value="crop-performance">Crop Performance</SelectItem>
                <SelectItem value="cash-flow">Cash Flow</SelectItem>
                <SelectItem value="budget-vs-actual">Budget vs Actual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Chart Type</label>
            <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Preview */}
        <div className="h-[300px] border rounded-lg bg-white p-4">
          {data.length > 0 ? renderChart() : <p className="text-center text-gray-500">No data available</p>}
        </div>
      </CardContent>
    </Card>
  );
}