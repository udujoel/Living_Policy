import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// In some build environments, env vars might be missing during static generation.
// We provide a fallback or conditional check to prevent build crashes.
export const supabase = createClient(
  supabaseUrl, 
  supabaseKey
);
