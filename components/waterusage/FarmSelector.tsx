// /components/waterusage/FarmSelector.tsx
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// This component works with the following data model:
// Farm object with fields:
// - id: string (primary key)
// - name: string (farm name)
// - location: string (farm address/country)
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// For AI/ML applications:
// - This component provides farm context for data analysis
// - The selected farm ID is used as a filter parameter
// - Multiple farms allow for comparative analysis
// ========================================================================

/**
 * Farm Selector Component
 * 
 * Allows users to switch between different farm locations in the dashboard.
 * This component is crucial for multi-farm operations where users need to
 * view data for specific locations.
 * 
 * @param props - Component properties
 * @returns JSX element representing the farm selector
 */
interface Farm {
  id: string;
  name: string;
  location: string;
}

interface FarmSelectorProps {
  farms: Farm[];                    // List of available farms
  selectedFarm: string;             // Currently selected farm ID
  onSelectFarm: (id: string) => void; // Callback when farm is selected
}

export const FarmSelector = ({ farms, selectedFarm, onSelectFarm }: FarmSelectorProps) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Farm details display */}
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="font-semibold">{farms.find(f => f.id === selectedFarm)?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {farms.find(f => f.id === selectedFarm)?.location}
            </p>
          </div>
        </div>
        
        {/* Farm selection buttons */}
        <div className="flex flex-wrap gap-2">
          {farms.map((farm) => (
            <Button
              key={farm.id}
              variant={selectedFarm === farm.id ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectFarm(farm.id)}
            >
              {farm.name}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};