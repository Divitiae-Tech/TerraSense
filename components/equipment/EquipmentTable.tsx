// /components/equipment/EquipmentTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EquipmentStatusBadge } from './EquipmentStatusBadge';
import { Pencil, Trash2, Wrench } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// Table expects these fields for each equipment item:
// - id: string (unique identifier)
// - name: string (equipment name)
// - type: string (equipment category)
// - status: 'active' | 'maintenance' | 'inactive' | 'repair'
// - location: string (where equipment is located)
// - hoursUsed: number (operational hours)
// - nextMaintenance: string (ISO date)
// ========================================================================

/**
 * Equipment Table Component
 * 
 * Displays equipment inventory in a tabular format with sorting and action capabilities.
 * Shows key information and allows for quick management actions.
 * 
 * @param props - Component properties
 * @returns JSX element representing the equipment table
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

interface EquipmentTableProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
}

export const EquipmentTable = ({ equipment, onEdit, onDelete }: EquipmentTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Next Maint.</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow key={item.id}> // Fixed: Added key prop
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>
                <EquipmentStatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.hoursUsed}</TableCell>
              <TableCell>{item.nextMaintenance}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};