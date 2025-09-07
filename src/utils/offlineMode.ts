/**
 * Offline Mode Utilities
 * Provides admin authentication and dummy data for testing without backend
 */

// Admin credentials for offline testing
export const OFFLINE_ADMIN = {
  email: 'admin@planter.test',
  password: 'admin123',
  user: {
    id: 'offline-admin-001',
    email: 'admin@planter.test',
    username: 'Admin User',
    avatar_url: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
} as const;

// Check if we're in offline mode
export function isOfflineMode(): boolean {
  // Check localStorage for offline mode setting
  if (typeof window !== 'undefined') {
    return localStorage.getItem('planter_offline_mode') === 'true';
  }
  return false;
}

// Toggle offline mode
export function toggleOfflineMode(): boolean {
  if (typeof window !== 'undefined') {
    const current = isOfflineMode();
    const newValue = !current;
    localStorage.setItem('planter_offline_mode', newValue.toString());
    return newValue;
  }
  return false;
}

// Set offline mode
export function setOfflineMode(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('planter_offline_mode', enabled.toString());
  }
}

// Validate admin credentials for offline mode
export function validateOfflineAdmin(email: string, password: string): boolean {
  return email === OFFLINE_ADMIN.email && password === OFFLINE_ADMIN.password;
}

// Generate dummy plants data for testing
export function generateDummyPlants() {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'dummy-plant-1',
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      plantingDate: twoWeeksAgo.toISOString(),
      wateringFrequency: 7,
      icon: '🐍',
      iconColor: '#10B981',
      lastWatered: oneWeekAgo.toISOString(),
      nextWatering: 'Today',
      status: 'needs_water' as const,
      notes: 'Very low maintenance plant, perfect for beginners!',
      noteAttachments: [],
      imageUrl: undefined,
      createdAt: twoWeeksAgo.toISOString(),
      updatedAt: oneWeekAgo.toISOString(),
    },
    {
      id: 'dummy-plant-2',
      name: 'Spider Plant',
      species: 'Chlorophytum comosum',
      plantingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      wateringFrequency: 3,
      icon: '🕷️',
      iconColor: '#3B82F6',
      lastWatered: threeDaysAgo.toISOString(),
      nextWatering: 'Today',
      status: 'needs_water' as const,
      notes: 'Great for hanging baskets. Produces baby plants!',
      noteAttachments: [],
      imageUrl: undefined,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: threeDaysAgo.toISOString(),
    },
    {
      id: 'dummy-plant-3',
      name: 'Peace Lily',
      species: 'Spathiphyllum',
      plantingDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      wateringFrequency: 5,
      icon: '🌸',
      iconColor: '#EC4899',
      lastWatered: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextWatering: 'in 3 days',
      status: 'healthy' as const,
      notes: 'Beautiful white flowers when happy. Likes humidity.',
      noteAttachments: [],
      imageUrl: undefined,
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dummy-plant-4',
      name: 'Succulent Garden',
      species: 'Mixed Echeveria',
      plantingDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      wateringFrequency: 14,
      icon: '🌵',
      iconColor: '#84CC16',
      lastWatered: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      nextWatering: 'in 9 days',
      status: 'healthy' as const,
      notes: 'Water sparingly. Let soil dry between waterings.',
      noteAttachments: [],
      imageUrl: undefined,
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'dummy-plant-5',
      name: 'Overdue Tomato',
      species: 'Solanum lycopersicum',
      plantingDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      wateringFrequency: 2,
      icon: '🍅',
      iconColor: '#EF4444',
      lastWatered: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      nextWatering: 'Overdue',
      status: 'overdue' as const,
      notes: 'Needs daily watering during growing season. This one is overdue!',
      noteAttachments: [],
      imageUrl: undefined,
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// Load dummy data into store (only if no plants exist)
export function loadDummyDataIfEmpty(plants: any[], addPlant: (plant: any) => Promise<void>) {
  if (isOfflineMode() && plants.length === 0) {
    const dummyPlants = generateDummyPlants();
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      dummyPlants.forEach(plant => {
        // Remove computed fields and add the plant
        const { status, nextWatering, ...plantData } = plant;
        addPlant(plantData);
      });
    }, 100);
  }
}
