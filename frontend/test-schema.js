import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('pregnancy_profiles').select('*').limit(1);
  if (error) {
    console.error("Error fetching profile:", error);
  } else {
    console.log("Profile sample keys:", data && data.length > 0 ? Object.keys(data[0]) : "No data");
  }
}

checkSchema();
