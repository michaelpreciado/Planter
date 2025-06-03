'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays } from 'date-fns';
import { plantService } from '@/utils/supabase';
import { Plant as DBPlant } from '@/types';

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
  noteAttachments?: string[]; // Array of image URLs for note attachments
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface PlantStore {
  plants: Plant[];
  recentlyWateredPlant: string | null;
  loading: boolean;
  error: string | null;
  
  // Local operations (for offline support)
  addPlant: (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  
  // Sync operations
  syncWithDatabase: () => Promise<void>;
  clearRecentlyWatered: () => void;
  getPlantById: (id: string) => Plant | undefined;
  getHealthyPlants: () => Plant[];
  getPlantsNeedingWater: () => Plant[];
  initializeSampleData: () => void;
}

const plantIcons = ['🌱', '🍃', '🌿', '🌺', '🌻', '🌹', '🌷', '🌵', '🍅', '🥕', '🌾', '🌸', '🌼', '🪴', '🌳'];
const plantColors = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const calculateNextWatering = (frequency: number): string => {
  const nextDate = addDays(new Date(), frequency);
  const today = new Date();
  
  if (frequency === 1) {
    return 'Tomorrow';
  } else if (frequency <= 7) {
    return `in ${frequency} days`;
  } else {
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

// Convert database plant to local plant format
const dbPlantToLocal = (dbPlant: DBPlant): Plant => ({
  id: dbPlant.id,
  name: dbPlant.name,
  species: dbPlant.species,
  plantingDate: dbPlant.plantingDate || dbPlant.plantedDate || new Date().toISOString(),
  wateringFrequency: dbPlant.wateringFrequency,
  icon: dbPlant.icon,
  iconColor: dbPlant.iconColor,
  lastWatered: dbPlant.lastWatered,
  nextWatering: dbPlant.nextWatering,
  status: dbPlant.status,
  notes: dbPlant.notes,
  noteAttachments: dbPlant.noteAttachments,
  imageUrl: dbPlant.imageUrl,
  createdAt: dbPlant.createdAt,
  updatedAt: dbPlant.updatedAt,
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
  lastWatered: localPlant.lastWatered,
  nextWatering: localPlant.nextWatering || calculateNextWatering(localPlant.wateringFrequency),
  status: localPlant.status,
  notes: localPlant.notes,
  noteAttachments: localPlant.noteAttachments,
  imageUrl: localPlant.imageUrl,
});

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
      
      // Sync with database
      syncWithDatabase: async () => {
        set({ loading: true, error: null });
        try {
          const dbPlants = await plantService.getPlants();
          const localPlants = dbPlants.map(dbPlantToLocal);
          set({ plants: localPlants, loading: false });
        } catch (error) {
          console.error('Failed to sync with database:', error);
          set({ error: error instanceof Error ? error.message : 'Sync failed', loading: false });
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
          nextWatering: calculateNextWatering(plantData.wateringFrequency),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

          // Add to database first
          try {
            const dbPlant = await plantService.createPlant(localPlantToDb(newPlant));
            // Update with actual database ID and data
            const finalPlant = dbPlantToLocal(dbPlant);
            set((state) => ({
              plants: [...state.plants, finalPlant],
              loading: false,
            }));
          } catch (dbError) {
            // If database fails, still add locally (offline support)
            console.warn('Database add failed, adding locally:', dbError);
        set((state) => ({
          plants: [...state.plants, newPlant],
              loading: false,
        }));
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to add plant', loading: false });
        }
      },

      removePlant: async (id) => {
        set({ loading: true, error: null });
        try {
          // Remove from database first
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
                  updatedAt: new Date().toISOString(),
                  status: updates.lastWatered 
              ? getPlantStatus(updates.lastWatered, currentPlant.wateringFrequency)
              : (updates.status || currentPlant.status),
          };

          // Update in database first
          try {
            await plantService.updatePlant(id, updatedData);
          } catch (dbError) {
            console.warn('Database update failed, updating locally:', dbError);
          }

          set((state) => ({
            plants: state.plants.map((plant) =>
              plant.id === id ? { ...plant, ...updatedData } : plant
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
            nextWatering: calculateNextWatering(plant.wateringFrequency),
          });

          set({ recentlyWateredPlant: id });
          setTimeout(() => {
            set({ recentlyWateredPlant: null });
          }, 3000);
        }
      },

      clearRecentlyWatered: () => {
        set({ recentlyWateredPlant: null });
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

      initializeSampleData: () => {
        const samplePlants = createSamplePlants();
        set((state) => ({
          plants: [...state.plants, ...samplePlants],
        }));
      },
    }),
    {
      name: 'plant-store',
      partialize: (state) => ({ 
        plants: state.plants,
        recentlyWateredPlant: state.recentlyWateredPlant 
      }),
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

  // Return context if available, otherwise fallback to direct store access
  return context || store;
}

export { calculateNextWatering, getPlantStatus };
