'use client';

import { useState, useEffect } from 'react';
import { usePlants } from '@/lib/plant-store';
import Link from 'next/link';

export default function TestPage() {
  const [mounted, setMounted] = useState(false);
  const { 
    plants, 
    loading, 
    error, 
    debugPlantStore, 
    removeDuplicatePlants, 
    syncWithDatabase,
    triggerManualSync
  } = usePlants();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemoveDuplicates = () => {
    const removedCount = removeDuplicatePlants();
    alert(`Removed ${removedCount} duplicate plants`);
  };

  const handleDebug = () => {
    debugPlantStore();
  };

  const handleSync = async () => {
    try {
      await triggerManualSync();
      alert('Sync completed');
    } catch (error) {
      alert(`Sync failed: ${error}`);
    }
  };

  if (!mounted) {
    return <div className="p-4">Loading...</div>;
  }

  // Find potential duplicates
  const duplicateGroups = plants.reduce((groups, plant) => {
    const key = `${plant.name}-${plant.species}-${plant.plantingDate}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(plant);
    return groups;
  }, {} as Record<string, typeof plants>);

  const actualDuplicates = Object.values(duplicateGroups).filter(group => group.length > 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Plant Store Debug Page</h1>
        <Link 
          href="/" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </Link>
      </div>

      {/* Status Panel */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Store Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Total Plants:</strong> {plants.length}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
          <div>
            <p><strong>Potential Duplicates:</strong> {actualDuplicates.length} groups</p>
            <p><strong>Duplicate Plants:</strong> {actualDuplicates.reduce((sum, group) => sum + group.length - 1, 0)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={handleDebug}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Debug Store (Check Console)
        </button>
        <button 
          onClick={handleRemoveDuplicates}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove Duplicates
        </button>
        <button 
          onClick={handleSync}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Syncing...' : 'Manual Sync'}
        </button>
      </div>

      {/* Duplicates Section */}
      {actualDuplicates.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            ⚠️ Duplicate Plants Found
          </h2>
          {actualDuplicates.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-4 last:mb-0">
              <h3 className="font-medium text-red-700 mb-2">
                Group {groupIndex + 1}: {group[0].name} ({group.length} duplicates)
              </h3>
              <div className="pl-4">
                {group.map((plant, plantIndex) => (
                  <div key={plant.id} className="text-sm text-gray-600 mb-1">
                    {plantIndex + 1}. ID: {plant.id} | Created: {new Date(plant.createdAt).toLocaleString()} | Updated: {new Date(plant.updatedAt).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plants List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Plants ({plants.length})</h2>
        <div className="space-y-2">
          {plants.map((plant, index) => (
            <div key={plant.id} className="bg-white border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{index + 1}. {plant.icon} {plant.name}</span>
                  <span className="text-gray-500 ml-2">({plant.species})</span>
                </div>
                <div className="text-sm text-gray-400">
                  ID: {plant.id.slice(0, 8)}...
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Planted: {new Date(plant.plantingDate).toLocaleDateString()} | 
                Status: {plant.status} | 
                Next: {plant.nextWatering}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Created: {new Date(plant.createdAt).toLocaleString()} | 
                Updated: {new Date(plant.updatedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {plants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No plants found. Add some plants to test the duplication fix!
        </div>
      )}
    </div>
  );
} 