'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlants } from '@/lib/plant-store';
import { isSupabaseConfigured } from '@/utils/supabase';

export function PlantSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { syncWithDatabase } = usePlants();
  const [hasInitialSynced, setHasInitialSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Enhanced sync function with retry logic and better deduplication
  const performSync = useCallback(async (forceSync = false) => {
    // Don't sync if still loading auth or user not authenticated
    if (authLoading || !user || !isSupabaseConfigured()) {
      return;
    }

    // Avoid excessive syncing (unless forced) - increased to 2 minutes
    if (!forceSync && lastSyncTime && Date.now() - lastSyncTime.getTime() < 120000) {
      return;
    }

    try {
      await syncWithDatabase();
      setLastSyncTime(new Date());
      setHasInitialSynced(true);
    } catch (error) {
      console.warn('Sync failed:', error);
      // Don't block the app if sync fails
      setHasInitialSynced(true);
    }
  }, [user, authLoading, syncWithDatabase, lastSyncTime]);

  // Initial sync when user authenticates
  useEffect(() => {
    if (!hasInitialSynced && user && isSupabaseConfigured()) {
      // Use setTimeout to make sync non-blocking
      const syncTimer = setTimeout(() => {
        performSync(true);
      }, 100);

      return () => clearTimeout(syncTimer);
    } else if (!user) {
      // Reset sync status when user logs out
      setHasInitialSynced(false);
      setLastSyncTime(null);
    }
  }, [user, hasInitialSynced, performSync]);

  // Sync when user returns to the app (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isSupabaseConfigured()) {
        // Sync when app becomes visible again
        performSync();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, performSync]);

  // Sync when window gains focus (user switches back to tab/app)
  useEffect(() => {
    const handleFocus = () => {
      if (user && isSupabaseConfigured()) {
        performSync();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, performSync]);

  // Periodic sync every 5 minutes when app is active
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    const periodicSync = setInterval(() => {
      if (!document.hidden) {
        performSync();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(periodicSync);
  }, [user, performSync]);

  // Always render children immediately - don't wait for sync
  return <>{children}</>;
} 