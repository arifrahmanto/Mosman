/**
 * Supabase Client Configuration
 * Initializes Supabase clients for database and authentication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

// Supabase client with anon key for client-side operations
// This client respects Row Level Security (RLS) policies
export const supabase: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, don't persist sessions
    },
  }
);

// Supabase client with service role key for admin operations
// This client bypasses Row Level Security (RLS) policies
// ⚠️ Use with caution - only for trusted server operations
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Test Supabase connection
 * @returns Promise<boolean> - True if connection successful
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Try to query Supabase to verify connection
    const { error } = await supabase.from('_health_check').select('*').limit(1);

    // If table doesn't exist, that's fine - connection works
    // If there's a network error, that's a problem
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}
