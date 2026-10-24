import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rsrjkhqffvvqkofxhvhg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcmpraHFmZnZ2cWtvZnhodmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzQyOTMsImV4cCI6MjA5MTE1MDI5M30.Jk1VhJcYCxvNwiICeSI4UYD0KtpxzJjwIVD8P2zksDM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});


