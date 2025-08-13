// /components/equipment/EquipmentStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ====================== DATABASE INTEGRATION NOTES ======================
// Statistics calculated from equipment 
// - Total equipment count
// - Active equipment count
// - Maintenance required count
// - Repair needed count
// - Average hours per equipment
// ========================================================================

/**
 * Equipment Statistics Component
 * 
 * Displays key statistics about equipment inventory and status.
 * Provides overview metrics for quick assessment of fleet health.
 * 
 * @param props - Component properties
 * @returns JSX element representing the statistics cards
 */
interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'inactive' | 'repair';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  hoursUsed: number;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyEndDate: string;
  notes: string;
}

interface EquipmentStatsProps {
  equipment: Equipment[];
}

export const EquipmentStats = ({ equipment }: EquipmentStatsProps) => {
  const total = equipment.length;
  const active = equipment.filter(eq => eq.status === 'active').length;
  const maintenance = equipment.filter(eq => eq.status === 'maintenance').length;
  const repair = equipment.filter(eq => eq.status === 'repair').length;
  const inactive = equipment.filter(eq => eq.status === 'inactive').length;
  
  const totalHours = equipment.reduce((sum, eq) => sum + eq.hoursUsed, 0);
  const avgHours = total > 0 ? Math.round(totalHours / total) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Assets in inventory</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active}</div>
          <p className="text-xs text-muted-foreground">Currently operating</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{maintenance}</div>
          <p className="text-xs text-muted-foreground">Scheduled for service</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Repair Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{repair}</div>
          <p className="text-xs text-muted-foreground">Under repair</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgHours}</div>
          <p className="text-xs text-muted-foreground">Per asset</p>
        </CardContent>
      </Card>
    </div>
  );
};