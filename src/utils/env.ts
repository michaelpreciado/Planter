import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

// Safe parsing that won't throw errors for missing env vars
const envResult = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
});

// Export env object with fallback values for development
export const env = envResult.success ? envResult.data : {
  NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key-for-offline-mode',
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: undefined,
};

// Export validation status for debugging
export const isEnvValid = envResult.success;

if (!envResult.success) {
  console.log('🔧 Environment variables not configured - using offline mode fallbacks');
} 