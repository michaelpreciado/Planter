'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';
import { useAuth } from '@/contexts/AuthContext';
import { setupImageStorage, checkStoragePermissions } from '@/utils/setupStorage';
import { syncImagesToCloud, getStorageStats } from '@/utils/imageStorage';
import { isSupabaseConfigured } from '@/utils/supabase';

export default function SettingsPage() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { hasHydrated, loading, plants } = usePlants();
  const { user } = useAuth();

  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const handleSetupStorage = async () => {
    if (!user) {
      setSyncStatus('Please sign in to enable image sync');
      return;
    }

    setIsSettingUp(true);
    try {
      const result = await setupImageStorage();
      setSyncStatus(result.message);
      if (result.success) {
        await loadStorageStats();
      }
    } catch (error) {
      setSyncStatus('Failed to set up image sync');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSyncImages = async () => {
    if (!user) {
      setSyncStatus('Please sign in to sync images');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncImagesToCloud();
      setSyncStatus(`Sync completed: ${result.uploaded} images uploaded, ${result.errors} errors`);
      await loadStorageStats();
    } catch (error) {
      setSyncStatus('Image sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = {
    totalPlants: plants.length,
    healthyPlants: plants.filter(p => p.status === 'healthy').length,
    plantsNeedingWater: plants.filter(p => p.status === 'needs_water' || p.status === 'overdue').length,
  };

  // Show simple loading only on initial hydration
  if (!isClientReady || (!hasHydrated && loading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="top-header-fixed bg-white shadow-sm flex items-center justify-between px-6 py-4 pt-safe"
        style={{ 
          // Additional inline styles to ensure it stays fixed
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          zIndex: '9998',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <Link href="/" className="text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <div className="w-6"></div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 px-6 py-6 pb-nav-safe content-with-header">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Garden Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalPlants}</div>
              <div className="text-sm text-gray-600">Total Plants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.healthyPlants}</div>
              <div className="text-sm text-gray-600">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.plantsNeedingWater}</div>
              <div className="text-sm text-gray-600">Need Water</div>
            </div>
          </div>
        </motion.div>

        {/* Settings Options */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Plant Care</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Watering Reminders</div>
                    <div className="text-sm text-gray-600">Get notified when plants need water</div>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Daily Check-ins</div>
                    <div className="text-sm text-gray-600">Reminder to check your plants</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">App Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Dark Mode</div>
                    <div className="text-sm text-gray-600">Switch to dark theme</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Animations</div>
                    <div className="text-sm text-gray-600">Enable app animations</div>
                  </div>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Sync Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Image Sync</h3>
              {!isSupabaseConfigured() ? (
                <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-yellow-800">Cloud sync not configured</span>
                  </div>
                  <p className="text-yellow-700">
                    Images are only stored locally on this device. Configure Supabase to sync images across devices.
                  </p>
                </div>
              ) : !user ? (
                <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-blue-800">Sign in required</span>
                  </div>
                  <p className="text-blue-700">
                    Sign in to enable image syncing across your devices.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Storage Stats */}
                  {storageStats && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-2">Storage Status</div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{storageStats.totalImages}</div>
                          <div className="text-gray-500">Total Images</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{storageStats.cloudSynced || 0}</div>
                          <div className="text-gray-500">Cloud Synced</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{storageStats.storageType}</div>
                          <div className="text-gray-500">Storage Type</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sync Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSetupStorage}
                      disabled={isSettingUp}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettingUp ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Setting up...
                        </div>
                      ) : (
                        'Setup Cloud Sync'
                      )}
                    </button>
                    
                    <button
                      onClick={handleSyncImages}
                      disabled={isSyncing}
                      className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Syncing...
                        </div>
                      ) : (
                        'Sync Now'
                      )}
                    </button>
                  </div>

                  {/* Status Message */}
                  {syncStatus && (
                    <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {syncStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">About</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Version</span>
                  <span className="text-gray-500">2.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Made with</span>
                  <span className="text-gray-500">💚 Next.js & Tailwind</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-4 mt-6"
          >
            <Link
              href="/add-plant"
              className="bg-green-500 text-white p-4 rounded-xl text-center font-medium hover:bg-green-600 transition-colors"
            >
              <div className="text-2xl mb-2">🌱</div>
              Add Plant
            </Link>
            <Link
              href="/list"
              className="bg-blue-500 text-white p-4 rounded-xl text-center font-medium hover:bg-blue-600 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              View List
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 