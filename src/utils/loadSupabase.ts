import { env } from './env';

export async function getSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
} 