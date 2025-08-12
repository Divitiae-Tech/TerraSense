// components/finance/ForecastChart.tsx
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend
} from "recharts";
import { SecureDataHandler } from "@/lib/secureDataHandler";

interface ForecastChartProps {
  dateRange: string;
}

const ForecastChart = ({ dateRange }: ForecastChartProps) => {
  // DB Dev Comment: Connect to AI service that uses weather data + historical transactions to forecast future earnings.
  const mockData = [
    { month: "Jun", actual: 5000, forecast: 5200, confidence: 85, trend: "up" },
    { month: "Jul", actual: 7500, forecast: 7000, confidence: 78, trend: "down" },
    { month: "Aug", actual: null, forecast: 8000, confidence: 72, trend: "up" },
    { month: "Sep", actual: null, forecast: 6000, confidence: 68, trend: "down" },
    { month: "Oct", actual: null, forecast: 9500, confidence: 65, trend: "up" },
    { month: "Nov", actual: null, forecast: 11000, confidence: 60, trend: "up" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI Income Forecast
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">🤖 AI Powered</Badge>
            <Badge variant={mockData[1]?.confidence > 70 ? "default" : "destructive"}>
              {mockData[1]?.confidence}% Confidence
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="confidenceHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="confidenceLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value, name, props) => {
                if (name === 'forecast') {
                  return [
                    `R${SecureDataHandler.maskFinancialData(Number(value))}`,
                    `Forecast (${props.payload.confidence}% confidence)`
                  ];
                }
                if (name === 'actual') {
                  return [`R${value ? SecureDataHandler.maskFinancialData(Number(value)) : 'N/A'}`, 'Actual'];
                }
                return [`R${SecureDataHandler.maskFinancialData(Number(value))}`, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#818cf8"
              fillOpacity={1}
              fill="url(#forecastGradient)"
              name="Forecasted Income"
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#10b981"
              strokeWidth={3}
              name="Actual Income"
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;