'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlants } from '@/lib/plant-store';
import { isSupabaseConfigured } from '@/utils/supabase';

export function PlantSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { syncWithDatabase, plants } = usePlants();
  const [hasInitialSynced, setHasInitialSynced] = useState(false);

  // Only sync once when user is authenticated and we haven't synced yet
  useEffect(() => {
    // Don't sync if:
    // - Still loading auth
    // - No user logged in
    // - Already synced
    // - Supabase not configured
    if (authLoading || !user || hasInitialSynced || !isSupabaseConfigured()) {
      return;
    }

    console.log('User authenticated, performing initial sync with database...');
    syncWithDatabase()
      .then(() => {
        setHasInitialSynced(true);
        console.log('Initial sync completed successfully');
      })
      .catch(err => {
        console.warn('Plant sync failed:', err);
        // Don't prevent further syncs if this one failed
      });
  }, [user, authLoading, syncWithDatabase, hasInitialSynced]);

  // Reset sync status when user changes
  useEffect(() => {
    if (!user) {
      setHasInitialSynced(false);
    }
  }, [user]);

  return <>{children}</>;
} 