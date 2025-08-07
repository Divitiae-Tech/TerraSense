'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { GanttCropCalendar } from '@/components/dashboard/GanttCropCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Filter,
  Download,
  Calendar,
  Search,
  Plus,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HarvestPlanPage() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  const years = ['2023', '2024', '2025'];
  const cropTypes = ['All Crops', 'Grains', 'Vegetables', 'Fruits', 'Root Crops'];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header />
      </div>
      
      {/* Page Header with Controls */}
      <div className="flex-none bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Harvest Planning</h1>
              <p className="text-sm text-muted-foreground">
                Plan and manage your crop planting and harvest schedules
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
              
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Crop
              </Button>
            </div>
          </div>
          
          {/* Filters and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search crops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select defaultValue="All Crops">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Planting: 8 Active
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
                Harvest: 12 Scheduled
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Calendar Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full">
          <GanttCropCalendar isFullPage={true} />
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="flex-none bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Total Crops: 11</span>
            <span>Active Seasons: 8 Planting, 12 Harvest</span>
            <span>Last Updated: Today, 2:30 PM</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Calendar Settings
            </Button>
            
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Month
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}