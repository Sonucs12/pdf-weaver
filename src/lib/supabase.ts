import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for client-side usage (browser).
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase client for server-side usage.
 */
export function createSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Check your .env.local file.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
