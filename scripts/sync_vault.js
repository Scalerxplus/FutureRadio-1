const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const mm = require('music-metadata');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const VAULT_DIR = path.join(__dirname, '../public/local_audio_vault');

// Get all files in a directory
function getAudioFilesInDir(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav'))
    .map(file => path.join(dirPath, file));
}

// Get Audio Duration
async function getAudioDuration(filePath) {
  try {
    const metadata = await mm.parseFile(filePath);
    return (metadata.format.duration * 1000) || 180000; // in milliseconds
  } catch (err) {
    console.error(`Error parsing metadata for ${filePath}:`, err.message);
    return 180000; // fallback 3 minutes
  }
}

async function syncStation(station, stationPath, region) {
  console.log(`\n--- Syncing Station: ${station} ---`);
  
  const categories = ['1_Station_Jingle', '2_Station_ID', '3_Station_Promo', '4_Commercial', '5_Music'];
  const assets = {};

  // 1. Catalog all assets
  for (const cat of categories) {
    const catPath = path.join(stationPath, cat);
    const files = getAudioFilesInDir(catPath);
    assets[cat] = [];
    
    for (const file of files) {
      console.log(`Indexing ${path.basename(file)}...`);
      const durationMs = await getAudioDuration(file);
      // Path relative to public folder
      const publicUrl = `/local_audio_vault/${region}/${station}/${cat}/${path.basename(file)}`;
      assets[cat].push({ url: encodeURI(publicUrl), duration: durationMs, name: path.basename(file) });
    }
  }

  // 2. Build 24-Hour Schedule
  if (assets['5_Music'].length === 0) {
    console.log(`Skipping ${station} - No music found.`);
    return;
  }

  console.log(`Building 24-hour schedule for ${station}...`);
  
  // Start from top of the current hour
  let currentTime = new Date();
  currentTime.setMinutes(0, 0, 0);
  const scheduleEnd = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const scheduleBlocks = [];
  
  const getRandomAsset = (cat) => {
    if (!assets[cat] || assets[cat].length === 0) return null;
    return assets[cat][Math.floor(Math.random() * assets[cat].length)];
  };

  while (currentTime < scheduleEnd) {
    // Pattern: ID -> Music -> Music -> Jingle -> Commercial -> Music -> Promo -> Music
    const blockSequence = [
      { type: 'station_id', cat: '2_Station_ID' },
      { type: 'song', cat: '5_Music' },
      { type: 'song', cat: '5_Music' },
      { type: 'sweeper', cat: '1_Station_Jingle' },
      { type: 'commercial', cat: '4_Commercial' },
      { type: 'song', cat: '5_Music' },
      { type: 'promo', cat: '3_Station_Promo' },
      { type: 'song', cat: '5_Music' },
    ];

    for (const item of blockSequence) {
      let asset = getRandomAsset(item.cat);
      if (!asset) {
         if (item.type === 'song') continue; // Music is mandatory
         else asset = getRandomAsset('5_Music'); // Fallback to music if ID/Promo is missing
         if(!asset) continue;
      }

      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime.getTime() + asset.duration);

      scheduleBlocks.push({
        id: crypto.randomUUID(),
        city_id: station,
        element_type: item.type === 'commercial' ? 'promo' : item.type,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_ms: Math.round(asset.duration),
        media_url: asset.url,
        metadata: {
          title: item.type.toUpperCase(),
          artist: "Future Radio",
          original_filename: asset.name
        }
      });

      currentTime = endTime;
    }
  }

  // 3. Clear old schedule from today onwards and Insert new
  console.log(`Pushing ${scheduleBlocks.length} items to Supabase...`);
  await supabase
    .from('broadcast_schedule')
    .delete()
    .eq('city_id', station)
    .gte('start_time', new Date().toISOString());

  // Batch insert
  const chunkSize = 100;
  for (let i = 0; i < scheduleBlocks.length; i += chunkSize) {
    const chunk = scheduleBlocks.slice(i, i + chunkSize);
    const { error } = await supabase.from('broadcast_schedule').insert(chunk);
    if (error) console.error("Insert Error:", error.message);
  }

  console.log(`Sync complete for ${station}!`);
}

async function main() {
  const regions = ['regional', 'devotional'];
  for (const region of regions) {
    const regionPath = path.join(VAULT_DIR, region);
    if (fs.existsSync(regionPath)) {
      const stations = fs.readdirSync(regionPath);
      for (const station of stations) {
        const stationPath = path.join(regionPath, station);
        if (fs.statSync(stationPath).isDirectory()) {
          await syncStation(station, stationPath, region);
        }
      }
    }
  }
  console.log("All stations synced successfully!");
}

main();
