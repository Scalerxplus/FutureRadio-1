const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Read .env.local manually
let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const lines = envContent.split("\n");
    for (const line of lines) {
      if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
        supabaseUrl = line.split("=")[1].trim();
      }
      if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) {
        supabaseAnonKey = line.split("=")[1].trim();
      }
    }
  }
} catch (e) {
  console.error("Failed to read .env.local:", e.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanHorseAudio() {
  console.log("Connecting to Supabase to clean up screaming horse audio...");

  // Update existing playlist blocks where rj_audio_url is the horse neighing sound
  const { error } = await supabase
    .from("playlist_blocks")
    .update({
      rj_audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    })
    .eq("rj_audio_url", "https://www.w3schools.com/html/horse.mp3");

  if (error) {
    console.error("Failed to update database rows:", error.message);
  } else {
    console.log("Successfully cleaned up horse audio references inside the remote database!");
  }

  // Also verify what blocks exist in the database
  const { data: blocks } = await supabase
    .from("playlist_blocks")
    .select("block_id, song_title, rj_audio_url");

  console.log("Current Playlist Blocks in Database:");
  console.log(blocks);
}

cleanHorseAudio();
