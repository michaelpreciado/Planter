import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  status: 'healthy' | 'needs_water';
}

interface PlantContextType {
  plants: Plant[];
  addPlant: (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status'>) => void;
  removePlant: (id: string) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

// Plant icons pool
const plantIcons = ['🌱', '🍃', '🌿', '🌺', '🌻', '🌹', '🌷', '🌵', '🍅', '🥕'];
const plantColors = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'];

export const PlantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);

  const addPlant = (plantData: Omit<Plant, 'id' | 'icon' | 'iconColor' | 'status'>) => {
    console.log('PlantContext addPlant called with:', plantData);
    
    const newPlant: Plant = {
      ...plantData,
      id: Date.now().toString(),
      icon: plantIcons[Math.floor(Math.random() * plantIcons.length)],
      iconColor: plantColors[Math.floor(Math.random() * plantColors.length)],
      status: 'healthy',
      lastWatered: 'Just planted',
      nextWatering: calculateNextWatering(plantData.wateringFrequency),
    };

    console.log('New plant created:', newPlant);
    
    setPlants(prev => {
      console.log('Previous plants:', prev.length);
      const updated = [...prev, newPlant];
      console.log('Updated plants:', updated.length);
      return updated;
    });
  };

  const removePlant = (id: string) => {
    setPlants(prev => prev.filter(plant => plant.id !== id));
  };

  const updatePlant = (id: string, updates: Partial<Plant>) => {
    setPlants(prev => prev.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    ));
  };

  return (
    <PlantContext.Provider value={{ plants, addPlant, removePlant, updatePlant }}>
      {children}
    </PlantContext.Provider>
  );
};

export const usePlants = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
};

// Helper function to calculate next watering date
const calculateNextWatering = (frequency: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const nextWateringDate = new Date(today.getTime() + frequency * 24 * 60 * 60 * 1000);
  
  if (frequency === 1) {
    return 'Tomorrow';
  } else if (frequency <= 7) {
    return `in ${frequency} days`;
  } else {
    return days[nextWateringDate.getDay()];
  }
}; 