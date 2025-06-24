'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlantStore } from '@/lib/plant-store';
import { isSupabaseConfigured } from '@/utils/supabase';
import { getStorageStats, cleanupImages } from '@/utils/imageStorage';

interface DebugInfo {
  supabaseConfigured: boolean;
  userAuthenticated: boolean;
  plantsCount: number;
  storageStats: any;
  errors: string[];
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { plants, clearError, error } = usePlantStore();

  const collectDebugInfo = async () => {
    setIsLoading(true);
    try {
      const storageStats = await getStorageStats();
      const errors: string[] = [];
      
      // Check for common issues
      if (!isSupabaseConfigured()) {
        errors.push('Supabase not configured - app running in offline mode');
      }
      
      if (!user && isSupabaseConfigured()) {
        errors.push('User not authenticated but Supabase is configured');
      }
      
      if (error) {
        errors.push(`Plant store error: ${error}`);
      }

      setDebugInfo({
        supabaseConfigured: isSupabaseConfigured(),
        userAuthenticated: !!user,
        plantsCount: plants.length,
        storageStats,
        errors,
      });
    } catch (err) {
      console.error('Failed to collect debug info:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllErrors = () => {
    clearError();
    // Clear console errors (if possible)
    if (typeof console.clear === 'function') {
      console.clear();
    }
    // Refresh debug info
    collectDebugInfo();
  };

  const clearStorage = async () => {
    try {
      await cleanupImages();
      localStorage.clear();
      sessionStorage.clear();
      alert('Storage cleared! Please refresh the page.');
    } catch (err) {
      console.error('Failed to clear storage:', err);
      alert('Failed to clear storage completely');
    }
  };

  const enableOfflineMode = () => {
    localStorage.setItem('FORCE_OFFLINE_MODE', 'true');
    alert('Offline mode enabled! Please refresh the page.');
  };

  const disableOfflineMode = () => {
    localStorage.removeItem('FORCE_OFFLINE_MODE');
    alert('Offline mode disabled! Please refresh the page.');
  };

  useEffect(() => {
    if (isOpen) {
      collectDebugInfo();
    }
  }, [isOpen, collectDebugInfo]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-4 bg-purple-500 text-white p-2 rounded-full shadow-lg z-50 hover:bg-purple-600 text-xs"
        title="Debug Panel"
      >
        🐛
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-purple-100 px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Debug Panel</h2>
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
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={collectDebugInfo}
              disabled={isLoading}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh Info'}
            </button>
            
            <button
              onClick={clearAllErrors}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Clear Errors
            </button>
            
            <button
              onClick={clearStorage}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
            >
              Clear Storage
            </button>
            
            <button
              onClick={enableOfflineMode}
              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
            >
              Force Offline
            </button>
            
            <button
              onClick={disableOfflineMode}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
            >
              Disable Offline
            </button>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="space-y-4">
              {/* System Status */}
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold mb-2">System Status</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Supabase:</span>
                    <span className={`ml-2 ${debugInfo.supabaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.supabaseConfigured ? '✅ Configured' : '❌ Not configured'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">User:</span>
                    <span className={`ml-2 ${debugInfo.userAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.userAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Plants:</span>
                    <span className="ml-2">{debugInfo.plantsCount} plants loaded</span>
                  </div>
                  <div>
                    <span className="font-medium">Images:</span>
                    <span className="ml-2">
                      {debugInfo.storageStats.totalImages} stored ({debugInfo.storageStats.cloudSynced} synced)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Storage:</span>
                    <span className="ml-2">{debugInfo.storageStats.storageType}</span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {debugInfo.errors.length > 0 && (
                <div className="bg-red-50 p-3 rounded">
                  <h3 className="font-semibold mb-2 text-red-800">Current Issues</h3>
                  <ul className="text-sm space-y-1 text-red-700">
                    {debugInfo.errors.map((err, index) => (
                      <li key={index}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* No errors */}
              {debugInfo.errors.length === 0 && (
                <div className="bg-green-50 p-3 rounded">
                  <h3 className="font-semibold mb-2 text-green-800">Status</h3>
                  <p className="text-sm text-green-700">✅ No issues detected</p>
                </div>
              )}

              {/* Environment Info */}
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold mb-2">Environment</h3>
                <div className="text-xs font-mono space-y-1">
                  <div>NODE_ENV: {process.env.NODE_ENV}</div>
                  <div>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</div>
                  <div>SUPABASE_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</div>
                  <div>OFFLINE_MODE: {process.env.NEXT_PUBLIC_OFFLINE_MODE || 'false'}</div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 p-3 rounded">
                <h3 className="font-semibold mb-2 text-blue-800">Troubleshooting Tips</h3>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• If Supabase errors persist, try enabling &ldquo;Force Offline&rdquo; mode</li>
                  <li>• Clear storage if you see corrupted data issues</li>
                  <li>• Check browser console for additional error details</li>
                  <li>• Image sync errors are usually safe to ignore in development</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 