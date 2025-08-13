// /components/equipment/EquipmentStatusBadge.tsx
import { Badge } from '@/components/ui/badge';

// ====================== DATABASE INTEGRATION NOTES ======================
// Status mapping for equipment:
// - 'active': Operational and ready for use
// - 'maintenance': Scheduled for maintenance
// - 'inactive': Not currently in use
// - 'repair': Under repair or maintenance
// ========================================================================

/**
 * Equipment Status Badge Component
 * 
 * Visual indicator for equipment status with appropriate colors and labels.
 * Provides quick visual understanding of equipment operational status.
 * 
 * @param props - Component properties
 * @returns JSX element representing the status badge
 */
interface EquipmentStatusBadgeProps {
  status: 'active' | 'maintenance' | 'inactive' | 'repair';
}

export const EquipmentStatusBadge = ({ status }: EquipmentStatusBadgeProps) => {
  const statusConfig = {
    active: { 
      variant: 'default', 
      label: 'Active' 
    },
    maintenance: { 
      variant: 'warning', 
      label: 'Maintenance' 
    },
    inactive: { 
      variant: 'secondary', 
      label: 'Inactive' 
    },
    repair: { 
      variant: 'destructive', 
      label: 'Repair' 
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};