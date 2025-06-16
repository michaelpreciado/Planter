'use client';

import { useState, useEffect } from 'react';
import { usePlants } from '@/lib/plant-store';
import { debugImageSystem, getStorageStats, getAllImageMetadata } from '@/utils/imageStorage';
import { ImageDisplay } from '@/components/ImageDisplay';
import { ImageDiagnostic } from '@/components/ImageDiagnostic';

export default function TestPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { plants, debugPlantStore } = usePlants();

  const runDiagnostics = async () => {
    setLoading(true);
    console.log('Running image diagnostics...');
    
    try {
      // Run debug functions
      await debugImageSystem();
      await debugPlantStore();
      
      // Get stats
      const stats = getStorageStats();
      const metadata = getAllImageMetadata();
      
      setDiagnostics({
        stats,
        metadata,
        plantsWithImages: plants.filter(p => p.imageUrl).length,
        totalPlants: plants.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setDiagnostics({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image System Diagnostics</h1>
        
        <div className="space-y-6">
          {/* New Interactive Diagnostic Tool */}
          <div className="bg-white rounded-lg shadow p-6">
            <ImageDiagnostic />
          </div>

          {/* Diagnostic Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Diagnostics</h2>
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Advanced Diagnostics'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Check browser console for detailed logs
            </p>
          </div>

          {/* Results */}
          {diagnostics && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Diagnostic Results</h2>
              {diagnostics.error ? (
                <div className="text-red-600">
                  <p>Error: {diagnostics.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {diagnostics.totalPlants}
                      </div>
                      <div className="text-sm text-gray-600">Total Plants</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {diagnostics.plantsWithImages}
                      </div>
                      <div className="text-sm text-gray-600">Plants with Images</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {diagnostics.stats.totalImages}
                      </div>
                      <div className="text-sm text-gray-600">Stored Images</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(diagnostics.stats.usagePercentage)}%
                      </div>
                      <div className="text-sm text-gray-600">Storage Used</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Storage Details</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(diagnostics.stats, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plant Images Preview */}
          {plants.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Plant Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {plants.map((plant) => (
                  <div key={plant.id} className="border rounded-lg p-3">
                    <div className="w-full h-32 mb-2">
                      {plant.imageUrl ? (
                        <ImageDisplay
                          imageId={plant.imageUrl}
                          alt={plant.name}
                          width={150}
                          height={128}
                          className="w-full h-full object-cover rounded"
                          fallback={
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-2xl">{plant.icon}</span>
                            </div>
                          }
                        />
                      ) : (
                        <div 
                          className="w-full h-full rounded flex items-center justify-center text-3xl"
                          style={{ backgroundColor: plant.iconColor + '20', color: plant.iconColor }}
                        >
                          {plant.icon}
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm truncate">{plant.name}</h3>
                    <p className="text-xs text-gray-500">
                      {plant.imageUrl ? `ID: ${plant.imageUrl}` : 'No image'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 