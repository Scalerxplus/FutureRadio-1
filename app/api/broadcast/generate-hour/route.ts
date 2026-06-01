import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { searchAudiusTrack, AudiusTrack } from "@/lib/audius";
import { searchJamendoTrack } from "@/lib/jamendo";
import { searchPodcastEpisode } from "@/lib/itunes";
import { fetchContextualAd, SspContext } from "@/lib/ssp";
import * as mm from "music-metadata";
import path from "path";
import fs from "fs";
import { getLiveWeather } from "@/lib/live-data";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_build_key" });
const ytCache = new Map<string, { video: any; expiresAt: number }>();

const globalPlayedSweepers = new Set<string>();
const globalPlayedJingles = new Set<string>();

function getSweeperByGenre(genre: string) {
  try {
    const sweepersDir = path.join(process.cwd(), "public", "audio", "Sweepers");
    if (fs.existsSync(sweepersDir)) {
      let files = fs.readdirSync(sweepersDir).filter(f => f.endsWith(".mp3"));
      if (genre.toLowerCase() !== "global") {
        files = files.filter(f => f.toLowerCase().includes(`sweeper_${genre.toLowerCase()}`));
      }
      if (files.length > 0) {
        return `/audio/Sweepers/${files[Math.floor(Math.random() * files.length)]}`;
      }
    }
  } catch (e) {}
  
  const sweepers = [
    `/audio/Sweepers/Sweeper_${genre}_01.mp3`,
    `/audio/Sweepers/Sweeper_${genre}_02.mp3`,
    `/audio/Sweepers/Sweeper_${genre}_03.mp3`,
    `/audio/Sweepers/Sweeper_${genre}_04.mp3`,
  ];
  return sweepers[Math.floor(Math.random() * sweepers.length)];
}

function getJingleByGenre(genre: string) {
  try {
    const jinglesDir = path.join(process.cwd(), "public", "audio", "jingles");
    if (fs.existsSync(jinglesDir)) {
      const files = fs.readdirSync(jinglesDir).filter(f => f.toLowerCase().includes(`station_jingle_`) && f.endsWith(".mp3"));
      if (files.length > 0) {
        return `/audio/jingles/${files[Math.floor(Math.random() * files.length)]}`;
      }
    }
  } catch (e) {}
  
  return `/audio/jingles/Station_Jingle_chill.mp3`;
}

const STATION_VOICES = {
  "PM": { name: "Future Radio Core", voiceId: "pm" },
  "AIRA": { name: "Future Radio Nova", voiceId: "aira" }
};

const PREMIUM_GENRES = {
  drive: {
    punjabi: ["punjabi pop", "punjabi hip hop", "desi hip hop", "punjabi rap", "upbeat punjabi"],
    hindi: ["bollywood hits", "desi indie", "hindi pop", "mumbai pop", "hindi upbeat", "bollywood dance"],
    intl: ["pop hits", "top 40", "indie pop", "upbeat indie", "commercial pop", "synth pop"]
  },
  chill: {
    punjabi: ["punjabi lofi", "punjabi chill", "punjabi acoustic", "punjabi slow", "desi chill"],
    hindi: ["hindi lofi", "desi lofi", "hindi chillwave", "indian ambient", "bollywood lofi chill"],
    intl: ["lofi beats", "chillout", "ambient electronic", "chillhop", "night drive lo-fi"]
  },
  party: {
    punjabi: ["punjabi trap", "punjabi edm", "bhangra bass", "desi trap", "punjabi dj"],
    hindi: ["desi bass", "hindi edm", "bollywood house", "mumbai dance", "indian edm", "hindi club mix"],
    intl: ["tech house", "festival bass", "electronic dance", "house mix", "progressive house", "edm"]
  },
  romance: {
    punjabi: ["punjabi romantic", "punjabi sad song", "punjabi acoustic romance", "sufi romantic"],
    hindi: ["bollywood romantic", "hindi love songs", "urdu romantic", "desi soul", "hindi acoustic"],
    intl: ["r&b romance", "slow jams", "acoustic love", "soulful pop", "indie folk romance"]
  },
  news: {
    // For news we still play instrumental or very light music in the background or fallback tracks
    punjabi: ["punjabi instrumental", "desi background score"],
    hindi: ["indian classical chill", "hindi instrumental", "news background music"],
    intl: ["corporate background", "light electronic", "ambient background", "documentary music"]
  }
};


let globalEnergyToggle = false;

function getSearchQueryForGenre(genre: string, targetTimeIso?: string): { query: string, derivedVibe: string } {
  let vibe = genre.toLowerCase();
  
  if (vibe === "global" && targetTimeIso) {
    try {
      const timePart = targetTimeIso.split('T')[1];
      const hour = parseInt(timePart.split(':')[0], 10);
      
      if (hour >= 7 && hour < 12) {
        // Morning: mid to high energy indie
        globalEnergyToggle = !globalEnergyToggle;
        vibe = globalEnergyToggle ? "drive" : "chill"; // drive for high, chill for mid
      } else if (hour >= 12 && hour < 17) {
        // Afternoon: mid to low
        vibe = "chill";
      } else if (hour >= 17 && hour < 21) {
        // Evening: punjabi/intl high energy
        vibe = "party"; // we will force punjabi/intl in the query roll
      } else {
        // Night: edm, house, trap
        vibe = "party";
      }
    } catch(e) {
      vibe = "drive";
    }
  }

  if (!PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES]) {
      vibe = "drive";
  }

  const roll = Math.random() * 100;
  let categoryArray = [];
  
  // Custom force for global evening
  if (genre.toLowerCase() === "global" && targetTimeIso) {
    const hour = parseInt(targetTimeIso.split('T')[1].split(':')[0], 10);
    if (hour >= 17 && hour < 21) {
      // Evening: punjabi and international indie music, high energy
      categoryArray = roll < 50 ? PREMIUM_GENRES["party"].punjabi : PREMIUM_GENRES["party"].intl;
      return { query: categoryArray[Math.floor(Math.random() * categoryArray.length)], derivedVibe: "party" };
    }
    if (hour >= 21 || hour < 7) {
      // Night: indie trance, house, trap, edm mixes
      const nightGenres = ["indie trance", "house mix", "trap edm", "festival bass", "progressive house"];
      return { query: nightGenres[Math.floor(Math.random() * nightGenres.length)], derivedVibe: "party" };
    }
    if (hour >= 7 && hour < 12) {
      const morningGenres = globalEnergyToggle ? ["upbeat indie", "hindi pop", "commercial pop"] : ["desi indie", "indie pop"];
      return { query: morningGenres[Math.floor(Math.random() * morningGenres.length)], derivedVibe: globalEnergyToggle ? "drive" : "chill" };
    }
  }

  if (roll < 35) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].punjabi;
  } else if (roll < 70) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].hindi;
  } else {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].intl;
  }
  
  return { query: categoryArray[Math.floor(Math.random() * categoryArray.length)], derivedVibe: vibe };
}

async function getSong(vibeConfig: { query: string, derivedVibe: string } | string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {
  const isFallbackCall = typeof vibeConfig === "string" && vibeConfig === "fallback";
  const cleanQuery = typeof vibeConfig === "string" ? "fallback" : vibeConfig.query.replace(/official audio|official video/gi, "").trim();
  const derivedVibe = typeof vibeConfig === "string" ? cityId : vibeConfig.derivedVibe;
  
  // --- NEWS/TALK STATION PODCAST ROUTING ---
  if (cityId === "news" && !isFallbackCall) {
      const topics = ["technology", "finance", "artificial intelligence", "startups", "wellness", "business", "career", "leadership"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const podcast = await searchPodcastEpisode(randomTopic, playedSongs);
      if (podcast && !podcast.id.startsWith("system-fallback")) {
          playedSongs.add(podcast.id);
      }
      return podcast;
  }

  if (!isFallbackCall) {
      // --- HYBRID QUALITY-WEIGHTED ROUTER ---
      const routerRoll = Math.random();
      
      // Attempt Source 1: The Premium Hub (Supabase Curated) - 30% probability OR if fallback from lower tiers
      if (routerRoll <= 0.30) {
          const supabase = createClient();
          let query = supabase.from('curated_tracks').select('*').eq('bot_flag', false);
          
          if (derivedVibe === 'party') query = query.gte('energy_score', 0.70);
          else if (derivedVibe === 'chill' || derivedVibe === 'love') query = query.lte('energy_score', 0.50);
          else if (derivedVibe === 'drive') query = query.gte('energy_score', 0.50);
          
          const { data: curatedTracks, error } = await query;
          if (!error && curatedTracks && curatedTracks.length > 0) {
              let validCurated = curatedTracks.filter(t => !playedSongs.has(t.track_id) && t.duration_seconds >= 120 && t.duration_seconds <= 420);
              if (validCurated.length > 0) {
                  const track = validCurated[Math.floor(Math.random() * validCurated.length)];
                  playedSongs.add(track.track_id);
                  return {
                      id: track.track_id, title: track.title, artist: track.artist,
                      durationSeconds: track.duration_seconds, streamUrl: track.stream_url,
                      permalink: "", license: "CC-BY"
                  };
              }
          }
          console.warn(`[Hybrid Engine] Supabase Curated exhausted for '${derivedVibe}'. Falling back to Jamendo.`);
      }

      // Attempt Source 2: The Indie Hub (Jamendo API) - 30% probability (0.60 to 0.90) OR fallback from Supabase
      if (routerRoll <= 0.90) {
          const jamendoQuery = typeof vibeConfig === "string" ? "pop" : vibeConfig.query;
          const jamendoTracks = await searchJamendoTrack(jamendoQuery);
          let validJamendo = jamendoTracks.filter(t => !playedSongs.has(t.id) && t.durationSeconds >= 120 && t.durationSeconds <= 420);
          if (validJamendo.length > 0) {
              const track = validJamendo[Math.floor(Math.random() * validJamendo.length)];
              playedSongs.add(track.id);
              return track;
          }
          console.warn(`[Hybrid Engine] Jamendo exhausted for '${derivedVibe}'. Falling back to Audius.`);
      }
      
      // Attempt Source 3: The Decentralized Backup (Audius API) - 10% probability (0.90 to 1.0) OR fallback from Jamendo
      let audiusTracks = await searchAudiusTrack(cleanQuery);
      let validAudius = audiusTracks.filter(t => !playedSongs.has(t.id) && t.durationSeconds >= 120 && t.durationSeconds <= 420);
      
      if (validAudius.length > 0) {
          const track = validAudius[Math.floor(Math.random() * validAudius.length)];
          playedSongs.add(track.id);
          return track;
      }
      console.warn(`[Hybrid Engine] Audius exhausted for '${cleanQuery}'. Triggering safety clear.`);
  }

  // --- STATIC EXHAUSTION FALLBACK ---
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
                streamUrl: urlPath,
                permalink: "",
                license: "CC-BY"
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
              streamUrl: "https://discoveryprovider.audius.co/v1/tracks/50ENP3g/stream?app_name=FutureRadio",
              permalink: "https://audius.co/future/chill-mix",
              license: "CC-BY"
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

async function getLocalAudioDuration(urlPath: string) {
  try {
    const filePath = path.join(process.cwd(), "public", urlPath);
    const metadata = await mm.parseFile(filePath);
    return Math.round((metadata.format.duration || 10) * 1000);
  } catch (e) {
    // console.error("[Master Clock] Error reading audio duration", e);
    // Return 3 seconds for Zappers, 10 seconds for sweepers if missing
    return 10000;
  }
}

async function getJocktalk(
  cityId: string, 
  istHour: number,
  currentShow: any,
  topic: string, 
  segmentIndex: number, 
  previousSongTitle: string, 
  upcomingSongTitle: string,
  liveWeather: string,
  localNewsCache: any,
  customRjPrompt: string = ""
) {
  const stationProfile = STATION_VOICES[currentShow.rj as keyof typeof STATION_VOICES] || STATION_VOICES["PM"];
  const isNightPersona = currentShow.id === "global_club";
  
  let hookContent = "";
  if (segmentIndex === 1) {
      hookContent = `[CLB Part 1 - System Hook]: You MUST start with a crisp, self-aware station identifier. Acknowledge your existence as Future Radio.`;
  } else {
      hookContent = `[CLB Part 1 - System Hook]: You MUST start by praising the previous song played (${previousSongTitle}) and giving brief credit to the artist. Establish your presence as Future Radio.`;
  }

  let localNewsProgress = "";
  if (topic && topic.includes("[DEMAND_OF_THE_HOUR]")) {
      localNewsProgress = `[CLB Part 3 - DEMAND OF THE HOUR]: ${topic}`;
  } else if (localNewsCache && localNewsCache.headline) {
      localNewsProgress = `[CLB Part 3 - Hyper-Local Dynamic Content]: Discuss this Breaking Local Utility/Infra News factually: "${localNewsCache.headline}" - ${localNewsCache.description}. Provide a highly intelligent, data-driven update for ${cityId}.`;
  } else if (topic) {
      localNewsProgress = `[CLB Part 3 - Dynamic Core Topic]: The producer has requested you to broadcast this specific data point: "${topic}". Weave this naturally into the stream.`;
  } else {
      localNewsProgress = `[CLB Part 3 - Dynamic Core Content]: Share a deep, factual, and intelligent trivia or psychological fact about the music industry, or deeply praise the artist of the previous song (${previousSongTitle}). Add value, do not hallucinate local news!`;
  }

  let timeOfDay = "Day";
  if (istHour >= 4 && istHour < 12) timeOfDay = "Morning";
  else if (istHour >= 12 && istHour < 17) timeOfDay = "Afternoon";
  else if (istHour >= 17 && istHour < 21) timeOfDay = "Evening";
  else timeOfDay = "Night";

  const isEnglishForced = customRjPrompt.includes("[FORCED_LANG:en]");

  const prompt = `${customRjPrompt || `You are 'Future Radio', an underground music discoverer and highly advanced AI broadcasting system serving ${cityId}. You hype up tracks as exclusive independent gems from the global Audius Web3 scene.`}

Show Context:
- Current Time: ${istHour}:00 IST (${timeOfDay}) in ${cityId}.
- Show Vibe: ${currentShow.contentStrategy}

CRITICAL RULES FOR GENERATION - YOU MUST STRICTLY FOLLOW THIS HYPER-LOCAL CLB FORMAT:
0. [CRITICAL GRAMMAR CONSTRAINT]: You MUST speak 100% in FLUENT ENGLISH. Do not use Hindi anywhere except for the final closing tag. You MUST NEVER use first-person singular pronouns like "I", "me", or "my". You are the collective voice of the station, so you MUST ONLY use "we", "us", or "our".
1. ${hookContent}
2. [CLB Part 2 - Hyper-Local Utility]: Seamlessly mention the city "${cityId}" and weave in the current live weather (${liveWeather}) and simulate a brief hyper-local traffic/infra update. Be strictly aware of the time (${timeOfDay}).
3. ${localNewsProgress}
4. [CLB Part 4 - Predictive Audio Tease]: State that we have discovered and queued up the next track: "${upcomingSongTitle}" directly from the underground Audius scene. Hype it as an exclusive drop (e.g. "Only on Future Radio").
5. [CLB Part 5 - Outro]: Always end your transmission EXACTLY with: "Stay locked to Future Radio. Ab future suno."

MANDATORY DURATION & STYLE:
- LENGTH: You MUST write exactly 80 to 100 words (approx 35-40 seconds of speaking time). BE CRISP, FACTUAL, AND SHARP.
- LANGUAGE: Fluent, dynamic, high-energy English. Sound like a premium, intelligent AI system.
- MICRO-PAUSES: Use [pause] heavily between heavy facts to simulate processing.

Output ONLY the raw script text. Do not output any titles, brackets, or translations.`;
    
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
    });
    return chatCompletion.choices[0]?.message?.content || "Data stream active. Enjoy the music on Future Radio.";
  } catch(e) {
    return `You are tuned into Future Radio, the pulse of ${cityId}. I am your station intelligence, curating the best sounds for your ${timeOfDay}. It is absolutely beautiful in ${cityId} today with perfect weather. Our algorithms show smooth traffic ahead, so relax. Keep vibing with us because my systems have queued up an absolute chartbuster next, "${upcomingSongTitle}". Stay locked to Future Radio. Ab future suno.`;
  }
}

async function getTrendingHourlyTopic(cityId: string, currentShow: any) {
  // HitL architecture: We no longer hallucinate news topics using an LLM.
  // If a human hasn't overridden the topic, we return nothing.
  return "";
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const cityId = url.searchParams.get("city") || "raipur";
    const startTimeParam = url.searchParams.get("startTime");
    let startTime = startTimeParam ? new Date(startTimeParam) : new Date();
    
    // STRICT TOTH SYNC: Always anchor the start time to the Top of the Hour in IST
    // Since IST is UTC+5:30, simply using setMinutes(0) on a UTC Node server causes a 30-minute shift bug!
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTimeMs = startTime.getTime() + istOffsetMs;
    const istDate = new Date(istTimeMs);
    istDate.setUTCMinutes(0, 0, 0);
    startTime = new Date(istDate.getTime() - istOffsetMs);
    
    // Generate schedule ONLY until the end of the current hour (xx:59:59)
    const targetEndTime = new Date(startTime.getTime() + 59 * 60 * 1000 + 59 * 1000 + 999);

    const stationProfile = STATION_VOICES["PM"]; // Default voice profile for UI

    console.log(`[Master Clock] Generating channel playlist for Genre: ${cityId} at ${startTime.toISOString()}`);

    // --- HITL: Fetch Global Station Settings ---
    let globalRjPrompt = "";
    let forceLanguage = "hi";
    let forceVoiceId = "pm";

    const { data: settingsData } = await supabase
      .from("station_settings")
      .select("*")
      .eq("city_id", cityId)
      .limit(1);

    if (settingsData && settingsData.length > 0) {
      if (settingsData[0].rj_prompt) globalRjPrompt = settingsData[0].rj_prompt;
      if (settingsData[0].language) forceLanguage = settingsData[0].language;
      if (settingsData[0].voice_id) forceVoiceId = settingsData[0].voice_id;

      // Hack to pass language constraint to getJocktalk without changing signature
      if (forceLanguage === "en") {
        globalRjPrompt = "[FORCED_LANG:en]" + globalRjPrompt;
      }
    }

    // --- HITL: Check for Human-In-The-Loop Override ---
    let selectedHourlyTopic = "";
    const { data: overrideData } = await supabase
      .from("jocktalk_overrides")
      .select("*")
      .eq("city_id", cityId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);

    if (overrideData && overrideData.length > 0) {
      selectedHourlyTopic = "[HUMAN SCRIPT OVERRIDE] " + overrideData[0].topic_text;
      console.log(`[Master Clock] HITL Override detected! Prioritizing human script: ${selectedHourlyTopic}`);
      
      // Mark as used so we don't repeat it next hour
      await supabase
        .from("jocktalk_overrides")
        .update({ status: "used" })
        .eq("id", overrideData[0].id);
    }

    // --- FETCH HYPER-LOCAL NEWS CACHE ---
    let localNewsItems: any[] = [];
    try {
      const { data: newsData } = await supabase
        .from("local_news_cache")
        .select("*")
        .eq("city_id", cityId)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (newsData && newsData.length > 0) {
         localNewsItems = newsData;
         // Mark them as read
         await supabase.from("local_news_cache")
           .update({ is_read: true })
           .in("id", localNewsItems.map(n => n.id));
      }
    } catch (e) {
      console.error("[Master Clock] Error fetching local news cache", e);
    }

    const liveWeather = await getLiveWeather(cityId);

    const schedule: any[] = [];
    let currentTimeMs = startTime.getTime();

    const addElement = (type: any, durationMs: number, urlOrId: string, metadata: any = {}) => {
      let finalDurationMs = durationMs;
      
      // HARD STOP: Never overshoot the 60-minute hot clock boundary (xx:59:59)
      if (currentTimeMs + finalDurationMs > targetEndTime.getTime()) {
         finalDurationMs = targetEndTime.getTime() - currentTimeMs;
         metadata.isCapped = true; // Mark as capped so the frontend knows to cut it off gracefully
      }

      const blockId = crypto.randomUUID();
      schedule.push({
        id: blockId,
        city_id: cityId,
        start_time: new Date(currentTimeMs).toISOString(),
        end_time: new Date(currentTimeMs + finalDurationMs).toISOString(),
        duration_ms: finalDurationMs,
        element_type: type,
        [type === 'song' ? 'youtube_id' : 'media_url']: urlOrId,
        metadata
      });
      currentTimeMs += finalDurationMs;
      return blockId;
    };

    // Helper to calculate a safe song duration and prevent the "2-second zapper bug"
    const getSafeSongDuration = (song: AudiusTrack) => {
      let durMs = Math.round((song.durationSeconds || 0) * 1000);
      if (durMs < 60000) durMs = 240000; // Fallback to 4 mins if search returns a short clip or 0
      return durMs; // No more Math.min cap, let the song play fully!
    };

    let segmentIndex = 1;
    let lastSongTitle = "nothing";
    const playedSongs = new Set<string>();

    // --- GLOBAL CROSS-STATION ANTI-REPETITION COOLDOWN (6 HOURS) ---
    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
        const { data: recentHistory, error: historyErr } = await supabase
            .from("broadcast_schedule")
            .select("youtube_id")
            .eq("element_type", "song")
            .gte("start_time", sixHoursAgo);
            
        if (!historyErr && recentHistory) {
            recentHistory.forEach(row => {
                if (row.youtube_id) playedSongs.add(row.youtube_id);
            });
            console.log(`[Master Clock] Pre-seeded ${playedSongs.size} tracks into global cooldown memory (Last 6 Hours).`);
        }
    } catch(e) {
        console.error("[Master Clock] Failed to fetch global cooldown memory:", e);
    }
    // Preflight Check: Is the Audius API down?
    const preflightSong = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);
    const isFallbackMode = preflightSong.id.startsWith("system-fallback");
    if (!isFallbackMode) {
        playedSongs.delete(preflightSong.id);
    } else {
        console.warn("[Master Clock] Preflight failed. Engaging STRICT FALLBACK MODE for this hour.");
    }


    // --- DYNAMIC TIME-SLICING ALGORITHM (DAYPARTING & MANUAL RJs) ---
    
    // Determine Dayparting Mode
    const currentIstHour = istDate.getUTCHours();
    const isNightMode = currentIstHour >= 2 && currentIstHour < 7;
    console.log(`[Master Clock] Current IST Hour: ${currentIstHour} | Night Mode: ${isNightMode}`);

    // Pre-fetch Manual Jocktalks from DB
    let manualJocktalks: any[] = [];
    let totalManualJtDurMs = 0;
    if (!isNightMode) {
         try {
             const { data: dbJts } = await supabase
                 .from('manual_jocktalks')
                 .select('media_url, duration_ms, slot_index')
                 .eq('hour_block', currentIstHour)
                 .order('slot_index', { ascending: true });
                 
             if (dbJts && dbJts.length > 0) {
                 manualJocktalks = dbJts;
                 totalManualJtDurMs = dbJts.reduce((acc, curr) => acc + curr.duration_ms, 0);
             }
         } catch(e) {
             console.error("[Master Clock] Error fetching manual jocktalks:", e);
         }
    }

    // 1. TOTH Station Jingle (Always Segment 0)
    let totalScheduledDurationMs = 0;
    const stationId = getJingleByGenre(cityId);
    const stationIdDur = await getLocalAudioDuration(stationId);
    addElement('station_id', stationIdDur, stationId, { title: "Station ID" });
    totalScheduledDurationMs += stationIdDur;
    
    // 2. Pre-fetch Songs to fill the hour
    const TARGET_HOUR_MS = 3600 * 1000;
    const AD_DURATION_MS = 30000;
    const NUM_ADS = 4;
    const NUM_JTS = (isNightMode || cityId === "news") ? 0 : 4;
    const TOTAL_AD_TIME_MS = AD_DURATION_MS * NUM_ADS;
    
    const prefetchSongs: any[] = [];
    const prefetchSweepers: any[] = [];
    let currentMusicDuration = 0;
    
    // We fetch songs until we hit roughly 50-55 minutes, accounting for Ads and actual Manual Jocktalk durations
    while (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS + totalManualJtDurMs < (TARGET_HOUR_MS - 60000)) {
        if (isFallbackMode) {
             const fallbackTrack = await getSong("fallback", cityId, playedSongs);
             const dur = getSafeSongDuration(fallbackTrack);
             prefetchSongs.push({ type: 'song', song: fallbackTrack, duration: dur });
             currentMusicDuration += dur;
             
             const sw = getSweeperByGenre(cityId);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        } else {
             const song = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);
             const dur = getSafeSongDuration(song);
             prefetchSongs.push({ type: 'song', song, duration: dur });
             currentMusicDuration += dur;
             
             const sw = getSweeperByGenre(cityId);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        }
    }
    
    // Now assemble the precise hour schedule
    let jtCount = 0;
    let adCount = 0;
    
    for (let i = 0; i < prefetchSongs.length; i++) {
        // Add the song
        const s = prefetchSongs[i].song;
        addElement('song', prefetchSongs[i].duration, s.streamUrl, { title: s.title, artist: s.artist, trackId: s.id, permalink: s.permalink });
        
        // Add Sweeper
        if (prefetchSweepers[i]) {
            addElement('sweeper', prefetchSweepers[i].duration, prefetchSweepers[i].url, { title: "Radio Sweeper" });
        }
        
        // After every 2 songs, drop an Ad or a JT
        if ((i + 1) % 2 === 0) {
            if (adCount < NUM_ADS && jtCount < NUM_JTS) {
                if ((i + 1) % 4 === 0) {
                    // AD Insertion
                    const sspContext = { cityId: cityId, liveWeather: liveWeather, timeOfDay: "evening" };
                    const adDecision = await fetchContextualAd(sspContext);
                    if (adDecision && adDecision.mediaUrl) {
                        addElement('sweeper', adDecision.durationMs, adDecision.mediaUrl, { title: adDecision.campaignTitle, isAd: true });
                    } else {
                        const fillerSw = getSweeperByGenre(cityId);
                        const dur = await getLocalAudioDuration(fillerSw);
                        addElement('sweeper', dur, fillerSw, { title: "Ad Fallback Sweeper" });
                    }
                    adCount++;
                } else {
                    // JT Insertion (Manual Pre-Produced)
                    const targetSlot = jtCount + 1;
                    const manualJt = manualJocktalks.find(j => j.slot_index === targetSlot);
                    
                    if (manualJt) {
                        addElement('jocktalk', manualJt.duration_ms, manualJt.media_url, { 
                            title: `Live Studio RJ (Segment ${targetSlot})`, 
                            rjName: "Future Radio Live",
                            isEmptyPlaceholder: false 
                        });
                    } else {
                        // Fallback if RJ forgot to upload for this slot
                        const fillerSw = getSweeperByGenre(cityId);
                        const dur = await getLocalAudioDuration(fillerSw);
                        addElement('sweeper', dur, fillerSw, { title: "Station Sweeper (JT Fallback)" });
                    }
                    jtCount++;
                }
            }
        }
    }

    // Wipe any existing schedule blocks in this hour window to allow clean JIT regeneration
    await supabase
      .from("broadcast_schedule")
      .delete()
      .eq("city_id", cityId)
      .gte("start_time", new Date(startTime.getTime()).toISOString())
      .lt("start_time", new Date(targetEndTime).toISOString());

    const { error } = await supabase.from("broadcast_schedule").insert(schedule);

    if (error) {
      console.error("[Master Clock] Insert failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${schedule.length} elements for channel ${cityId}.`,
      schedule
    });

  } catch (err: any) {
    console.error("[Master Clock] Failed to generate hour:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
