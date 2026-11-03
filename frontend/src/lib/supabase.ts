import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rtuhzqmjeyizawmwzstf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dWh6cW1qZXlpemF3bXd6c3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0OTk4MDAsImV4cCI6MjA5NjA3NTgwMH0.Ygu8tPO0KrVtiW4ps3-ImPU2LvJu_c9lNwCGcbNY0V8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
