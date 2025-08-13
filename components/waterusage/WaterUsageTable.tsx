// /components/waterusage/WaterUsageTable.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// This table displays irrigation system data with these fields:
// - id: string (primary key)
// - name: string (system name)
// - status: enum ('active', 'inactive', 'warning')
// - usage: number (current water usage in m³)
// - efficiency: number (efficiency percentage)
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// System performance data useful for:
// - Classification models to predict system failures
// - Optimization algorithms for scheduling
// - Anomaly detection for unusual usage patterns
// ========================================================================

/**
 * Water Usage Table Component
 * 
 * Displays detailed performance information for irrigation systems.
 * Shows status indicators, usage metrics, and efficiency percentages.
 * 
 * @param props - Component properties
 * @returns JSX element representing the table
 */
interface IrrigationSystem {
  id: string;              // Unique identifier for the system
  name: string;            // Name of the irrigation system
  status: 'active' | 'inactive' | 'warning'; // Operational status
  usage: number;           // Current water usage in m³
  efficiency: number;      // Efficiency percentage (0-100)
}

interface WaterUsageTableProps {
  systems: IrrigationSystem[]; // Array of irrigation system data
}

export const WaterUsageTable = ({ systems }: WaterUsageTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Irrigation Systems Performance</CardTitle>
        <CardDescription>Monitoring efficiency of different irrigation systems</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Scrollable table container */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">System</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Usage (m³)</th>
                <th className="text-left p-3">Efficiency</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Each irrigation system row */}
              {systems.map((system) => (
                <tr key={system.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{system.name}</td>
                  
                  {/* Status badge with color coding */}
                  <td className="p-3">
                    <Badge 
                      variant={system.status === 'active' ? 'default' : 
                              system.status === 'warning' ? 'destructive' : 'secondary'}
                    >
                      {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                    </Badge>
                  </td>
                  
                  {/* Water usage value */}
                  <td className="p-3">{system.usage} m³</td>
                  
                  {/* Efficiency with progress bar */}
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            system.efficiency > 85 ? 'bg-green-500' : 
                            system.efficiency > 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${system.efficiency}%` }}
                        ></div>
                      </div>
                      <span>{system.efficiency}%</span>
                    </div>
                  </td>
                  
                  {/* Action button column */}
                  <td className="p-3">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
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