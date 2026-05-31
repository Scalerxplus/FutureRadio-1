import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Math & Simulation Logic ---
// In a real production system, this would call Spotify API, Essentia.js, and an NLP Sentiment model.
const simulateAcousticData = (genreCategory: string) => {
  let e = 0.5, bpm = 100, sv = 0;
  
  if (genreCategory === "party") {
     e = 0.75 + Math.random() * 0.20; // 0.75 - 0.95
     bpm = Math.floor(120 + Math.random() * 25); // 120 - 145
     sv = 0.4 + Math.random() * 0.5; // High sentiment
  } else if (genreCategory === "chill" || genreCategory === "love") {
     e = 0.15 + Math.random() * 0.30; // 0.15 - 0.45
     bpm = Math.floor(65 + Math.random() * 30); // 65 - 95
     sv = -0.3 + Math.random() * 0.7; // Variable sentiment, often melancholic
  } else if (genreCategory === "drive") {
     e = 0.55 + Math.random() * 0.30; // 0.55 - 0.85
     bpm = Math.floor(95 + Math.random() * 35); // 95 - 130
     sv = 0.3 + Math.random() * 0.6; // Energetic/Optimistic
  } else {
     e = 0.40 + Math.random() * 0.40;
     bpm = Math.floor(80 + Math.random() * 40);
     sv = -0.5 + Math.random() * 1.0;
  }
  
  // Random Bot Flag probability (e.g. 5% chance of being flagged as fake stream)
  const botFlag = Math.random() < 0.05;
  
  return { energy_score: e, bpm, sentiment_valence: sv, bot_flag: botFlag };
};

// --- Audius Fetcher ---
const APP_NAME = "FutureRadioIngestor";
const getAudiusHost = async () => {
    const res = await fetch('https://api.audius.co');
    const json = await res.json();
    return json.data[0];
};

const genresToScrape = [
  { id: "party", query: "edm" },
  { id: "party", query: "techno" },
  { id: "chill", query: "lofi chill" },
  { id: "love", query: "bollywood romance" },
  { id: "drive", query: "punjabi pop" },
  { id: "global", query: "indie pop" }
];

async function runIngestion() {
  console.log("🚀 Starting Future Radio Ingestion Engine (Phase 2)...");
  
  try {
     const host = await getAudiusHost();
     let totalIngested = 0;
     
     for (const category of genresToScrape) {
         console.log(`\nCrawling Audius for genre: ${category.id} (Query: '${category.query}')...`);
         const searchUrl = `${host}/v1/tracks/search?query=${encodeURIComponent(category.query)}&app_name=${APP_NAME}&limit=10`;
         
         const res = await fetch(searchUrl);
         if (!res.ok) {
             console.error(`Failed to fetch for ${category.query}: HTTP ${res.status}`);
             continue;
         }
         
         const json = await res.json();
         if (!json.data) continue;
         
         for (const track of json.data) {
             if (!track.duration || track.duration < 60) continue; // Skip very short clips
             
             const streamUrl = `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`;
             const simulatedData = simulateAcousticData(category.id);
             
             // Construct the row to save in Supabase
             const dbRow = {
                 track_id: track.id,
                 title: track.title,
                 artist: track.user?.name || "Unknown",
                 duration_seconds: track.duration,
                 stream_url: streamUrl,
                 genre_category: category.id,
                 energy_score: simulatedData.energy_score,
                 bpm: simulatedData.bpm,
                 sentiment_valence: simulatedData.sentiment_valence,
                 bot_flag: simulatedData.bot_flag,
                 ingested_at: new Date().toISOString()
             };
             
             // Upsert to Supabase
             const { error } = await supabase
                 .from("curated_tracks")
                 .upsert(dbRow, { onConflict: "track_id" });
                 
             if (error) {
                 console.error(`❌ DB Error for track ${track.id}:`, error.message);
             } else {
                 console.log(`✅ Ingested: [${category.id}] ${track.title.substring(0, 30)} (E: ${simulatedData.energy_score.toFixed(2)}, BPM: ${simulatedData.bpm})`);
                 totalIngested++;
             }
         }
     }
     console.log(`\n🎉 Ingestion Complete! Successfully indexed ${totalIngested} tracks into 'curated_tracks'.`);
  } catch (err) {
     console.error("Fatal Ingestion Error:", err);
  }
}

runIngestion();
