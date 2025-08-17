'use client';

import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

interface SeedStockItem {
  _id: string;
  name: string;
  currentStock: number;
  maxCapacity: number;
  unit: string;
  type: 'seeds' | 'fertilizer' | 'pesticide' | 'equipment' | 'other';
  minThreshold?: number;
}

interface SeedStockProps {
  userId?: string;
}

export const SeedStock = ({ userId }: SeedStockProps) => {
  const { user } = useUser();
  
  // Get user from Convex based on Clerk user
  const convexUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  const seedStockData = useQuery(
    api.database.getSeedStock, 
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const getStockStatus = (percentage: number) => {
    if (percentage > 70) return { variant: 'secondary' as const, text: 'Good' };
    if (percentage > 50) return { variant: 'yellow' as const, text: 'Moderate' };
    if (percentage > 30) return { variant: 'orange' as const, text: 'Low' };
    return { variant: 'destructive' as const, text: 'Critical' };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seeds':
        return '🌱';
      case 'fertilizer':
        return '🧪';
      case 'pesticide':
        return '🛡️';
      case 'equipment':
        return '🔧';
      default:
        return '📦';
    }
  };

  if (!seedStockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span>Seed Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (seedStockData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span>Seed Stock</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No stock items found. Add some seeds and supplies to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = seedStockData.filter(item => {
    const threshold = item.minThreshold || (item.maxCapacity * 0.2);
    const percentage = (item.currentStock / item.maxCapacity) * 100;
    return percentage <= 30;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span>Seed Stock</span>
          </div>
          {lowStockItems.length > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>{lowStockItems.length} Low</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {seedStockData.map((item) => {
            const percentage = Math.round((item.currentStock / item.maxCapacity) * 100);
            const status = getStockStatus(percentage);
            
            return (
              <div key={item._id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
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
                  {item.currentStock} / {item.maxCapacity} {item.unit}
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