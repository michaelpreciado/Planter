'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TamagotchiSettings {
  color: string;
  name?: string;
  personality?: 'happy' | 'calm' | 'energetic' | 'sleepy';
}

interface TamagotchiStore {
  settings: TamagotchiSettings;
  updateColor: (color: string) => void;
  updateName: (name: string) => void;
  updatePersonality: (personality: TamagotchiSettings['personality']) => void;
  resetToDefaults: () => void;
}

// Predefined color options
export const TAMAGOTCHI_COLORS = [
  { name: 'Forest Green', value: '#10B981', filter: 'hue-rotate(120deg) saturate(1.2)' },
  { name: 'Sky Blue', value: '#3B82F6', filter: 'hue-rotate(220deg) saturate(1.1)' },
  { name: 'Sunset Orange', value: '#F59E0B', filter: 'hue-rotate(30deg) saturate(1.3)' },
  { name: 'Royal Purple', value: '#8B5CF6', filter: 'hue-rotate(270deg) saturate(1.2)' },
  { name: 'Cherry Red', value: '#EF4444', filter: 'hue-rotate(0deg) saturate(1.4)' },
  { name: 'Rose Pink', value: '#EC4899', filter: 'hue-rotate(320deg) saturate(1.3)' },
  { name: 'Mint Green', value: '#06B6D4', filter: 'hue-rotate(180deg) saturate(1.1)' },
  { name: 'Lime', value: '#84CC16', filter: 'hue-rotate(80deg) saturate(1.2)' },
  { name: 'Coral', value: '#F97316', filter: 'hue-rotate(15deg) saturate(1.3)' },
  { name: 'Lavender', value: '#6366F1', filter: 'hue-rotate(250deg) saturate(1.1)' },
];

const DEFAULT_SETTINGS: TamagotchiSettings = {
  color: TAMAGOTCHI_COLORS[0].value,
  name: 'Buddy',
  personality: 'happy',
};

export const useTamagotchiStore = create<TamagotchiStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      
      updateColor: (color: string) => {
        set((state) => ({
          settings: { ...state.settings, color }
        }));
      },
      
      updateName: (name: string) => {
        set((state) => ({
          settings: { ...state.settings, name }
        }));
      },
      
      updatePersonality: (personality: TamagotchiSettings['personality']) => {
        set((state) => ({
          settings: { ...state.settings, personality }
        }));
      },
      
      resetToDefaults: () => {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    {
      name: 'tamagotchi-settings',
    }
  )
);

// Helper function to get filter style from color
export const getColorFilter = (color: string): string => {
  const colorOption = TAMAGOTCHI_COLORS.find(c => c.value === color);
  return colorOption?.filter || 'none';
}; 