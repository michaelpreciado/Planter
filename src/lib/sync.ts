'use client';

import { authedFetch } from './deviceClient';
import type { Plant } from './schemas';

const SYNC_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_MS = 2000; // 2 seconds

let syncTimeout: NodeJS.Timeout | null = null;
let lastSyncAt = 0;
let isSyncing = false;

// Get last sync timestamp from localStorage
function getLastSyncAt(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem('planter.lastSyncAt');
  return stored ? parseInt(stored, 10) : 0;
}

// Save last sync timestamp
function setLastSyncAt(timestamp: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('planter.lastSyncAt', timestamp.toString());
}

// Check if sync is enabled
function isSyncEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('planter.syncEnabled') === 'true';
}

// Enable/disable sync
export function setSyncEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('planter.syncEnabled', enabled ? 'true' : 'false');
  
  if (enabled) {
    startSyncInterval();
  } else {
    stopSyncInterval();
  }
}

// Pull remote plants
export async function pullRemote(): Promise<Plant[]> {
  if (!isSyncEnabled()) return [];
  
  try {
    const response = await authedFetch('/api/plants', {
      method: 'GET',
    });
    
    if (!response.ok) {
      console.error('Failed to pull remote plants:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.plants || [];
  } catch (error) {
    console.error('Error pulling remote plants:', error);
    return [];
  }
}

// Push local plants to remote
export async function pushLocal(localPlants: Plant[]): Promise<boolean> {
  if (!isSyncEnabled()) return false;
  
  try {
    const plantsToSync = localPlants.filter(
      plant => new Date(plant.updatedAt).getTime() > lastSyncAt
    );
    
    if (plantsToSync.length === 0) return true;
    
    const response = await authedFetch('/api/plants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plants: plantsToSync }),
    });
    
    if (!response.ok) {
      console.error('Failed to push local plants:', response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error pushing local plants:', error);
    return false;
  }
}

// Full sync - pull then push
export async function syncNow(localPlants: Plant[]): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;
  
  try {
    // Pull remote first
    const remotePlants = await pullRemote();
    
    // Merge with local (last-write-wins)
    // In a full implementation, we'd merge properly
    
    // Push local changes
    const pushSuccess = await pushLocal(localPlants);
    
    if (pushSuccess) {
      lastSyncAt = Date.now();
      setLastSyncAt(lastSyncAt);
    }
    
    return pushSuccess;
  } finally {
    isSyncing = false;
  }
}

// Debounced sync trigger
export function triggerSync(localPlants: Plant[]): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(() => {
    syncNow(localPlants);
  }, DEBOUNCE_MS);
}

// Start periodic sync
let syncInterval: NodeJS.Timeout | null = null;

export function startSyncInterval(): void {
  if (typeof window === 'undefined') return;
  if (syncInterval) return;
  
  lastSyncAt = getLastSyncAt();
  
  // Initial sync
  syncNow([]);
  
  // Periodic sync
  syncInterval = setInterval(() => {
    syncNow([]);
  }, SYNC_INTERVAL);
  
  // Sync on visibility change
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    syncNow([]);
  }
}

export function stopSyncInterval(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  if (typeof window !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
}

// Get sync status
export function getSyncStatus(): { enabled: boolean; lastSync: number } {
  return {
    enabled: isSyncEnabled(),
    lastSync: getLastSyncAt(),
  };
}
