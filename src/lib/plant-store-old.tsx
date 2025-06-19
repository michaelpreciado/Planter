'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays } from 'date-fns';
import { plantService, isSupabaseConfigured } from '@/utils/supabase';
import { Plant as DBPlant } from '@/types';
import { storeImage, getImage, removeImage } from '@/utils/imageStorage';

export interface Plant {
  id: string;
  name: string;
  species: string;
  plantingDate: string;
  wateringFrequency: number;
  icon: string;
  iconColor: string;
  lastWatered?: string;
  nextWatering?: string;
  status: 'healthy' | 'needs_water' | 'overdue';
  notes?: string;
  noteAttachments?: string[]; // Array of image IDs for note attachments
  imageUrl?: string; // Image ID for plant photo
  createdAt: string;
  updatedAt: string;
}

interface PlantStore {
  plants: Plant[];
  recentlyWateredPlant: string | null;
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  // Local operations (for offline support)
  addPlant: (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  
  // Sync operations
  syncWithDatabase: () => Promise<void>;
  refreshPlants: () => Promise<void>;
  clearError: () => void;
  clearRecentlyWatered: () => void;
  clearPlants: () => void;
  getPlantById: (id: string) => Plant | undefined;
  getHealthyPlants: () => Plant[];
  getPlantsNeedingWater: () => Plant[];
  getPlantsWithRealTimeStatus: () => Plant[];
  refreshPlantStatuses: () => void;
  
  // Debug operations (for development)
  debugPlantStore: () => void;
  
  initializeSampleData: () => void;
  
  // Image operations
  storeImage: (imageData: string) => Promise<string>;
  getImage: (imageId: string) => Promise<string | null>;
  removeImage: (imageId: string) => Promise<void>;
}

const plantIcons = ['🌱', '🍃', '🌿', '🌺', '🌻', '🌹', '🌷', '🌵', '🍅', '🥕', '🌾', '🌸', '🌼', '🪴', '🌳'];
const plantColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const calculateNextWatering = (frequency: number, lastWatered?: string): string => {
  const today = new Date();
  
  // If no last watered date or just planted, calculate from today
  if (!lastWatered || lastWatered === 'Just planted') {
    const nextDate = addDays(today, frequency);
    
    if (frequency === 1) {
      return 'Tomorrow';
    } else if (frequency <= 7) {
      return `in ${frequency} days`;
    } else {
      return format(nextDate, 'MMM dd');
    }
  }
  
  // Calculate based on last watered date
  const lastWateredDate = new Date(lastWatered);
  const daysSinceWatered = Math.floor((today.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilNextWatering = frequency - daysSinceWatered;
  
  if (daysUntilNextWatering <= 0) {
    return daysSinceWatered > frequency + 2 ? 'Overdue' : 'Today';
  } else if (daysUntilNextWatering === 1) {
    return 'Tomorrow';
  } else if (daysUntilNextWatering <= 7) {
    return `in ${daysUntilNextWatering} days`;
  } else {
    const nextDate = addDays(lastWateredDate, frequency);
    return format(nextDate, 'MMM dd');
  }
};

const getPlantStatus = (lastWatered: string, frequency: number): Plant['status'] => {
  if (!lastWatered || lastWatered === 'Just planted') {
    return 'healthy';
  }
  
  const lastWateredDate = new Date(lastWatered);
  const daysSinceWatered = Math.floor((Date.now() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceWatered > frequency + 2) {
    return 'overdue';
  } else if (daysSinceWatered >= frequency) {
    return 'needs_water';
  }
  
  return 'healthy';
};

// Helper function to get real-time plant status and next watering
const getRealTimePlantInfo = (plant: Plant): { status: Plant['status'], nextWatering: string } => {
  const status = getPlantStatus(plant.lastWatered || '', plant.wateringFrequency);
  const nextWatering = calculateNextWatering(plant.wateringFrequency, plant.lastWatered);
  return { status, nextWatering };
};

// Convert database plant to local plant format
const dbPlantToLocal = (dbPlant: DBPlant): Plant => ({
  id: dbPlant.id,
  name: dbPlant.name,
  species: dbPlant.species || '',
  plantingDate: dbPlant.plantingDate || dbPlant.plantedDate || new Date().toISOString(),
  wateringFrequency: dbPlant.wateringFrequency,
  icon: dbPlant.icon || '🌱',
  iconColor: dbPlant.iconColor || '#10B981',
  lastWatered: dbPlant.lastWatered,
  nextWatering: typeof dbPlant.nextWatering === 'string' 
    ? dbPlant.nextWatering 
    : calculateNextWatering(dbPlant.wateringFrequency, dbPlant.lastWatered),
  status: dbPlant.status || 'healthy',
  notes: dbPlant.notes || '',
  noteAttachments: dbPlant.noteAttachments || [],
  imageUrl: dbPlant.imageUrl,
  createdAt: dbPlant.createdAt || new Date().toISOString(),
  updatedAt: dbPlant.updatedAt || new Date().toISOString(),
});

// Convert local plant to database format. The userId will be added by the
// service layer so it is omitted here.
const localPlantToDb = (localPlant: Plant): Omit<DBPlant, 'id' | 'createdAt' | 'updatedAt' | 'userId'> => ({
  name: localPlant.name,
  species: localPlant.species,
  plantedDate: localPlant.plantingDate,
  plantingDate: localPlant.plantingDate,
  wateringFrequency: localPlant.wateringFrequency,
  icon: localPlant.icon,
  iconColor: localPlant.iconColor,
  lastWatered: localPlant.lastWatered === 'Just planted' ? undefined : localPlant.lastWatered,
  // Ensure nextWatering is always a string, not a date calculation
  nextWatering: (() => {
    if (!localPlant.nextWatering || localPlant.lastWatered === 'Just planted') {
      return calculateNextWatering(localPlant.wateringFrequency, localPlant.lastWatered);
    }
    // If it's a user-friendly string, convert to a proper calculation
    if (['Tomorrow', 'Today', 'Overdue'].some(str => localPlant.nextWatering?.includes(str))) {
      return calculateNextWatering(localPlant.wateringFrequency, localPlant.lastWatered);
    }
    return localPlant.nextWatering;
  })(),
  status: localPlant.status,
  notes: localPlant.notes,
  noteAttachments: localPlant.noteAttachments,
  imageUrl: localPlant.imageUrl,
});
// Convert update data to database format
const localUpdateToDb = (updates: Partial<Plant>): any => {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.species !== undefined) dbUpdates.species = updates.species;
  if (updates.lastWatered !== undefined) dbUpdates.lastWatered = updates.lastWatered === "Just planted" ? undefined : updates.lastWatered;
  if (updates.nextWatering !== undefined) dbUpdates.nextWatering = updates.nextWatering;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.imageUrl !== undefined) dbUpdates.imageUrl = updates.imageUrl;
  return dbUpdates;
};


// Enhanced loading state management
let hydrationPromise: Promise<void> | null = null;
const ensureHydration = async (): Promise<void> => {
  if (hydrationPromise) return hydrationPromise;
  
  hydrationPromise = new Promise((resolve) => {
    // Ensure DOM is ready and store is hydrated
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    } else {
      resolve();
    }
  });
  
  return hydrationPromise;
};

// Sample plants for testing
const createSamplePlants = (): Plant[] => {
  const now = new Date().toISOString();
  const yesterday = subDays(new Date(), 1).toISOString();
  const threeDaysAgo = subDays(new Date(), 3).toISOString();
  const weekAgo = subDays(new Date(), 7).toISOString();

  return [
    {
      id: uuidv4(),
      name: 'Sunny the Sunflower',
      species: 'Helianthus annuus',
      plantingDate: subDays(new Date(), 30).toISOString(),
      wateringFrequency: 2,
      icon: '🌻',
      iconColor: '#F59E0B',
      lastWatered: yesterday,
      nextWatering: 'Tomorrow',
      status: 'healthy',
      notes: 'Growing beautifully! Loves the morning sun.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'Rosie',
      species: 'Rosa gallica',
      plantingDate: subDays(new Date(), 45).toISOString(),
      wateringFrequency: 3,
      icon: '🌹',
      iconColor: '#EC4899',
      lastWatered: threeDaysAgo,
      nextWatering: 'Today',
      status: 'needs_water',
      notes: 'Beautiful red blooms. Needs regular watering.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'Spike',
      species: 'Opuntia microdasys',
      plantingDate: subDays(new Date(), 60).toISOString(),
      wateringFrequency: 14,
      icon: '🌵',
      iconColor: '#10B981',
      lastWatered: weekAgo,
      nextWatering: 'in 7 days',
      status: 'healthy',
      notes: 'Low maintenance desert friend. Water sparingly.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'Basil Buddy',
      species: 'Ocimum basilicum',
      plantingDate: subDays(new Date(), 20).toISOString(),
      wateringFrequency: 1,
      icon: '🌿',
      iconColor: '#84CC16',
      lastWatered: subDays(new Date(), 5).toISOString(),
      nextWatering: 'Overdue',
      status: 'overdue',
      notes: 'Perfect for cooking! Needs daily water.',
      createdAt: now,
      updatedAt: now,
    }
  ];
};

export const usePlantStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      plants: [],
      recentlyWateredPlant: null,
      loading: false,
      error: null,
      hasHydrated: false,
      
      // Sync with database
      syncWithDatabase: async () => {
        // Don't sync if database is not configured
        if (!isSupabaseConfigured()) {
          console.log('Database not configured - staying in offline mode');
          return;
        }
        
        set({ loading: true, error: null });
        try {
          const dbPlants = await plantService.getPlants();
          const localPlants = dbPlants.map(dbPlantToLocal);
          
          // Merge with existing plants instead of replacing
          // Keep local plants that aren't in the database (offline-created)
          set((state) => {
            const existingLocalPlants = state.plants.filter(localPlant => 
              !localPlants.some(dbPlant => dbPlant.id === localPlant.id)
            );
            
            // Combine database plants with local-only plants
            const mergedPlants = [...localPlants, ...existingLocalPlants];
            
            console.log(`Synced ${localPlants.length} plants from database, keeping ${existingLocalPlants.length} local plants`);
            
            return {
              plants: mergedPlants,
              loading: false
            };
          });
        } catch (error) {
          console.error('Failed to sync with database:', error);
          // Don't clear local plants on sync failure
          set({ 
            error: error instanceof Error ? error.message : 'Sync failed', 
            loading: false 
          });
        }
      },

      addPlant: async (plantData) => {
        set({ loading: true, error: null });
        try {
          const newPlant: Plant = {
            ...plantData,
            id: uuidv4(),
            icon: plantIcons[Math.floor(Math.random() * plantIcons.length)],
            iconColor: plantColors[Math.floor(Math.random() * plantColors.length)],
            status: 'healthy',
            lastWatered: 'Just planted',
            nextWatering: calculateNextWatering(plantData.wateringFrequency, plantData.lastWatered),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Always save locally first to prevent data loss
          set((state) => ({
            plants: [...state.plants, newPlant],
            loading: false,
          }));

          // Associate images with the plant after it's created
          try {
            if (newPlant.imageUrl) {
              await updateImagePlantId(newPlant.imageUrl, newPlant.id);
            }
            if (newPlant.noteAttachments && newPlant.noteAttachments.length > 0) {
              for (const imageId of newPlant.noteAttachments) {
                await updateImagePlantId(imageId, newPlant.id);
              }
            }
          } catch (imageError) {
            console.warn('Failed to associate images with plant:', imageError);
          }

          // Then try to sync to database
          try {
            const dbPlant = await plantService.createPlant(localPlantToDb(newPlant));
            // Update with database ID and data if successful
            const finalPlant = dbPlantToLocal(dbPlant);
            set((state) => ({
              plants: state.plants.map(p => 
                p.id === newPlant.id ? finalPlant : p
              ),
            }));
            console.log('Plant successfully synced to database');
          } catch (dbError) {
            // Plant is already saved locally, just log the sync failure
            console.warn('Database add failed, plant saved locally:', dbError);
            
            // Check if it's a configuration error
            if (dbError instanceof Error && dbError.message.includes('Database not configured')) {
              console.info('💡 To enable cloud sync, set up your Supabase environment variables');
            }
          }
        } catch (error) {
          console.error('Error adding plant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add plant', 
            loading: false 
          });
        }
      },

      removePlant: async (id) => {
        set({ loading: true, error: null });
        try {
          // Clean up associated images first
          try {
            await removePlantImages(id);
          } catch (imageError) {
            console.warn('Failed to clean up plant images:', imageError);
          }

          // Remove from database
          try {
            await plantService.deletePlant(id);
          } catch (dbError) {
            console.warn('Database delete failed, removing locally:', dbError);
          }
          
        set((state) => ({
          plants: state.plants.filter((plant) => plant.id !== id),
            loading: false,
        }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to remove plant', loading: false });
        }
      },

      updatePlant: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const currentPlant = get().plants.find(p => p.id === id);
          if (!currentPlant) {
            throw new Error('Plant not found');
          }

          const updatedData = {
                  ...updates,
                  status: updates.lastWatered 
              ? getPlantStatus(updates.lastWatered, currentPlant.wateringFrequency)
              : (updates.status || currentPlant.status),
          };

          // Update in database first
          try {
            await plantService.updatePlant(id, localUpdateToDb(updatedData));
          } catch (dbError) {
            console.warn('Database update failed, updating locally:', dbError);
          }

          // Add updatedAt for local state only
          const localUpdatedData = {
            ...updatedData,
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            plants: state.plants.map((plant) =>
              plant.id === id ? { ...plant, ...localUpdatedData } : plant
          ),
            loading: false,
        }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update plant', loading: false });
        }
      },

      waterPlant: async (id) => {
        const now = new Date().toISOString();
        const plant = get().plants.find(p => p.id === id);
        
        if (plant) {
          await get().updatePlant(id, {
                    lastWatered: now,
                    status: 'healthy',
            nextWatering: calculateNextWatering(plant.wateringFrequency, now),
          });

          set({ recentlyWateredPlant: id });
          setTimeout(() => {
            set({ recentlyWateredPlant: null });
          }, 3000);
        }
      },

      // Manual refresh function that preserves local data
      refreshPlants: async () => {
        // Same as syncWithDatabase but with explicit user action
        return get().syncWithDatabase();
      },

      clearError: () => {
        set({ error: null });
      },

      clearRecentlyWatered: () => {
        set({ recentlyWateredPlant: null });
      },

      clearPlants: () => {
        set({ plants: [], recentlyWateredPlant: null });
      },

      getPlantById: (id) => {
        return get().plants.find(plant => plant.id === id);
      },

      getHealthyPlants: () => {
        return get().plants.filter(plant => plant.status === 'healthy');
      },

      getPlantsNeedingWater: () => {
        return get().plants.filter(plant => plant.status === 'needs_water' || plant.status === 'overdue');
      },

      // Get plants with real-time status updates
      getPlantsWithRealTimeStatus: () => {
        return get().plants.map(plant => {
          const realTimeInfo = getRealTimePlantInfo(plant);
          return {
            ...plant,
            status: realTimeInfo.status,
            nextWatering: realTimeInfo.nextWatering
          };
        });
      },

      // Update all plants with current status
      refreshPlantStatuses: () => {
        set((state) => ({
          plants: state.plants.map(plant => {
            const realTimeInfo = getRealTimePlantInfo(plant);
            return {
              ...plant,
              status: realTimeInfo.status,
              nextWatering: realTimeInfo.nextWatering
            };
          })
        }));
      },

      // Debug operations (for development)
      debugPlantStore: async () => {
        const state = get();
        console.log('=== Plant Store Debug ===');
        console.log('Total plants:', state.plants.length);
        console.log('Plant IDs:', state.plants.map(p => p.id));
        console.log('Plant names:', state.plants.map(p => p.name));
        console.log('Loading:', state.loading);
        console.log('Error:', state.error);
        console.log('Recent watered:', state.recentlyWateredPlant);
        console.log('=========================');
      },

      initializeSampleData: () => {
        const samplePlants = createSamplePlants();
        set((state) => ({
          plants: [...state.plants, ...samplePlants],
        }));
      },

      // Image operations
      storeImage: async (imageData: string) => {
        try {
          return await storeImage(imageData);
        } catch (error) {
          console.error('Failed to store image:', error);
          throw error;
        }
      },

      getImage: async (imageId: string) => {
        try {
          return await getImage(imageId);
        } catch (error) {
          console.error('Failed to get image:', error);
          return null;
        }
      },

      removeImage: async (imageId: string) => {
        try {
          await removeImage(imageId);
        } catch (error) {
          console.error('Failed to remove image:', error);
          throw error;
        }
      },
    }),
    {
      name: 'plant-store',
      version: 1,
      partialize: (state) => ({ 
        plants: state.plants,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate plant store:', error);
          // Even on error, mark as hydrated to prevent infinite loading
          if (state) {
            state.hasHydrated = true;
            state.error = 'Failed to restore saved data';
          }
        } else {
          console.log('Plant store rehydrated with', state?.plants?.length || 0, 'plants');
          if (state) {
            state.hasHydrated = true;
            // Ensure minimum delay for smooth UX
            setTimeout(() => {
              console.log('Plant store fully ready');
            }, 100);
          }
        }
      },
      skipHydration: false,
    }
  )
);

// Export a context provider for the plant store
import React, { createContext, useContext, useEffect, ReactNode } from 'react';

const PlantContext = createContext<PlantStore | null>(null);

export function PlantProvider({ children }: { children: ReactNode }) {
  const store = usePlantStore();
  
  return (
    <PlantContext.Provider value={store}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const store = usePlantStore();
  const context = useContext(PlantContext);

  const baseStore = context || store;
  
  // Return enhanced store with real-time plant data
  return {
    ...baseStore,
    plants: baseStore.getPlantsWithRealTimeStatus(),
    // Explicitly expose image methods for easier access
    storeImage: baseStore.storeImage,
    getImage: baseStore.getImage,
    removeImage: baseStore.removeImage,
    updateImagePlantId: baseStore.updateImagePlantId,
  };
}

export { calculateNextWatering, getPlantStatus, getRealTimePlantInfo };
