// /components/equipment/EquipmentDashboard.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EquipmentTable } from './EquipmentTable';
import { EquipmentFilters } from './EquipmentFilters';
import { EquipmentStats } from './EquipmentStats';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentCard } from './EquipmentCard';
import { Plus, Search, Settings } from 'lucide-react';

// ====================== DATABASE INTEGRATION NOTES ======================
// Equipment data structure expected from backend:
// - id: string (primary key)
// - name: string (equipment name)
// - type: string (e.g., "Tractor", "Irrigation Pump", "Sprayer")
// - status: 'active' | 'maintenance' | 'inactive' | 'repair'
// - location: string (farm location)
// - lastMaintenance: string (ISO date)
// - nextMaintenance: string (ISO date)
// - hoursUsed: number (operational hours)
// - manufacturer: string
// - model: string
// - serialNumber: string
// - purchaseDate: string (ISO date)
// - warrantyEndDate: string (ISO date)
// - notes: string (additional information)
// ========================================================================

// ====================== AI MODEL INTEGRATION NOTES ======================
// Equipment data useful for:
// - Predictive maintenance models
// - Asset utilization optimization
// - Replacement scheduling algorithms
// - Cost analysis and budgeting
// ========================================================================

// Fixed: Properly define Equipment interface with required fields
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

// Mock data for demonstration
const mockEquipment: Equipment[] = [
  {
    id: 'eq-1',
    name: 'John Deere Tractor',
    type: 'Tractor',
    status: 'active',
    location: 'Field A',
    lastMaintenance: '2023-06-15',
    nextMaintenance: '2023-12-15',
    hoursUsed: 1200,
    manufacturer: 'John Deere',
    model: '7R 410',
    serialNumber: 'JD7R410-12345',
    purchaseDate: '2020-03-22',
    warrantyEndDate: '2025-03-22',
    notes: 'Regular maintenance schedule'
  },
  {
    id: 'eq-2',
    name: 'Irrigation Pump System',
    type: 'Irrigation Pump',
    status: 'maintenance',
    location: 'Main Farm',
    lastMaintenance: '2023-05-20',
    nextMaintenance: '2023-11-20',
    hoursUsed: 850,
    manufacturer: 'Kohler',
    model: 'K3400',
    serialNumber: 'K3400-SN98765',
    purchaseDate: '2019-07-10',
    warrantyEndDate: '2024-07-10',
    notes: 'Needs filter replacement'
  },
  {
    id: 'eq-3',
    name: 'Spray Boom Unit',
    type: 'Sprayer',
    status: 'active',
    location: 'Field B',
    lastMaintenance: '2023-04-10',
    nextMaintenance: '2023-10-10',
    hoursUsed: 620,
    manufacturer: 'Case IH',
    model: '7230',
    serialNumber: 'CI7230-54321',
    purchaseDate: '2021-09-05',
    warrantyEndDate: '2026-09-05',
    notes: 'New nozzles installed'
  },
  {
    id: 'eq-4',
    name: 'Harvester',
    type: 'Harvester',
    status: 'repair',
    location: 'Storage',
    lastMaintenance: '2023-03-01',
    nextMaintenance: '2023-09-01',
    hoursUsed: 1500,
    manufacturer: 'Claas',
    model: 'Lexion 670',
    serialNumber: 'CL670-11223',
    purchaseDate: '2018-11-15',
    warrantyEndDate: '2023-11-15',
    notes: 'Engine repair needed'
  },
  {
    id: 'eq-5',
    name: 'Soil Moisture Sensor',
    type: 'Sensor',
    status: 'active',
    location: 'Field C',
    lastMaintenance: '2023-06-01',
    nextMaintenance: '2023-12-01',
    hoursUsed: 0,
    manufacturer: 'AgriTech',
    model: 'SM-200',
    serialNumber: 'AGSM200-55667',
    purchaseDate: '2022-01-10',
    warrantyEndDate: '2027-01-10',
    notes: 'Calibration required'
  },
];

/**
 * Equipment Management Dashboard
 * 
 * Main dashboard for managing agricultural equipment including tracking,
 * maintenance scheduling, and performance monitoring.
 * 
 * @returns JSX element representing the equipment dashboard
 */
export const EquipmentDashboard = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>(mockEquipment);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Apply filters whenever search term or filters change
  React.useEffect(() => {
    let result = equipment;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(eq => 
        eq.name.toLowerCase().includes(term) ||
        eq.type.toLowerCase().includes(term) ||
        eq.manufacturer.toLowerCase().includes(term) ||
        eq.location.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(eq => eq.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(eq => eq.type === typeFilter);
    }
    
    setFilteredEquipment(result);
  }, [searchTerm, statusFilter, typeFilter, equipment]);

  // Handle adding new equipment
  const handleAddEquipment = (newEquipment: Equipment) => {
    const updatedEquipment = [...equipment, newEquipment];
    setEquipment(updatedEquipment);
    setShowForm(false);
  };

  // Handle updating equipment
  const handleUpdateEquipment = (updatedEquipment: Equipment) => {
    const updatedList = equipment.map(eq => 
      eq.id === updatedEquipment.id ? updatedEquipment : eq
    );
    setEquipment(updatedList);
    setEditingEquipment(null);
  };

  // Handle deleting equipment
  const handleDeleteEquipment = (id: string) => {
    const updatedEquipment = equipment.filter(eq => eq.id !== id);
    setEquipment(updatedEquipment);
  };

  // Get unique equipment types for filtering
  const equipmentTypes = Array.from(
    new Set(equipment.map(eq => eq.type))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">Track and manage agricultural equipment assets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <EquipmentStats equipment={equipment} />

      {/* Filters and Search */}
      <EquipmentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        equipmentTypes={equipmentTypes}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
              <CardDescription>Manage all agricultural equipment assets</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEquipment.length > 0 ? (
                <EquipmentTable 
                  equipment={filteredEquipment}
                  onEdit={setEditingEquipment}
                  onDelete={handleDeleteEquipment}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No equipment found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Equipment Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Equipment Details</CardTitle>
              <CardDescription>View and edit equipment information</CardDescription>
            </CardHeader>
            <CardContent>
              {editingEquipment ? (
                <EquipmentForm 
                  equipment={editingEquipment}
                  onSubmit={handleUpdateEquipment}
                  onCancel={() => setEditingEquipment(null)}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Select an equipment item to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Equipment Cards View */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Equipment Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map(item => (
            <EquipmentCard 
              key={item.id} // Fixed: Added key prop
              equipment={item} 
              onEdit={() => setEditingEquipment(item)}
            />
          ))}
        </div>
      </div>

      {/* Add Equipment Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add New Equipment</h3>
              <EquipmentForm 
                onSubmit={handleAddEquipment}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};