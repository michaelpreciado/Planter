'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePlants } from '@/lib/plant-store';
import { useAuth } from '@/contexts/AuthContext';
import { setupImageStorage, checkStoragePermissions } from '@/utils/setupStorage';
import { syncImagesToCloud, getStorageStats } from '@/utils/imageStorage';
import { isSupabaseConfigured } from '@/utils/supabase';
import { isOfflineMode, toggleOfflineMode } from '@/utils/offlineMode';
import { FadeIn, SlideUp } from '@/components/AnimationReplacements';

export default function SettingsPage() {
  const [isClientReady, setIsClientReady] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [wateringReminders, setWateringReminders] = useState(true);
  const [dailyCheckIns, setDailyCheckIns] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const { hasHydrated, loading, plants } = usePlants();
  const { user } = useAuth();

  // Simple client-side ready state
  useEffect(() => {
    setIsClientReady(true);
    setOfflineMode(isOfflineMode());
    loadStorageStats();
    
    // Load settings from localStorage
    const savedWateringReminders = localStorage.getItem('wateringReminders');
    const savedDailyCheckIns = localStorage.getItem('dailyCheckIns');
    const savedAnimations = localStorage.getItem('animationsEnabled');
    
    if (savedWateringReminders !== null) {
      setWateringReminders(JSON.parse(savedWateringReminders));
    }
    if (savedDailyCheckIns !== null) {
      setDailyCheckIns(JSON.parse(savedDailyCheckIns));
    }
    if (savedAnimations !== null) {
      setAnimationsEnabled(JSON.parse(savedAnimations));
    }
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

  const handleOfflineModeToggle = () => {
    const newValue = toggleOfflineMode();
    setOfflineMode(newValue);
    
    if (newValue) {
      setSyncStatus('Offline mode enabled. App will work without internet connection.');
    } else {
      setSyncStatus('Offline mode disabled. App will use online features when available.');
    }
    
    // Suggest page refresh for mode change to take effect
    setTimeout(() => {
      if (confirm('Page refresh recommended for mode change to take full effect. Refresh now?')) {
        window.location.reload();
      }
    }, 1000);
  };

  const handleWateringRemindersToggle = () => {
    const newValue = !wateringReminders;
    setWateringReminders(newValue);
    localStorage.setItem('wateringReminders', JSON.stringify(newValue));
    
    if (newValue) {
      setSyncStatus('Watering reminders enabled. You\'ll get notified when plants need water.');
    } else {
      setSyncStatus('Watering reminders disabled.');
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleDailyCheckInsToggle = () => {
    const newValue = !dailyCheckIns;
    setDailyCheckIns(newValue);
    localStorage.setItem('dailyCheckIns', JSON.stringify(newValue));
    
    if (newValue) {
      setSyncStatus('Daily check-in reminders enabled.');
    } else {
      setSyncStatus('Daily check-in reminders disabled.');
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSyncStatus(''), 3000);
  };

  const handleAnimationsToggle = () => {
    const newValue = !animationsEnabled;
    setAnimationsEnabled(newValue);
    localStorage.setItem('animationsEnabled', JSON.stringify(newValue));
    
    if (newValue) {
      setSyncStatus('Animations enabled.');
    } else {
      setSyncStatus('Animations disabled. Page refresh recommended.');
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSyncStatus(''), 3000);
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
    <div className="min-h-screen bg-background flex flex-col ios-safe-layout mobile-content">
      {/* Header */}
      <FadeIn delay={0.1} className="flex-shrink-0 flex justify-between items-center pt-safe px-4 sm:px-6 py-3">
        <Link 
          href="/" 
          className="text-foreground/70 hover:text-foreground transition-colors p-2 -m-2 rounded-lg hover:bg-card/30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <div></div>
      </FadeIn>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 py-4 pb-nav-safe space-y-4 overflow-y-auto">
        {/* Stats Section */}
        <SlideUp delay={0.2}>
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-border/40 shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Your Garden Stats
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-card/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">{stats.totalPlants}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Plants</div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-emerald-500">{stats.healthyPlants}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Healthy</div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-amber-500">{stats.plantsNeedingWater}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Need Water</div>
              </div>
            </div>
          </div>
        </SlideUp>

        {/* Plant Care Settings */}
        <SlideUp delay={0.3}>
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-border/40 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">🌱</span>
              Plant Care
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Watering Reminders</div>
                  <div className="text-sm text-muted-foreground">Get notified when plants need water</div>
                </div>
                <button
                  onClick={handleWateringRemindersToggle}
                  className={`w-12 h-6 rounded-full relative transition-all duration-200 ${
                    wateringReminders ? 'bg-emerald-500 shadow-emerald-200' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${
                    wateringReminders ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Daily Check-ins</div>
                  <div className="text-sm text-muted-foreground">Reminder to check your plants</div>
                </div>
                <button
                  onClick={handleDailyCheckInsToggle}
                  className={`w-12 h-6 rounded-full relative transition-all duration-200 ${
                    dailyCheckIns ? 'bg-blue-500 shadow-blue-200' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${
                    dailyCheckIns ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>
        </SlideUp>

        {/* App Preferences */}
        <SlideUp delay={0.4}>
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-border/40 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              App Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Offline Mode</div>
                  <div className="text-sm text-muted-foreground">Test app with dummy data (admin@planter.test)</div>
                </div>
                <button
                  onClick={handleOfflineModeToggle}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    offlineMode ? 'bg-orange-500' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${
                    offlineMode ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Dark Mode</div>
                  <div className="text-sm text-muted-foreground">Always enabled for the best experience</div>
                </div>
                <div className="text-2xl">🌙</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">Animations</div>
                  <div className="text-sm text-muted-foreground">Enable app animations</div>
                </div>
                <button
                  onClick={handleAnimationsToggle}
                  className={`w-12 h-6 rounded-full relative transition-all duration-200 ${
                    animationsEnabled ? 'bg-purple-500 shadow-purple-200' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${
                    animationsEnabled ? 'right-0.5' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>
        </SlideUp>

        {/* Image Sync Section */}
        <SlideUp delay={0.5}>
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-border/40 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">☁️</span>
              Image Sync
            </h3>
            {!isSupabaseConfigured() ? (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-amber-800">Cloud sync not configured</span>
                </div>
                <p className="text-amber-700 text-sm">
                  Images are only stored locally on this device. Configure Supabase to sync images across devices.
                </p>
              </div>
            ) : !user ? (
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-blue-800">Sign in required</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Sign in to enable image syncing across your devices.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Storage Stats */}
                {storageStats && (
                  <div className="bg-card/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-3">Storage Status</div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center p-2 bg-card/50 rounded">
                        <div className="font-semibold text-foreground">{storageStats.totalImages}</div>
                        <div className="text-muted-foreground">Total Images</div>
                      </div>
                      <div className="text-center p-2 bg-card/50 rounded">
                        <div className="font-semibold text-emerald-500">{storageStats.cloudSynced || 0}</div>
                        <div className="text-muted-foreground">Cloud Synced</div>
                      </div>
                      <div className="text-center p-2 bg-card/50 rounded">
                        <div className="font-semibold text-blue-500">{storageStats.storageType}</div>
                        <div className="text-muted-foreground">Storage Type</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSetupStorage}
                    disabled={isSettingUp}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="text-sm text-muted-foreground bg-card/50 border border-border/50 rounded-lg p-3">
                    {syncStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </SlideUp>

        {/* About Section */}
        <SlideUp delay={0.6}>
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-border/40 shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              About
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <span className="text-foreground font-medium">Version</span>
                <span className="text-muted-foreground">2.0.0</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                <span className="text-foreground font-medium">Made with</span>
                <span className="text-muted-foreground">💚 Next.js & Tailwind</span>
              </div>
            </div>
          </div>
        </SlideUp>

        {/* Quick Actions */}
        <SlideUp delay={0.7}>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/add-plant"
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl text-center font-medium transition-colors shadow-lg"
            >
              <div className="text-2xl mb-2">🌱</div>
              Add Plant
            </Link>
            <Link
              href="/list"
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl text-center font-medium transition-colors shadow-lg"
            >
              <div className="text-2xl mb-2">📋</div>
              View List
            </Link>
          </div>
        </SlideUp>
      </div>
    </div>
  );
} 