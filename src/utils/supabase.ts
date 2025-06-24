import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const offlineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';

// Check for forced offline mode from localStorage (for debugging)
const isForcedOffline = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('FORCE_OFFLINE_MODE') === 'true';
};

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project.supabase.co' || 
    supabaseAnonKey === 'your-anon-key') {
          // Supabase not configured - offline mode
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://localhost:3000', 
  supabaseAnonKey || 'dummy-key'
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (offlineMode || isForcedOffline()) return false;
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseUrl !== 'https://localhost:3000' &&
    supabaseAnonKey !== 'dummy-key');
};

// Transform database plant data to ensure consistent column names
const transformPlantFromDB = (data: any) => {
  return data; // No transformation needed since database uses camelCase
};

// Safe data transformation to prevent type errors
const sanitizePlantData = (data: any) => {
  return {
    ...data,
    // Ensure dates are properly formatted
    plantedDate: data.plantedDate || data.plantingDate || new Date().toISOString(),
    plantingDate: data.plantingDate || data.plantedDate || new Date().toISOString(),
    lastWatered: data.lastWatered && data.lastWatered !== 'Just planted' ? data.lastWatered : null,
    // Ensure arrays are properly formatted
    noteAttachments: Array.isArray(data.noteAttachments) ? data.noteAttachments : [],
    // Ensure strings are not empty
    notes: typeof data.notes === 'string' ? data.notes : '',
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
  };
};

// Plant operations with user authentication
export const plantService = {
  // Get all plants for the current user
  async getPlants() {
    if (!isSupabaseConfigured()) {
      console.log('🔧 Database not configured - using offline mode');
      return [];
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔧 User not authenticated - using offline mode');
        return [];
      }

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('❌ Database query failed:', error);
        return [];
      }
      
      return data?.map(transformPlantFromDB) || [];
    } catch (error) {
      console.error('❌ Failed to fetch plants from database:', error);
      return [];
    }
  },

  // Create a new plant for the current user
  async createPlant(plant: Omit<Database['public']['Tables']['plants']['Insert'], 'userId'>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Sanitize data before sending to database
    const sanitizedData = sanitizePlantData({
      ...plant,
      userId: user.id,
    });

    const { data, error } = await supabase
      .from('plants')
      .insert(sanitizedData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database insert failed:', error);
      throw error;
    }
    return transformPlantFromDB(data);
  },

  // Update a plant (only if owned by current user)
  async updatePlant(id: string, updates: Database['public']['Tables']['plants']['Update']) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Sanitize updates before sending to database
    const sanitizedUpdates = sanitizePlantData(updates);

    const { data, error } = await supabase
      .from('plants')
      .update(sanitizedUpdates)
      .eq('id', id)
      .eq('userId', user.id) // Ensure user owns the plant
      .select()
      .single();
    
    if (error) {
      console.error('❌ Database update failed:', error);
      throw error;
    }
    return transformPlantFromDB(data);
  },

  // Delete a plant (only if owned by current user)
  async deletePlant(id: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id)
      .eq('userId', user.id); // Ensure user owns the plant
    
    if (error) {
      console.error('❌ Database delete failed:', error);
      throw error;
    }
  },

  // Log watering event
  async logWatering(plantId: string) {
    return this.updatePlant(plantId, {
      lastWatered: new Date().toISOString(),
    });
  },
};

// Profile operations
export const profileService = {
  // Get current user profile
  async getProfile() {
    if (!isSupabaseConfigured()) {
      console.log('🔧 Database not configured - profile unavailable');
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔧 User not authenticated - profile unavailable');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Profile query failed:', error);
        return null;
      }
      
      // Transform database fields to match TypeScript interface
      if (data) {
        return {
          id: data.id,
          email: data.email,
          username: data.username,
          avatar_url: data.avatar_url,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      return null;
    }
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<Database['public']['Tables']['profiles']['Insert']>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Transform camelCase to snake_case for database
    const dbProfile = {
      id: user.id,
      email: user.email || '',
      username: profile.username || user.user_metadata?.username,
      avatar_url: profile.avatar_url,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbProfile)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile upsert failed:', error);
      throw error;
    }

    // Transform back to camelCase for return
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      avatar_url: data.avatar_url,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
}; 