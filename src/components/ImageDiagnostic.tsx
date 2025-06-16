'use client';

import { useState, useEffect } from 'react';
import { usePlants } from '@/lib/plant-store';

interface ImageInfo {
  id: string;
  exists: boolean;
  data?: string;
  error?: string;
}

export function ImageDiagnostic() {
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [imageInfo, setImageInfo] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { plants, getImage } = usePlants();

  useEffect(() => {
    // Collect all image IDs from plants
    const ids: string[] = [];
    plants.forEach(plant => {
      if (plant.imageUrl) ids.push(plant.imageUrl);
      if (plant.noteAttachments) {
        plant.noteAttachments.forEach(id => ids.push(id));
      }
    });
    setImageIds([...new Set(ids)]); // Remove duplicates
  }, [plants]);

  const checkImages = async () => {
    setLoading(true);
    const results: ImageInfo[] = [];

    for (const id of imageIds) {
      try {
        console.log('Checking image:', id);
        const data = await getImage(id);
        results.push({
          id,
          exists: !!data,
          data: data ? `${data.substring(0, 50)}...` : undefined,
          error: data ? undefined : 'Image not found in storage'
        });
      } catch (error) {
        results.push({
          id,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    setImageInfo(results);
    setLoading(false);
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('plant-app-images');
      localStorage.removeItem('plant-app-image-metadata');
      alert('Image storage cleared! Please refresh the page.');
    }
  };

  const checkStorageStatus = () => {
    if (typeof window === 'undefined') {
      alert('Window not available (SSR)');
      return;
    }

    if (!window.localStorage) {
      alert('localStorage not available');
      return;
    }

    const imagesData = localStorage.getItem('plant-app-images');
    const metadataData = localStorage.getItem('plant-app-image-metadata');

    let imageCount = 0;
    let totalSize = 0;

    if (imagesData) {
      try {
        const parsed = JSON.parse(imagesData);
        imageCount = Object.keys(parsed).length;
        totalSize = imagesData.length;
      } catch (e) {
        alert('Error parsing images data: ' + e);
        return;
      }
    }

    alert(`Storage Status:
- Images stored: ${imageCount}
- Data size: ${(totalSize / 1024).toFixed(2)} KB
- Metadata exists: ${!!metadataData}
- Storage available: Yes`);
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Image System Diagnostic</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Found {imageIds.length} image IDs in your plants
          </p>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={checkImages}
              disabled={loading}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Images'}
            </button>
            
            <button
              onClick={checkStorageStatus}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Storage Status
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Clear Storage
            </button>
          </div>
        </div>

        {imageInfo.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Image Check Results:</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {imageInfo.map((info, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    info.exists 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  }`}
                >
                  <div className="font-mono text-xs mb-1">ID: {info.id}</div>
                  <div>Status: {info.exists ? '✅ Found' : '❌ Missing'}</div>
                  {info.error && <div>Error: {info.error}</div>}
                  {info.data && <div>Data: {info.data}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p><strong>Troubleshooting Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>If images show as &quot;Missing&quot;, try clearing storage and re-adding them</li>
            <li>If storage status shows errors, there may be corrupted data</li>
            <li>Check browser console for additional error messages</li>
            <li>Try refreshing the page after clearing storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 