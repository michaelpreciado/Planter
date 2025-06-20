'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlants } from '@/lib/plant-store';
import { isSupabaseConfigured } from '@/utils/supabase';

export function PlantSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { syncWithDatabase } = usePlants();
  const [hasInitialSynced, setHasInitialSynced] = useState(false);

  // Only sync once when user is authenticated, but don't block the UI
  useEffect(() => {
    // Don't sync if still loading auth or already synced
    if (authLoading || hasInitialSynced) {
      return;
    }

    // If user is authenticated and Supabase is configured, sync in background
    if (user && isSupabaseConfigured()) {
      // Use setTimeout to make sync non-blocking
      const syncTimer = setTimeout(() => {
        syncWithDatabase()
          .then(() => {
            setHasInitialSynced(true);
          })
          .catch(() => {
            // Silently fail - app should work without sync
            setHasInitialSynced(true);
          });
      }, 100); // Small delay to ensure UI renders first

      return () => clearTimeout(syncTimer);
    } else {
      // No auth or no Supabase - mark as synced so app continues
      setHasInitialSynced(true);
    }
  }, [user, authLoading, syncWithDatabase, hasInitialSynced]);

  // Reset sync status when user changes
  useEffect(() => {
    if (!user) {
      setHasInitialSynced(false);
    }
  }, [user]);

  // Always render children immediately - don't wait for sync
  return <>{children}</>;
} 