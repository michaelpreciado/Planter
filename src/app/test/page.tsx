'use client';

import { useState } from 'react';
import { usePlants } from '@/lib/plant-store';

export default function TestPage() {
  const { 
    plants, 
    addPlant, 
    debugPlantStore, 
    clearError, 
    error, 
    loading,
    initializeSampleData 
  } = usePlants();
  
  const [testPlantName, setTestPlantName] = useState('');

  const handleAddTestPlant = async () => {
    if (!testPlantName.trim()) return;
    
    console.log('Adding test plant:', testPlantName);
    await addPlant({
      name: testPlantName.trim(),
      species: 'test species',
      wateringFrequency: 7,
      notes: 'Test plant created at ' + new Date().toLocaleTimeString(),
      noteAttachments: [],
      plantingDate: new Date().toISOString(),
    });
    
    setTestPlantName('');
    console.log('Plant added successfully');
  };

  const handleAddQuickTestPlant = async () => {
    console.log('Adding quick test plant');
    await addPlant({
      name: 'Quick Test Plant ' + Date.now(),
      species: 'Testicus planticus',
      wateringFrequency: 3,
      notes: 'Quick test plant for debugging',
      noteAttachments: [],
      plantingDate: new Date().toISOString(),
    });
    console.log('Quick plant added successfully');
  };

  const handleCheckLocalStorage = () => {
    const stored = localStorage.getItem('plant-store');
    console.log('LocalStorage plant-store:', stored);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Parsed storage:', parsed);
        console.log('Plants in storage:', parsed.state?.plants?.length || 0);
      } catch (e) {
        console.error('Failed to parse stored data:', e);
      }
    } else {
      console.log('No plant-store data found in localStorage');
    }
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem('plant-store');
    console.log('Cleared localStorage');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Plant Store Debug</h1>
        
        {/* Current State */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <p>Plants: {plants.length}</p>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Error: {error || 'None'}</p>
          
          {plants.length > 0 && (
            <div className="mt-2">
              <h3 className="font-medium">Plant List:</h3>
              <ul className="list-disc list-inside">
                {plants.map(plant => (
                  <li key={plant.id} className="text-sm">
                    {plant.name} ({plant.species}) - {plant.id.slice(0, 8)}...
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
            >
              Clear Error
            </button>
          </div>
        )}

        {/* Add Test Plant */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Add Test Plant</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPlantName}
              onChange={(e) => setTestPlantName(e.target.value)}
              placeholder="Test plant name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleAddTestPlant}
              disabled={!testPlantName.trim() || loading}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              Add Plant
            </button>
          </div>
          <button
            onClick={handleAddQuickTestPlant}
            disabled={loading}
            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Add Quick Test Plant
          </button>
        </div>

        {/* Debug Actions */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Actions</h2>
          <div className="space-y-2">
            <button
              onClick={debugPlantStore}
              className="block w-full px-4 py-2 bg-blue-500 text-white rounded"
            >
              Debug Store State (Check Console)
            </button>
            
            <button
              onClick={handleCheckLocalStorage}
              className="block w-full px-4 py-2 bg-purple-500 text-white rounded"
            >
              Check localStorage (Check Console)
            </button>
            
            <button
              onClick={initializeSampleData}
              className="block w-full px-4 py-2 bg-orange-500 text-white rounded"
            >
              Add Sample Plants
            </button>
            
            <button
              onClick={handleClearLocalStorage}
              className="block w-full px-4 py-2 bg-red-500 text-white rounded"
            >
              Clear localStorage &amp; Reload
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Try adding a test plant and see if it appears in the list</li>
            <li>Refresh the page and check if the plant persists</li>
            <li>Check the browser console for any errors</li>
            <li>Use &ldquo;Debug Store State&rdquo; to see the current state</li>
            <li>Use &ldquo;Check localStorage&rdquo; to see what&rsquo;s stored</li>
            <li>Navigate to other pages and come back to see if plants disappear</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 