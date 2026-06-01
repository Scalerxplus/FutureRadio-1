const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    // Attempt to read as utf16le which might fix the corrupted characters
    const envContentUtf16 = fs.readFileSync(envPath, "utf16le"); 
    const envContentUtf8 = fs.readFileSync(envPath, "utf8");
    const combinedContent = envContentUtf16 + "\n" + envContentUtf8;
    const lines = combinedContent.split("\n");
    for (const line of lines) {
      if (line.includes("NEXT_PUBLIC_SUPABASE_URL=")) supabaseUrl = line.split("=")[1].trim();
      if (line.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) supabaseAnonKey = line.split("=")[1].trim();
    }
  }
} catch (e) {}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const sweepersDir = path.join(__dirname, "public", "audio", "Sweepers");
  const files = fs.readdirSync(sweepersDir).filter(f => f.endsWith(".mp3"));
  
  const sweepersToInsert = [];
  
  for (const file of files) {
    const fLower = file.toLowerCase();
    let genre = "global";
    if (fLower.includes("chill")) genre = "chill";
    else if (fLower.includes("party")) genre = "party";
    else if (fLower.includes("drive")) genre = "drive";
    else if (fLower.includes("romance")) genre = "romance";
    else if (fLower.includes("news")) genre = "news";
    
    // Auto-calculate energy score
    let energyScore = 0.5; // default mid
    if (genre === "party") energyScore = 0.9;
    else if (genre === "drive") energyScore = 0.7;
    else if (genre === "chill") energyScore = 0.3;
    else if (genre === "romance") energyScore = 0.2;
    else if (genre === "news") energyScore = 0.5;
    
    const filePath = path.join(sweepersDir, file);
    let durationMs = 10000; // default 10s
    try {
      const metadata = await mm.parseFile(filePath);
      durationMs = Math.round((metadata.format.duration || 10) * 1000);
    } catch(e) {}
    
    sweepersToInsert.push({
      media_url: `/audio/Sweepers/${file}`,
      genre: genre,
      energy_score: energyScore,
      duration_ms: durationMs
    });
  }
  
  console.log(`Prepared ${sweepersToInsert.length} sweepers for insertion...`);
  
  // Wipe existing rows (if any) and insert fresh
  const { error: delErr } = await supabase.from('curated_sweepers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error("Error wiping old sweepers. Did you create the table? Error:", delErr.message);
    process.exit(1);
  }
  
  const { error: insErr } = await supabase.from('curated_sweepers').insert(sweepersToInsert);
  if (insErr) {
    console.error("Error inserting sweepers:", insErr.message);
  } else {
    console.log("Successfully seeded curated_sweepers table!");
  }
}
seed();
