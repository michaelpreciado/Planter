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
  const [isSyncing, setIsSyncing] = useState(false);

  // Enhanced sync function with retry logic
  const performImageSync = useCallback(async (forceSync = false) => {
    // Don't sync if still loading auth, user not authenticated, or already syncing
    if (authLoading || !user || !isSupabaseConfigured() || isSyncing) {
      return;
    }

    // Avoid excessive syncing (unless forced)
    if (!forceSync && lastSyncTime && Date.now() - lastSyncTime.getTime() < 60000) {
      return;
    }

    setIsSyncing(true);

    try {
      const stats = await syncImagesToCloud();
      setSyncStats(stats);
      setLastSyncTime(new Date());
      setHasInitialSynced(true);
    } catch (error) {
      // Image sync failed - don't block the app
      setHasInitialSynced(true);
    } finally {
      setIsSyncing(false);
    }
  }, [user, authLoading, lastSyncTime, isSyncing]);

  // Initial sync when user authenticates - but only if configured
  useEffect(() => {
    if (!hasInitialSynced && user && isSupabaseConfigured() && !isSyncing) {
      // Use setTimeout to make sync non-blocking and avoid race conditions
      const syncTimer = setTimeout(() => {
        performImageSync(true);
      }, 3000); // Wait 3 seconds to let other syncs complete first

      return () => clearTimeout(syncTimer);
    } else if (!user || !isSupabaseConfigured()) {
      // Reset sync status when user logs out or configuration changes
      setHasInitialSynced(false);
      setLastSyncTime(null);
      setSyncStats(null);
      setIsSyncing(false);
    }
  }, [user, hasInitialSynced, performImageSync, isSyncing]);

  // Sync when user returns to the app (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isSupabaseConfigured() && !isSyncing) {
        // Small delay to avoid conflicts
        setTimeout(() => {
          performImageSync();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, performImageSync, isSyncing]);

  // Sync when window gains focus (user switches back to tab/app)
  useEffect(() => {
    const handleFocus = () => {
      if (user && isSupabaseConfigured() && !isSyncing) {
        // Small delay to avoid conflicts
        setTimeout(() => {
          performImageSync();
        }, 1000);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, performImageSync, isSyncing]);

  // Periodic sync every 15 minutes when app is active (reduced frequency)
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    const periodicSync = setInterval(() => {
      if (!document.hidden && !isSyncing) {
        performImageSync();
      }
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(periodicSync);
  }, [user, performImageSync, isSyncing]);

  // Always render children immediately - don't wait for sync
  return <>{children}</>;
} 