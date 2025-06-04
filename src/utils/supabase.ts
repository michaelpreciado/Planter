import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'https://your-project.supabase.co' || 
    supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ Supabase environment variables not configured. Running in offline mode.');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://localhost:3000', 
  supabaseAnonKey || 'dummy-key'
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' && 
    supabaseAnonKey !== 'your-anon-key');
};

// Plant operations with user authentication
export const plantService = {
  // Get all plants for the current user
  async getPlants() {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new plant for the current user
  async createPlant(plant: Omit<Database['public']['Tables']['plants']['Insert'], 'userId'>) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plants')
      .insert({
        ...plant,
        userId: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a plant (only if owned by current user)
  async updatePlant(id: string, updates: Database['public']['Tables']['plants']['Update']) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', id)
      .eq('userId', user.id) // Ensure user owns the plant
      .select()
      .single();
    
    if (error) throw error;
    return data;
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
    
    if (error) throw error;
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
      throw new Error('Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
    
    // Transform database fields to match TypeScript interface
    if (data) {
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        avatar_url: data.avatar_url,
        createdAt: data.createdAt || data.created_at,
        updatedAt: data.updatedAt || data.updated_at,
      };
    }
    
    return data;
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
    
    if (error) throw error;

    // Transform back to camelCase for return
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      avatar_url: data.avatar_url,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at,
    };
  },
}; 