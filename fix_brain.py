import re

with open("app/api/broadcast/generate-hour/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update getSong Signature and Implementation
start_marker_getSong = "async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {"
end_marker_getSong = "async function getLocalAudioDuration(urlPath: string) {"

new_getSong = """async function getSong(vibeConfig: { query: string, derivedVibe: string } | string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {
  const isFallbackCall = typeof vibeConfig === "string" && vibeConfig === "fallback";
  const cleanQuery = typeof vibeConfig === "string" ? "fallback" : vibeConfig.query.replace(/official audio|official video/gi, "").trim();
  const derivedVibe = typeof vibeConfig === "string" ? cityId : vibeConfig.derivedVibe;
  
  if (!isFallbackCall) {
      // PHASE 3: THE BRAIN - Query Supabase Curated Tracks First
      const supabase = createClient();
      let query = supabase.from('curated_tracks').select('*').eq('bot_flag', false);
      
      // Apply F_Vibe formulas based on derivedVibe
      if (derivedVibe === 'party') {
          query = query.gte('energy_score', 0.70);
      } else if (derivedVibe === 'chill' || derivedVibe === 'love') {
          query = query.lte('energy_score', 0.50);
      } else if (derivedVibe === 'drive') {
          query = query.gte('energy_score', 0.50);
      }
      
      const { data: curatedTracks, error } = await query;
      
      if (!error && curatedTracks && curatedTracks.length > 0) {
          // Filter out played tracks and duration limits
          let validCurated = curatedTracks.filter(t => !playedSongs.has(t.track_id) && t.duration_seconds >= 120 && t.duration_seconds <= 420);
          
          if (validCurated.length > 0) {
              const track = validCurated[Math.floor(Math.random() * validCurated.length)];
              playedSongs.add(track.track_id);
              return {
                  id: track.track_id,
                  title: track.title,
                  artist: track.artist,
                  durationSeconds: track.duration_seconds,
                  streamUrl: track.stream_url
              };
          }
      }
      console.warn(`[Master Clock - The Brain] Supabase Query exhausted for vibe '${derivedVibe}'. Falling back to Audius Search.`);
  }

  // --- GRACEFUL DEGRADATION TO DIRECT AUDIUS SEARCH ---
  let allTracks = await searchAudiusTrack(cleanQuery);
  let tracks = allTracks.filter(t => t.durationSeconds && t.durationSeconds <= 420);

  if (tracks.length === 0) {
    tracks = await searchAudiusTrack("hindi lofi chill");
    if (tracks.length === 0) {
        // Local Fallback Logic
        const fallbacksDir = path.join(process.cwd(), "public", "audio", "fallbacks");
        let fallbackTrack: any = null;
        if (fs.existsSync(fallbacksDir)) {
          const files = fs.readdirSync(fallbacksDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
          if (files.length > 0) {
            const randomFile = files[Math.floor(Math.random() * files.length)];
            const urlPath = `/audio/fallbacks/${randomFile}`;
            try {
              const metadata = await mm.parseFile(path.join(fallbacksDir, randomFile));
              const durMs = Math.round((metadata.format.duration || 200) * 1000);
              fallbackTrack = {
                id: "system-fallback-" + Math.random().toString(36).substring(7),
                title: randomFile.replace(/\.[^/.]+$/, ""),
                artist: "Future Radio Premium Fallback",
                durationSeconds: durMs / 1000,
                streamUrl: urlPath
              };
            } catch(e) { }
          }
        }
        
        if (!fallbackTrack) {
          fallbackTrack = {
              id: "system-fallback-" + Math.random().toString(36).substring(7),
              title: "Future Radio Chill Mix (Backup)",
              artist: "System",
              durationSeconds: 339,
              streamUrl: "https://discoveryprovider.audius.co/v1/tracks/50ENP3g/stream?app_name=FutureRadio"
          };
        }
        playedSongs.add(fallbackTrack.id);
        return fallbackTrack as AudiusTrack;
    }
  }

  let validTracks = tracks.filter(t => !playedSongs.has(t.id) && t.durationSeconds >= 120 && t.durationSeconds <= 420);
  if (validTracks.length === 0) {
      validTracks = tracks.filter(t => !playedSongs.has(t.id));
      if (validTracks.length === 0) {
          playedSongs.clear();
          validTracks = tracks.filter(t => t.durationSeconds >= 120 && t.durationSeconds <= 420);
          if (validTracks.length === 0) validTracks = tracks;
      }
  }

  const track = validTracks[Math.floor(Math.random() * validTracks.length)];
  playedSongs.add(track.id);
  return track;
}

"""

try:
    idx_start = content.index(start_marker_getSong)
    idx_end = content.index(end_marker_getSong)
    content = content[:idx_start] + new_getSong + content[idx_end:]
except ValueError:
    print("Could not replace getSong")

# 2. Update getSong Calls
content = content.replace("await getSong(getSearchQueryForGenre(cityId).query, cityId, playedSongs)", "await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs)")
content = content.replace("await getSong(getSearchQueryForGenre(cityId, targetEndTime.toISOString()).query, cityId, playedSongs)", "await getSong(getSearchQueryForGenre(cityId, targetEndTime.toISOString()), cityId, playedSongs)")
content = content.replace("const song = await getSong(getSearchQueryForGenre(cityId).query, cityId, playedSongs);", "const song = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);")


with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Phase 3 Refactoring Complete!")
