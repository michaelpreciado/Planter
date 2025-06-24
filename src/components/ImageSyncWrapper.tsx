'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/utils/supabase';
import { syncImagesToCloud } from '@/utils/imageStorage';

export function ImageSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [hasInitialSynced, setHasInitialSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState<{ uploaded: number; errors: number } | null>(null);

  // Enhanced sync function with retry logic
  const performImageSync = useCallback(async (forceSync = false) => {
    // Don't sync if still loading auth or user not authenticated
    if (authLoading || !user || !isSupabaseConfigured()) {
      return;
    }

    // Avoid excessive syncing (unless forced)
    if (!forceSync && lastSyncTime && Date.now() - lastSyncTime.getTime() < 60000) {
      return;
    }

    try {
      console.log('🔄 Starting image sync...');
      const stats = await syncImagesToCloud();
      setSyncStats(stats);
      setLastSyncTime(new Date());
      setHasInitialSynced(true);
      
      if (stats.uploaded > 0) {
        console.log(`✅ Image sync completed: ${stats.uploaded} images uploaded`);
      }
      if (stats.errors > 0) {
        console.warn(`⚠️ Image sync had ${stats.errors} errors`);
      }
    } catch (error) {
      console.warn('Image sync failed:', error);
      // Don't block the app if sync fails
      setHasInitialSynced(true);
    }
  }, [user, authLoading, lastSyncTime]);

  // Initial sync when user authenticates
  useEffect(() => {
    if (!hasInitialSynced && user && isSupabaseConfigured()) {
      // Use setTimeout to make sync non-blocking
      const syncTimer = setTimeout(() => {
        performImageSync(true);
      }, 2000); // Wait 2 seconds to let other syncs complete first

      return () => clearTimeout(syncTimer);
    } else if (!user) {
      // Reset sync status when user logs out
      setHasInitialSynced(false);
      setLastSyncTime(null);
      setSyncStats(null);
    }
  }, [user, hasInitialSynced, performImageSync]);

  // Sync when user returns to the app (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isSupabaseConfigured()) {
        // Sync when app becomes visible again
        performImageSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, performImageSync]);

  // Sync when window gains focus (user switches back to tab/app)
  useEffect(() => {
    const handleFocus = () => {
      if (user && isSupabaseConfigured()) {
        performImageSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, performImageSync]);

  // Periodic sync every 10 minutes when app is active
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    const periodicSync = setInterval(() => {
      if (!document.hidden) {
        performImageSync();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(periodicSync);
  }, [user, performImageSync]);

  // Always render children immediately - don't wait for sync
  return <>{children}</>;
} 