// /components/equipment/EquipmentForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ====================== DATABASE INTEGRATION NOTES ======================
// Form requires these fields for submission:
// - name: string (equipment name)
// - type: string (equipment category)
// - status: 'active' | 'maintenance' | 'inactive' | 'repair'
// - location: string (where equipment is located)
// - hoursUsed: number (operational hours)
// - manufacturer: string
// - model: string
// - serialNumber: string
// - purchaseDate: string (ISO date)
// - warrantyEndDate: string (ISO date)
// - notes: string (additional information)
// ========================================================================

/**
 * Equipment Form Component
 * 
 * Form for creating or editing equipment entries with validation.
 * Handles all necessary fields for equipment tracking.
 * 
 * @param props - Component properties
 * @returns JSX element representing the equipment form
 */
interface Equipment {
  id?: string;
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

interface EquipmentFormProps {
  equipment?: Equipment;
  onSubmit: (equipment: Equipment) => void;
  onCancel: () => void;
}

export const EquipmentForm = ({ equipment, onSubmit, onCancel }: EquipmentFormProps) => {
  // Fixed: Properly initialize form data with required fields
  const [formData, setFormData] = useState<Equipment>(
    equipment || {
      id: '', // Initialize with empty string for optional ID
      name: '',
      type: '',
      status: 'active',
      location: '',
      lastMaintenance: '',
      nextMaintenance: '',
      hoursUsed: 0,
      manufacturer: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      warrantyEndDate: '',
      notes: ''
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hoursUsed' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure id is properly handled
    const submitData = {
      ...formData,
      id: formData.id || undefined // Make sure undefined is passed when id is empty
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Equipment Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Equipment Type *</Label>
          <Select name="type" value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tractor">Tractor</SelectItem>
              <SelectItem value="Irrigation Pump">Irrigation Pump</SelectItem>
              <SelectItem value="Sprayer">Sprayer</SelectItem>
              <SelectItem value="Harvester">Harvester</SelectItem>
              <SelectItem value="Sensor">Sensor</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select name="status" value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as any})}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="hoursUsed">Hours Used</Label>
            <Input
              id="hoursUsed"
              name="hoursUsed"
              type="number"
              value={formData.hoursUsed}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nextMaintenance">Next Maintenance</Label>
            <Input
              id="nextMaintenance"
              name="nextMaintenance"
              type="date"
              value={formData.nextMaintenance}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="warrantyEndDate">Warranty End Date</Label>
            <Input
              id="warrantyEndDate"
              name="warrantyEndDate"
              type="date"
              value={formData.warrantyEndDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Equipment</Button>
      </div>
    </form>
  );
};