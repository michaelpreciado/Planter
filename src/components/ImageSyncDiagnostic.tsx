'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlants } from '@/lib/plant-store';
import { getStorageStats, getImage } from '@/utils/imageStorage';
import { isSupabaseConfigured, supabase } from '@/utils/supabase';

interface ImageDiagnosticInfo {
  id: string;
  exists: boolean;
  localData?: string;
  cloudUrl?: string;
  error?: string;
  isCloudSynced?: boolean;
}

export function ImageSyncDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<{
    storageStats: any;
    supabaseConfig: boolean;
    userAuthenticated: boolean;
    imageResults: ImageDiagnosticInfo[];
    bucketExists: boolean;
    bucketError?: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { user } = useAuth();
  const { plants } = usePlants();

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticData(null);

    try {
      console.log('🔍 Starting image sync diagnostic...');

      // Check Supabase configuration
      const supabaseConfigured = isSupabaseConfigured();
      console.log('🔍 Supabase configured:', supabaseConfigured);

      // Check user authentication
      const userAuth = !!user;
      console.log('🔍 User authenticated:', userAuth);

      // Get storage stats
      const storageStats = await getStorageStats();
      console.log('🔍 Storage stats:', storageStats);

      // Check bucket existence
      let bucketExists = false;
      let bucketError = undefined;
      if (supabaseConfigured && userAuth) {
        try {
          const { data: buckets, error } = await supabase.storage.listBuckets();
          if (error) {
            bucketError = error.message;
          } else {
            bucketExists = buckets?.some(bucket => bucket.name === 'plant-images') || false;
          }
        } catch (error) {
          bucketError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // Collect all image IDs from plants
      const imageIds: string[] = [];
      plants.forEach(plant => {
        if (plant.imageUrl) {
          imageIds.push(plant.imageUrl);
        }
        if (plant.noteAttachments) {
          plant.noteAttachments.forEach(id => imageIds.push(id));
        }
      });

      console.log('🔍 Found image IDs:', imageIds);

      // Test each image
      const imageResults: ImageDiagnosticInfo[] = [];
      for (const imageId of imageIds) {
        try {
          console.log('🔍 Testing image:', imageId);
          const imageData = await getImage(imageId);
          
          imageResults.push({
            id: imageId,
            exists: !!imageData,
            localData: imageData ? `${imageData.substring(0, 50)}...` : undefined,
            error: imageData ? undefined : 'Image not found'
          });
        } catch (error) {
          imageResults.push({
            id: imageId,
            exists: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      setDiagnosticData({
        storageStats,
        supabaseConfig: supabaseConfigured,
        userAuthenticated: userAuth,
        imageResults,
        bucketExists,
        bucketError
      });

      console.log('✅ Diagnostic completed');
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-50 hover:bg-red-600"
        title="Open Image Diagnostic"
      >
        🔍
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Image Sync Diagnostic</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="mb-4">
            <button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isRunning ? 'Running Diagnostic...' : 'Run Diagnostic'}
            </button>
          </div>

          {/* Results */}
          {diagnosticData && (
            <div className="space-y-4">
              {/* System Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">System Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Supabase Configured:</span>
                    <span className={`ml-2 ${diagnosticData.supabaseConfig ? 'text-green-600' : 'text-red-600'}`}>
                      {diagnosticData.supabaseConfig ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">User Authenticated:</span>
                    <span className={`ml-2 ${diagnosticData.userAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                      {diagnosticData.userAuthenticated ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Bucket Exists:</span>
                    <span className={`ml-2 ${diagnosticData.bucketExists ? 'text-green-600' : 'text-red-600'}`}>
                      {diagnosticData.bucketExists ? '✅ Yes' : '❌ No'}
                    </span>
                    {diagnosticData.bucketError && (
                      <div className="text-red-600 text-xs mt-1">{diagnosticData.bucketError}</div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Storage Type:</span>
                    <span className="ml-2">{diagnosticData.storageStats.storageType}</span>
                  </div>
                </div>
              </div>

              {/* Storage Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Storage Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Images</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {diagnosticData.storageStats.totalImages}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Cloud Synced</div>
                    <div className="text-2xl font-bold text-green-600">
                      {diagnosticData.storageStats.cloudSynced || 0}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Total Size</div>
                    <div className="text-sm text-gray-600">
                      {Math.round(diagnosticData.storageStats.totalSize / 1024)} KB
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Results */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Image Test Results</h3>
                {diagnosticData.imageResults.length === 0 ? (
                  <p className="text-gray-600 text-sm">No images found in plants</p>
                ) : (
                  <div className="space-y-2">
                    {diagnosticData.imageResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${
                          result.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-xs text-gray-600 mb-1">
                              {result.id}
                            </div>
                            <div className={`text-sm font-medium ${
                              result.exists ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {result.exists ? '✅ Found' : '❌ Not Found'}
                            </div>
                            {result.error && (
                              <div className="text-red-600 text-xs mt-1">{result.error}</div>
                            )}
                            {result.localData && (
                              <div className="text-gray-600 text-xs mt-1 font-mono">
                                Data: {result.localData}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 