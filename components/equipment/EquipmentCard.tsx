// /components/equipment/EquipmentCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EquipmentStatusBadge } from './EquipmentStatusBadge';
import { Pencil, Wrench, Calendar, MapPin, Clock } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// Equipment card requires these fields:
// - id: string (unique identifier)
// - name: string (equipment name)
// - type: string (equipment category)
// - status: 'active' | 'maintenance' | 'inactive' | 'repair'
// - location: string (where equipment is located)
// - hoursUsed: number (operational hours)
// - nextMaintenance: string (ISO date)
// ========================================================================

/**
 * Equipment Card Component
 * 
 * Individual card representation of equipment with key details and actions.
 * Provides quick overview of equipment status and important metrics.
 * 
 * @param props - Component properties
 * @returns JSX element representing the equipment card
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

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit: () => void;
}

export const EquipmentCard = ({ equipment, onEdit }: EquipmentCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{equipment.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{equipment.type}</p>
          </div>
          <EquipmentStatusBadge status={equipment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{equipment.location}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{equipment.hoursUsed} hours</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>Next maintenance: {equipment.nextMaintenance}</span>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};