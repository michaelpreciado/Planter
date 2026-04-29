'use client';

import { useState } from 'react';
import { usePlants } from '@/hooks/usePlants';
import { isOverdue, getPlantStatus, type Plant, type Priority } from '@/lib/schemas';
import { v4 as uuidv4 } from 'uuid';

// Sample data as fallback while loading
const SAMPLE_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Fiddle Leaf Fig',
    nickname: 'Figgy',
    species: 'Ficus lyrata',
    wateringIntervalDays: 7,
    lastWatered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    color: '#10b981',
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Monstera',
    nickname: 'Monty',
    species: 'Monstera deliciosa',
    wateringIntervalDays: 10,
    lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'normal',
    color: '#3b82f6',
    notes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function AddPlantModal({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (plant: Plant) => void;
}) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [species, setSpecies] = useState('');
  const [interval, setInterval] = useState('7');
  const [priority, setPriority] = useState<Priority>('normal');
  const [color, setColor] = useState('#10b981');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plant: Plant = {
      id: uuidv4(),
      name,
      nickname: nickname || undefined,
      species: species || undefined,
      wateringIntervalDays: parseInt(interval) || 7,
      lastWatered: new Date().toISOString(),
      priority,
      color,
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(plant);
    // Reset form
    setName('');
    setNickname('');
    setSpecies('');
    setInterval('7');
    setPriority('normal');
    setColor('#10b981');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[#FDF6E3] rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 
          className="text-2xl font-serif mb-6" 
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Add New Plant
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              placeholder="e.g., Fiddle Leaf Fig"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              placeholder="e.g., Figgy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <input
              type="text"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              placeholder="e.g., Ficus lyrata"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Watering Interval (days)</label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-[#E07A5F] text-white hover:bg-[#c96a4f] transition-colors font-medium"
            >
              Add Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlantCard({ 
  plant, 
  onWater 
}: { 
  plant: Plant; 
  onWater: (id: string) => void;
}) {
  const status = getPlantStatus(plant);
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    thirsty: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: plant.color }}
        >
          {plant.nickname?.[0] || plant.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{plant.nickname || plant.name}</h3>
          {plant.nickname && (
            <p className="text-sm text-gray-500 truncate">{plant.name}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        <span>Every {plant.wateringIntervalDays} days</span>
        {status === 'overdue' && (
          <button
            onClick={() => onWater(plant.id)}
            className="px-3 py-1 bg-[#E07A5F] text-white rounded-lg text-xs hover:bg-[#c96a4f] transition-colors"
          >
            Water now
          </button>
        )}
      </div>
    </div>
  );
}

function OverdueBanner({ 
  plants, 
  onWater 
}: { 
  plants: Plant[]; 
  onWater: (id: string) => void;
}) {
  if (plants.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-red-800">
            {plants.length} plant{plants.length > 1 ? 's' : ''} overdue!
          </h3>
          <p className="text-sm text-red-600">
            {plants.map(p => p.nickname || p.name).join(', ')} need water
          </p>
        </div>
        <button
          onClick={() => plants.forEach(p => onWater(p.id))}
          className="px-4 py-2 bg-[#E07A5F] text-white rounded-lg text-sm hover:bg-[#c96a4f] transition-colors"
        >
          Water all
        </button>
      </div>
    </div>
  );
}

export default function V2Page() {
  const { plants, loading, save, water } = usePlants();
  const [showAddModal, setShowAddModal] = useState(false);

  // Use sample data while loading or empty
  const displayPlants = plants.length > 0 ? plants : SAMPLE_PLANTS;
  const overduePlants = displayPlants.filter(p => p.priority === 'high' && isOverdue(p));

  const handleSavePlant = async (plant: Plant) => {
    await save(plant);
  };

  const handleWater = async (id: string) => {
    await water(id);
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 
          className="text-3xl font-serif"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          My Garden
        </h1>
        <p className="text-gray-500 mt-1">
          {displayPlants.length} plant{displayPlants.length !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Main content */}
      <main className="px-6 pb-24">
        {/* Overdue banner */}
        <OverdueBanner plants={overduePlants} onWater={handleWater} />

        {/* Plant list */}
        {loading && plants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Loading...
          </div>
        ) : displayPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No plants yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#c96a4f] transition-colors"
            >
              Add your first plant
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayPlants.map(plant => (
              <PlantCard 
                key={plant.id} 
                plant={plant} 
                onWater={handleWater}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating + button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#E07A5F] text-white rounded-full shadow-lg hover:bg-[#c96a4f] transition-colors flex items-center justify-center text-2xl"
      >
        +
      </button>

      {/* Add plant modal */}
      <AddPlantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSavePlant}
      />
    </div>
  );
}
