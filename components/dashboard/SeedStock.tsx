'use client';

import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface SeedStockItem {
  name: string;
  current: number;
  max: number;
}

interface SeedStockProps {
  seedStockData: SeedStockItem[];
}

export const SeedStock = ({ seedStockData }: SeedStockProps) => {
  const getStockStatus = (percentage: number) => {
    if (percentage > 70) return { variant: 'default' as const, text: 'Good' };
    if (percentage > 30) return { variant: 'secondary' as const, text: 'Low' };
    return { variant: 'destructive' as const, text: 'Critical' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-500" />
          <span>Seed Stock</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {seedStockData.map((item, index) => {
            const percentage = Math.round((item.current / item.max) * 100);
            const status = getStockStatus(percentage);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {percentage}%
                    </span>
                    <Badge variant={status.variant} className="text-xs">
                      {status.text}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {item.current} / {item.max} units
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Total Items: </span>
            <span className="font-medium">{seedStockData.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};