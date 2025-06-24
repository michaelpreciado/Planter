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
  triggerManualSync: () => Promise<void>;
  debugPlantStore: () => void;
  removeDuplicatePlants: () => number;
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
      addPlant: async (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status' | 'createdAt' | 'updatedAt'>) => {
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

          // Try to sync to database immediately
          if (isSupabaseConfigured()) {
            try {
              const dbPlant = {
                name: newPlant.name,
                species: newPlant.species,
                plantedDate: newPlant.plantingDate,
                plantingDate: newPlant.plantingDate,
                wateringFrequency: newPlant.wateringFrequency,
                icon: newPlant.icon,
                iconColor: newPlant.iconColor,
                lastWatered: newPlant.lastWatered,
                nextWatering: newPlant.nextWatering || calculateNextWatering(newPlant.wateringFrequency, newPlant.lastWatered),
                status: newPlant.status,
                notes: newPlant.notes,
                noteAttachments: newPlant.noteAttachments,
                imageUrl: newPlant.imageUrl,
                userId: '', // Will be set by plantService.createPlant
              };
              const createdPlant = await plantService.createPlant(dbPlant);
              
              // Update local plant with database ID to prevent duplication
              set((state) => ({
                plants: state.plants.map(p => 
                  p.id === newPlant.id ? { ...p, id: createdPlant.id, updatedAt: new Date().toISOString() } : p
                ),
              }));
              
              if (isDevelopment) console.log(`Successfully synced new plant: ${newPlant.name} (${newPlant.id} -> ${createdPlant.id})`);
            } catch (error) {
              // Don't fail the local save if database sync fails
              if (isDevelopment) console.warn('Failed to sync new plant to database:', error);
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

      removePlant: async (id: string) => {
        const plant = get().plants.find((p) => p.id === id);
        
        // Remove from local state
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
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

      updatePlant: async (id: string, updates: Partial<Plant>) => {
        set({ loading: true, error: null });
        
        try {
          const updatedData = {
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // Update locally
          set((state) => ({
            plants: state.plants.map((plant) => 
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

      waterPlant: async (id: string) => {
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
      getPlantById: (id: string) => {
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
      storeImage: async (imageData: string) => {
        try {
          const imageId = await storeImage(imageData);
          return imageId;
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
          
          // Step 1: Fetch all plants from database
          const remotePlants = await plantService.getPlants();
          
          // Step 2: Create maps for efficient comparison
          const localPlantsMap = new Map(localPlants.map(p => [p.id, p]));
          const remotePlantsMap = new Map(remotePlants.map(p => [p.id, p]));
          
          // Step 3: Find plants that exist locally but not remotely (need to upload)
          const plantsToUpload = localPlants.filter(localPlant => 
            !remotePlantsMap.has(localPlant.id)
          );
          
          // Step 4: Upload local plants to database and update local IDs
          const plantIdMappings = new Map<string, string>(); // oldId -> newId
          
          for (const plant of plantsToUpload) {
            try {
              // Convert local plant to database format
              const dbPlant = {
                name: plant.name,
                species: plant.species,
                plantedDate: plant.plantingDate, // Map plantingDate to plantedDate for DB
                plantingDate: plant.plantingDate,
                wateringFrequency: plant.wateringFrequency,
                icon: plant.icon,
                iconColor: plant.iconColor,
                lastWatered: plant.lastWatered,
                nextWatering: plant.nextWatering || calculateNextWatering(plant.wateringFrequency, plant.lastWatered),
                status: plant.status,
                notes: plant.notes,
                noteAttachments: plant.noteAttachments,
                imageUrl: plant.imageUrl,
                userId: '', // Will be set by plantService.createPlant
              };
              
              const createdPlant = await plantService.createPlant(dbPlant);
              plantIdMappings.set(plant.id, createdPlant.id);
              if (isDevelopment) console.log(`Uploaded plant: ${plant.name} (${plant.id} -> ${createdPlant.id})`);
            } catch (error) {
              console.error(`Failed to upload plant ${plant.name}:`, error);
            }
          }
          
          // Step 5: Find plants that exist remotely but not locally (need to download)
          const plantsToDownload = remotePlants.filter(remotePlant => 
            !localPlantsMap.has(remotePlant.id)
          );
          
          // Step 6: Update plants that exist in both but have different update times
          const plantsToUpdate = remotePlants.filter(remotePlant => {
            const localPlant = localPlantsMap.get(remotePlant.id);
            if (!localPlant) return false;
            
            const remoteUpdatedAt = new Date(remotePlant.updatedAt || remotePlant.createdAt);
            const localUpdatedAt = new Date(localPlant.updatedAt);
            
            return remoteUpdatedAt > localUpdatedAt;
          });
          
          // Step 7: Merge all changes into local state
          let updatedPlants = [...localPlants];
          
          // Update local plants with new database IDs
          for (const [oldId, newId] of plantIdMappings) {
            const plantIndex = updatedPlants.findIndex(p => p.id === oldId);
            if (plantIndex !== -1) {
              updatedPlants[plantIndex] = {
                ...updatedPlants[plantIndex],
                id: newId,
                updatedAt: new Date().toISOString(),
              };
            }
          }
          
          // Add downloaded plants
          for (const remotePlant of plantsToDownload) {
            const localPlant: Plant = {
              id: remotePlant.id,
              name: remotePlant.name || '',
              species: remotePlant.species || '',
              plantingDate: remotePlant.plantingDate || new Date().toISOString(),
              wateringFrequency: remotePlant.wateringFrequency || 7,
              icon: remotePlant.icon || '🌱',
              iconColor: remotePlant.iconColor || '#10B981',
              lastWatered: remotePlant.lastWatered,
              nextWatering: remotePlant.nextWatering,
              status: remotePlant.status || 'healthy',
              notes: remotePlant.notes,
              noteAttachments: remotePlant.noteAttachments,
              imageUrl: remotePlant.imageUrl,
              createdAt: remotePlant.createdAt || new Date().toISOString(),
              updatedAt: remotePlant.updatedAt || remotePlant.createdAt || new Date().toISOString(),
            };
            updatedPlants.push(localPlant);
          }
          
          // Update existing plants with newer remote data
          for (const remotePlant of plantsToUpdate) {
            const index = updatedPlants.findIndex(p => p.id === remotePlant.id);
            if (index !== -1) {
              updatedPlants[index] = {
                id: remotePlant.id,
                name: remotePlant.name || '',
                species: remotePlant.species || '',
                plantingDate: remotePlant.plantingDate || new Date().toISOString(),
                wateringFrequency: remotePlant.wateringFrequency || 7,
                icon: remotePlant.icon || '🌱',
                iconColor: remotePlant.iconColor || '#10B981',
                lastWatered: remotePlant.lastWatered,
                nextWatering: remotePlant.nextWatering,
                status: remotePlant.status || 'healthy',
                notes: remotePlant.notes,
                noteAttachments: remotePlant.noteAttachments,
                imageUrl: remotePlant.imageUrl,
                createdAt: remotePlant.createdAt || new Date().toISOString(),
                updatedAt: remotePlant.updatedAt || remotePlant.createdAt || new Date().toISOString(),
              };
            }
          }
          
          // Step 8: Remove any duplicate plants that might have been created
          const deduplicatedPlants = updatedPlants.reduce((acc, plant) => {
            // Check if a plant with the same name, species, and planting date already exists
            const duplicate = acc.find(p => 
              p.name === plant.name && 
              p.species === plant.species && 
              p.plantingDate === plant.plantingDate &&
              p.id !== plant.id
            );
            
            if (duplicate) {
              // Keep the plant with the most recent updatedAt timestamp
              const currentUpdated = new Date(plant.updatedAt);
              const existingUpdated = new Date(duplicate.updatedAt);
              
              if (currentUpdated > existingUpdated) {
                // Replace the duplicate with the newer plant
                return acc.map(p => p.id === duplicate.id ? plant : p);
              }
              // Keep the existing plant (don't add current)
              return acc;
            }
            
            acc.push(plant);
            return acc;
          }, [] as Plant[]);
          
          // Step 9: Update local state with merged and deduplicated data
          set({ 
            plants: deduplicatedPlants,
            loading: false,
            error: null
          });
          
          if (isDevelopment) {
            console.log(`Sync completed:`);
            console.log(`- Uploaded: ${plantsToUpload.length} plants`);
            console.log(`- Downloaded: ${plantsToDownload.length} plants`);
            console.log(`- Updated: ${plantsToUpdate.length} plants`);
            console.log(`- Deduplicated: ${updatedPlants.length - deduplicatedPlants.length} plants`);
            console.log(`- Total plants: ${deduplicatedPlants.length}`);
          }
          
        } catch (error) {
          console.error('Failed to sync with database:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sync with database', 
            loading: false 
          });
          throw error; // Re-throw to allow components to handle sync failures
        }
      },

      triggerManualSync: async () => {
        if (!isSupabaseConfigured()) {
          if (isDevelopment) console.log('Database not configured - staying in offline mode');
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          await get().syncWithDatabase();
          if (isDevelopment) console.log('Manual sync completed');
        } catch (error) {
          console.error('Failed to trigger manual sync:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to trigger manual sync', 
            loading: false 
          });
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

      // Utility function to manually remove duplicate plants
      removeDuplicatePlants: () => {
        const state = get();
        const deduplicatedPlants = state.plants.reduce((acc, plant) => {
          // Check if a plant with the same name, species, and planting date already exists
          const duplicate = acc.find(p => 
            p.name === plant.name && 
            p.species === plant.species && 
            p.plantingDate === plant.plantingDate &&
            p.id !== plant.id
          );
          
          if (duplicate) {
            // Keep the plant with the most recent updatedAt timestamp
            const currentUpdated = new Date(plant.updatedAt);
            const existingUpdated = new Date(duplicate.updatedAt);
            
            if (currentUpdated > existingUpdated) {
              // Replace the duplicate with the newer plant
              return acc.map(p => p.id === duplicate.id ? plant : p);
            }
            // Keep the existing plant (don't add current)
            return acc;
          }
          
          acc.push(plant);
          return acc;
        }, [] as Plant[]);
        
        const removedCount = state.plants.length - deduplicatedPlants.length;
        
        if (removedCount > 0) {
          set({ plants: deduplicatedPlants });
          if (isDevelopment) console.log(`Removed ${removedCount} duplicate plants`);
        }
        
        return removedCount;
      },
    }),
    {
      name: 'plant-store',
      version: 2,
      partialize: (state) => ({ 
        plants: state.plants,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.hasHydrated = true;
            state.loading = false;
          }
        };
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