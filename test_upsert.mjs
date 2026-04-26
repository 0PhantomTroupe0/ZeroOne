import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rsrjkhqffvvqkofxhvhg.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcmpraHFmZnZ2cWtvZnhodmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzQyOTMsImV4cCI6MjA5MTE1MDI5M30.Jk1VhJcYCxvNwiICeSI4UYD0KtpxzJjwIVD8P2zksDM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: '00000000-0000-0000-0000-000000000000', // dummy uuid
      full_name: 'Test',
      username: 'test',
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    console.error("UPSERT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("UPSERT SUCCESS:", data);
  }
}

run();
