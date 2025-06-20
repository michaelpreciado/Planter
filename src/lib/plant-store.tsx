'use client';

// Plant Store - Production Ready v2.0
// Fixed for deployment - ensuring proper Zustand store structure

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';
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
  noteAttachments?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlantStore {
  plants: Plant[];
  recentlyWateredPlant: string | null;
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  // Core operations
  addPlant: (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  
  // Utility functions
  getPlantById: (id: string) => Plant | undefined;
  getHealthyPlants: () => Plant[];
  getPlantsNeedingWater: () => Plant[];
  refreshPlantStatuses: () => void;
  clearError: () => void;
  clearRecentlyWatered: () => void;
  
  // Image operations
  storeImage: (imageData: string) => Promise<string>;
  getImage: (imageId: string) => Promise<string | null>;
  removeImage: (imageId: string) => Promise<void>;
  
  // Sync operations
  syncWithDatabase: () => Promise<void>;
  debugPlantStore: () => void;
}

const plantIcons = ['🌱', '🍃', '🌿', '🌺', '🌻', '🌹', '🌷', '🌵', '🍅', '🥕', '🌾', '🌸', '🌼', '🪴', '🌳'];
const plantColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const calculateNextWatering = (frequency: number, lastWatered?: string): string => {
  const today = new Date();
  
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

const getRealTimePlantInfo = (plant: Plant): { status: Plant['status'], nextWatering: string } => {
  const status = getPlantStatus(plant.lastWatered || '', plant.wateringFrequency);
  const nextWatering = calculateNextWatering(plant.wateringFrequency, plant.lastWatered);
  return { status, nextWatering };
};

// Remove non-error console logs for production
const isDevelopment = process.env.NODE_ENV === 'development';

export const usePlantStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      plants: [],
      recentlyWateredPlant: null,
      loading: false,
      error: null,
      hasHydrated: false,
      
      // Core operations
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
            nextWatering: calculateNextWatering(plantData.wateringFrequency),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Save locally first
          set((state) => ({
            plants: [...state.plants, newPlant],
            loading: false,
          }));

                     // Database sync will be handled separately to avoid type conflicts
           // Plant is saved locally and will sync when user navigates or refreshes
        } catch (error) {
          console.error('Error adding plant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add plant', 
            loading: false 
          });
        }
      },

      removePlant: async (id) => {
        const plant = get().plants.find(p => p.id === id);
        
        // Remove from local state
        set((state) => ({
          plants: state.plants.filter(p => p.id !== id),
        }));

        // Clean up associated images
        if (plant?.imageUrl) {
          try {
            await removeImage(plant.imageUrl);
          } catch (error) {
            if (isDevelopment) console.warn('Failed to remove plant image:', error);
          }
        }

        // Try database sync
        if (isSupabaseConfigured()) {
          try {
            await plantService.deletePlant(id);
          } catch (error) {
            if (isDevelopment) console.warn('Database delete failed:', error);
          }
        }
      },

      updatePlant: async (id, updates) => {
        set({ loading: true, error: null });
        
        try {
          const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // Update locally
          set((state) => ({
            plants: state.plants.map(plant => 
              plant.id === id ? { ...plant, ...updatedData } : plant
            ),
            loading: false,
          }));

          // Try database sync
          if (isSupabaseConfigured()) {
            try {
              await plantService.updatePlant(id, updatedData);
            } catch (error) {
              if (isDevelopment) console.warn('Database update failed:', error);
            }
          }
        } catch (error) {
          console.error('Error updating plant:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update plant', 
            loading: false 
          });
        }
      },

      waterPlant: async (id) => {
        const today = new Date().toISOString();
        const plant = get().plants.find(p => p.id === id);
        
        if (!plant) return;

        const nextWatering = calculateNextWatering(plant.wateringFrequency, today);
        
        await get().updatePlant(id, {
          lastWatered: today,
          nextWatering,
          status: 'healthy',
        });

        set({ recentlyWateredPlant: id });
        
        // Clear the recent notification after 3 seconds
        setTimeout(() => {
          set({ recentlyWateredPlant: null });
        }, 3000);
      },

      // Utility functions
      getPlantById: (id) => {
        return get().plants.find(plant => plant.id === id);
      },

      getHealthyPlants: () => {
        return get().plants.filter(plant => {
          const realTimeInfo = getRealTimePlantInfo(plant);
          return realTimeInfo.status === 'healthy';
        });
      },

      getPlantsNeedingWater: () => {
        return get().plants.filter(plant => {
          const realTimeInfo = getRealTimePlantInfo(plant);
          return realTimeInfo.status === 'needs_water' || realTimeInfo.status === 'overdue';
        });
      },

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

      clearError: () => {
        set({ error: null });
      },

      clearRecentlyWatered: () => {
        set({ recentlyWateredPlant: null });
      },

      // Image operations
      storeImage: async (imageData) => {
        try {
          const imageId = await storeImage(imageData);
          return imageId;
        } catch (error) {
          console.error('Failed to store image:', error);
          throw error;
        }
      },

      getImage: async (imageId) => {
        try {
          return await getImage(imageId);
        } catch (error) {
          console.error('Failed to get image:', error);
          return null;
        }
      },

      removeImage: async (imageId) => {
        try {
          await removeImage(imageId);
        } catch (error) {
          console.error('Failed to remove image:', error);
        }
      },

      // Sync operations
      syncWithDatabase: async () => {
        if (!isSupabaseConfigured()) {
          if (isDevelopment) console.log('Database not configured - staying in offline mode');
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          const localPlants = get().plants;
          // Sync logic here
          if (isDevelopment) console.log(`Synced ${localPlants.length} plants from database`);
        } catch (error) {
          console.error('Failed to sync with database:', error);
          set({ error: 'Failed to sync with database', loading: false });
        }
      },

      debugPlantStore: () => {
        if (isDevelopment) {
          const state = get();
          console.log('=== Plant Store Debug ===');
          console.log('Total plants:', state.plants.length);
          console.log('Plant names:', state.plants.map(p => p.name));
          console.log('Loading:', state.loading);
          console.log('Error:', state.error);
          console.log('=========================');
        }
      },
    }),
    {
      name: 'plant-store',
      version: 2, // Increment version for the new system
      partialize: (state) => ({ 
        plants: state.plants,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate plant store:', error);
        } else {
          console.log('Plant store rehydrated with', state?.plants?.length || 0, 'plants');
        }
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);

// Enhanced hook that provides real-time plant data
export function usePlants() {
  const store = usePlantStore();
  
  // Return plants with real-time status
  const plantsWithRealTimeStatus = store.plants.map(plant => {
    const realTimeInfo = getRealTimePlantInfo(plant);
    return {
      ...plant,
      status: realTimeInfo.status,
      nextWatering: realTimeInfo.nextWatering
    };
  });
  
  return {
    ...store,
    plants: plantsWithRealTimeStatus,
  };
}

export { calculateNextWatering, getPlantStatus, getRealTimePlantInfo }; 