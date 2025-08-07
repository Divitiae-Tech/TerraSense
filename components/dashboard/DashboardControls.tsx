'use client';

import React from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardControlsProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const DashboardControls = ({ 
  selectedPeriod, 
  setSelectedPeriod, 
  selectedDate, 
  setSelectedDate 
}: DashboardControlsProps) => {
  const periods = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year'];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map(period => (
              <SelectItem key={period} value={period}>{period}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
};