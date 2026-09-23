import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching rows to update...");
  const { data, error } = await supabase
    .from('broadcast_schedule')
    .select('*')
    .eq('city_id', 'bagheli');
    
  if (error) {
    console.error("Error fetching:", error);
    return;
  }
  
  console.log(`Found ${data.length} rows to update.`);
  let count = 0;
  for (const row of data) {
    let newUrl = row.media_url;
    if (newUrl) {
      newUrl = newUrl.replace('/regional/bagheli/', '/roots/');
    }
    
    const { error: updateError } = await supabase
      .from('broadcast_schedule')
      .update({ city_id: 'roots', media_url: newUrl })
      .eq('id', row.id);
      
    if (updateError) {
      console.error(`Error updating row ${row.id}:`, updateError);
    } else {
      count++;
    }
  }
  console.log(`Successfully updated ${count} rows.`);
}

run();
