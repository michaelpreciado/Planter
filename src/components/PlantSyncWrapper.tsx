'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlants } from '@/lib/plant-store';

export function PlantSyncWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { syncWithDatabase } = usePlants();

  // Sync with database when user logs in and auth is ready
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated, syncing plants with database...');
      syncWithDatabase().catch(err => {
        console.warn('Plant sync failed:', err);
      });
    }
  }, [user, authLoading, syncWithDatabase]);

  return <>{children}</>;
} 