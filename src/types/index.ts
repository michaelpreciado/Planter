// Plant data types
export interface Plant {
  id: string;
  name: string;
  species: string;
  plantedDate: string;
  lastWatered?: string;
  notes?: string;
  noteAttachments?: string[];
  imageUrl?: string;
  wateringFrequency: number;
  status: 'healthy' | 'needs_water' | 'overdue';
  icon: string;
  iconColor: string;
  nextWatering: string;
  plantingDate: string;
  userId: string; // Foreign key to users table
  createdAt: string;
  updatedAt: string;
}

// User data types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data types
export interface PlantFormData {
  name: string;
  species: string;
  plantedDate: string;
  notes?: string;
  wateringFrequency: number;
  noteAttachments?: string[];
}

// Theme types
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  text: string;
  surface: string;
  border: string;
}

// Navigation types (extend from navigation files)
export type RootStackParamList = {
  Home: undefined;
  PlantDetail: { plantId: string };
  AddPlant: undefined;
  EditPlant: { plantId: string };
};

// Supabase Database Schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username?: string;
          avatar_url?: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string;
          avatar_url?: string;
        };
        Update: {
          email?: string;
          username?: string;
          avatar_url?: string;
          updatedAt?: string;
        };
      };
      plants: {
        Row: Plant;
        Insert: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Plant, 'id' | 'createdAt' | 'userId'>> & {
          updatedAt?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plant_status: 'healthy' | 'needs_water' | 'overdue';
    };
  };
} 