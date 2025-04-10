
import { createClient } from '@supabase/supabase-js';

// Use actual public Supabase URL and anon key that works in browser environments
const supabaseUrl = 'https://gdiqtusjsmzlwkehfacf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaXF0dXNqc216bHdrZWhmYWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDYwMjIzNjgsImV4cCI6MjAyMTU5ODM2OH0.pUQjDb9j0UeT1uLMspP5ABMg_x0cDJqUwOzo47LFUUw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
