import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { searchAudiusTrack, AudiusTrack } from "@/lib/audius";
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

function getSweeperByGenre(energy: string) {
  try {
    const sweepersDir = path.join(process.cwd(), "public", "audio", "Sweepers");
    const allSweepers = fs.readdirSync(sweepersDir)
      .filter(f => f.endsWith('.mp3') || f.endsWith('.wav'))
      .map(f => `/audio/Sweepers/${f}`);
      
    let list = allSweepers.filter(s => !s.toLowerCase().includes("high") && !s.toLowerCase().includes("lofi") && !s.toLowerCase().includes("low"));
    if (energy === "high") list = allSweepers.filter(s => s.toLowerCase().includes("high"));
    if (energy === "low") list = allSweepers.filter(s => s.toLowerCase().includes("lofi") || s.toLowerCase().includes("low"));
    
    if (list.length === 0) list = allSweepers;
    
    let available = list.filter(s => !globalPlayedSweepers.has(s));
    if (available.length === 0) {
        available = list;
        list.forEach(s => globalPlayedSweepers.delete(s)); // Reset only this category
    }
    
    const picked = available[Math.floor(Math.random() * available.length)];
    globalPlayedSweepers.add(picked);
    return picked;
  } catch (e) {
    return "/audio/Sweepers/Sweeper_Desi_High_Energy_01.mp3";
  }
}

function getJingleByGenre(energy: string) {
  try {
    const jinglesDir = path.join(process.cwd(), "public", "audio", "jingles");
    const allJingles = fs.readdirSync(jinglesDir)
      .filter(f => (f.endsWith('.mp3') || f.endsWith('.wav')) && (f.toLowerCase().includes('jingle') || f.toLowerCase().includes('id')))
      .map(f => `/audio/jingles/${f}`);
      
    let list = allJingles.filter(s => !s.toLowerCase().includes("edm") && !s.toLowerCase().includes("high") && !s.toLowerCase().includes("lofi") && !s.toLowerCase().includes("low"));
    if (energy === "high") list = allJingles.filter(s => s.toLowerCase().includes("edm") || s.toLowerCase().includes("high"));
    if (energy === "low") list = allJingles.filter(s => s.toLowerCase().includes("lofi") || s.toLowerCase().includes("low"));
    
    if (list.length === 0) list = allJingles;
    
    let available = list.filter(s => !globalPlayedJingles.has(s));
    if (available.length === 0) {
        available = list;
        list.forEach(s => globalPlayedJingles.delete(s));
    }
    
    const picked = available[Math.floor(Math.random() * available.length)];
    globalPlayedJingles.add(picked);
    return picked;
  } catch (e) {
    return "/audio/jingles/Station_Jingle_EDM.mp3";
  }
}

const SHOWS = [
  { id: "morning_zen", name: "Morning Zen", rj: "PM", startHour: 6, endHour: 8, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Morning business news, pre-market analysis, global economy summaries, very factual." },
  { id: "morning_drive", name: "The Morning Drive", rj: "PM", startHour: 8, endHour: 11, energy: "high", musicQuery: "High energy latest bollywood punjabi trending highest played songs", contentStrategy: "Opening bell insights, corporate news, Indian tycoons, fast-paced financial data." },
  { id: "mid_day", name: "Mid-Day Cafe", rj: "PM", startHour: 11, endHour: 16, energy: "mid", musicQuery: "Easy listening latest hit songs", contentStrategy: "Mid-day market updates, sports scores, economy deep dives, intellectual analysis." },
  { id: "evening_rush", name: "Evening Rush", rj: "PM", startHour: 16, endHour: 20, energy: "high", musicQuery: "High energy bollywood punjabi trending hit songs", contentStrategy: "Market closing bells, GDP stats, major sports/cricket news, celebrity business ventures." },
  { id: "global_club", name: "The Global Club", rj: "PM", startHour: 20, endHour: 1, energy: "high", musicQuery: "EDM globally trending dj mixes dance music songs", contentStrategy: "Global markets, international business, late-night breaking news, fast-paced reports." },
  { id: "night_shift", name: "Night Shift", rj: "PM", startHour: 1, endHour: 6, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Economy retrospectives, long-form factual storytelling, sports history, very serious tone." },
];

const STATION_VOICES = {
  "PM": { name: "Future Radio Core", voiceId: "pm" },
  "AIRA": { name: "Future Radio Nova", voiceId: "aira" }
};

const PREMIUM_GENRES = {
  chill: {
    punjabi: ["punjabi lofi", "punjabi chill", "punjabi acoustic", "punjabi slow", "desi chill"],
    hindi: ["hindi lofi", "desi lofi", "hindi chillwave", "indian ambient", "bollywood lofi chill"],
    intl: ["lofi beats", "chillout", "ambient electronic", "chillhop", "night drive lo-fi"]
  },
  party: {
    punjabi: ["punjabi trap", "punjabi edm", "bhangra bass", "desi trap", "punjabi dj"],
    hindi: ["desi bass", "hindi edm", "bollywood house", "mumbai dance", "indian edm"],
    intl: ["tech house", "festival bass", "electronic dance", "house mix", "bass boost"]
  },
  indie: {
    punjabi: ["punjabi pop", "punjabi hip hop", "desi hip hop", "punjabi rap"],
    hindi: ["desi indie", "hindi pop", "indian lofi hip hop", "desi rap", "hindi synth"],
    intl: ["synth pop", "indie electronic", "alternative pop", "bedroom pop"]
  }
};

const ZAPPERS = [
  "/audio/Zappers/zapper_swoosh_01.mp3",
  "/audio/Zappers/zapper_laser_02.mp3",
  "/audio/Zappers/zapper_transition_03.mp3"
];

function getIstHour(date: Date) {
  const dateInIST = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return dateInIST.getUTCHours();
}

function getCurrentShow(istHour: number) {
  if (istHour >= 6 && istHour < 8) return SHOWS[0];
  if (istHour >= 8 && istHour < 11) return SHOWS[1];
  if (istHour >= 11 && istHour < 16) return SHOWS[2];
  if (istHour >= 16 && istHour < 20) return SHOWS[3];
  if (istHour >= 20 || istHour < 1) return SHOWS[4]; 
  if (istHour >= 1 && istHour < 6) return SHOWS[5];  
  return SHOWS[1]; 
}

function getSearchQueryForShow(show: any) {
  let vibe = "indie";
  
  if (show.id === "night_shift" || show.id === "morning_zen") {
      vibe = "chill";
  } else if (show.id === "global_club" || show.energy === "high") {
      vibe = "party";
  }

  // 35% Punjabi, 35% Hindi, 30% International
  const roll = Math.random() * 100;
  let categoryArray = [];

  if (roll < 35) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].punjabi;
  } else if (roll < 70) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].hindi;
  } else {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].intl;
  }
  
  return categoryArray[Math.floor(Math.random() * categoryArray.length)];
}

async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {
  const cleanQuery = searchQuery.replace(/official audio|official video/gi, "").trim();
  
  let tracks = await searchAudiusTrack(cleanQuery);
  
  if (tracks.length === 0) {
    console.warn(`[Master Clock] No Audius track found for query: ${cleanQuery}. Using safe fallback.`);
    tracks = await searchAudiusTrack("hindi lofi chill");
    if (tracks.length === 0) {
        // If API is completely down, check for local fallback tracks
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
                title: randomFile.replace(/\.[^/.]+$/, ""), // Strip extension for title
                artist: "Future Radio Premium Fallback",
                durationSeconds: durMs / 1000,
                streamUrl: urlPath
              };
            } catch(e) {
              console.error("[Master Clock] Error reading fallback audio duration", e);
            }
          }
        }
        
        if (!fallbackTrack) {
          // Ultimate hardcoded fallback if no local files exist
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

  // Filter out played songs and apply strict duration limits (120s to 420s)
  let validTracks = tracks.filter(t => 
    !playedSongs.has(t.id) && 
    t.durationSeconds >= 120 && 
    t.durationSeconds <= 420
  );
  
  // If no valid tracks exist within the time limit, fall back to any unplayed track
  if (validTracks.length === 0) {
      console.warn(`[Master Clock] No unplayed tracks in 2-7 min range for '${cleanQuery}'. Relaxing duration limits.`);
      validTracks = tracks.filter(t => !playedSongs.has(t.id));
      
      // If still empty, all tracks were played. Reset memory.
      if (validTracks.length === 0) {
          console.warn(`[Master Clock] All ${tracks.length} tracks for '${cleanQuery}' were already played. Resetting memory.`);
          playedSongs.clear();
          // Still try to enforce duration even if played before
          validTracks = tracks.filter(t => t.durationSeconds >= 120 && t.durationSeconds <= 420);
          if (validTracks.length === 0) validTracks = tracks; // Ultimate fallback
      }
  }

  // Pick a random track from the remaining ones
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
    return urlPath.includes("Zapper") ? 3000 : 10000;
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

    const currentIstHour = getIstHour(startTime);
    const currentShow = getCurrentShow(currentIstHour);
    const stationProfile = STATION_VOICES[currentShow.rj as keyof typeof STATION_VOICES] || STATION_VOICES["PM"];

    console.log(`[Master Clock] Generating ${currentShow.name} (Voice: ${stationProfile.name}) for ${cityId} at ${currentIstHour}:00 IST`);

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
      if (settingsData[0].playlist_mood) {
         currentShow.contentStrategy = settingsData[0].playlist_mood;
         currentShow.energy = settingsData[0].playlist_mood;
      }
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
    } else {
      selectedHourlyTopic = await getTrendingHourlyTopic(cityId, currentShow);
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

    const schedule = [];
    let currentTimeMs = startTime.getTime();

    const addElement = (type: any, durationMs: number, urlOrId: string, metadata: any = {}) => {
      let finalDurationMs = durationMs;
      
      // HARD STOP: Never overshoot the 60-minute hot clock boundary (xx:59:59)
      if (currentTimeMs + finalDurationMs > targetEndTime) {
         finalDurationMs = targetEndTime - currentTimeMs;
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

    // Preflight Check: Is the Audius API down?
    const preflightSong = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
    const isFallbackMode = preflightSong.id.startsWith("system-fallback");
    if (!isFallbackMode) {
        playedSongs.delete(preflightSong.id);
    } else {
        console.warn("[Master Clock] Preflight failed. Engaging STRICT FALLBACK MODE for this hour.");
    }

    while (currentTimeMs < targetEndTime) {
      if (isFallbackMode) {
          const fallbackTrack = await getSong("fallback", cityId, playedSongs);
          addElement('song', getSafeSongDuration(fallbackTrack), fallbackTrack.streamUrl, { title: fallbackTrack.title, artist: fallbackTrack.artist, trackId: fallbackTrack.id });
          
          const zapper = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
          addElement('sweeper', await getLocalAudioDuration(zapper), zapper, { title: "Zapper Transition" });
          continue;
      }

      // 1. TOTH Station ID (Only once per hour at segment 1)
      if (segmentIndex === 1) {
        const stationId = getJingleByGenre(currentShow.energy);
        addElement('station_id', await getLocalAudioDuration(stationId), stationId, { title: "Station ID" });
      }

      // We only allow EXACTLY 5 Jocktalk segments per hour (Hot Clock strict format)
      if (segmentIndex <= 5) {
          // Jocktalk Segment
          const newsItem = localNewsItems.length >= segmentIndex ? localNewsItems[segmentIndex-1] : null;
          
          // Get next song details for tease
          let nextSongInfo = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
          let segmentTopic = selectedHourlyTopic;
          
          const rjScript = await getJocktalk(cityId, currentIstHour, currentShow, segmentTopic, segmentIndex, lastSongTitle, nextSongInfo.title, liveWeather, newsItem, globalRjPrompt);
          
          const voiceId = forceVoiceId;
          const language = "en";
          const speed = 1.0;
          let rjDur = Math.floor((rjScript.length / 10.0) * 1000) + 3500; 
          
          const blockId = addElement('jocktalk', rjDur, "", { transcript: rjScript, rjName: stationProfile.name, rjVoice: voiceId, language, speed });
          schedule[schedule.length-1].media_url = `/api/broadcast/tts?blockId=${blockId}&voiceId=${voiceId}&language=${language}&speed=${speed}&cb=${Date.now()}`;

          // Play Song 1 (The Teased Song)
          addElement('song', getSafeSongDuration(nextSongInfo), nextSongInfo.streamUrl, { title: nextSongInfo.title, artist: nextSongInfo.artist, trackId: nextSongInfo.id });
          
          // Zapper instead of Sweeper (High Energy Transition)
          const zapper = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
          addElement('sweeper', await getLocalAudioDuration(zapper), zapper, { title: "Zapper Transition" });

          // Play Song 2
          const song2 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
          addElement('song', getSafeSongDuration(song2), song2.streamUrl, { title: song2.title, artist: song2.artist, trackId: song2.id });
          lastSongTitle = song2.title;

          // Ad Break (4 per hour -> segmentIndex 1, 2, 3, 4)
          if (segmentIndex <= 4) {
              // Bumper into the Ad
              const sweeper2 = getSweeperByGenre(currentShow.energy);
              addElement('sweeper', await getLocalAudioDuration(sweeper2), sweeper2, { title: "Radio Sweeper" });
              
              // AgentX SSP Orchestration: Fetch contextual programmatic ad
              const sspContext: SspContext = {
                  cityId: cityId,
                  liveWeather: liveWeather,
                  timeOfDay: currentShow.energy === "high" ? "evening" : "morning"
              };
              
              const adDecision = await fetchContextualAd(sspContext);
              
              if (adDecision && adDecision.mediaUrl) {
                 // Play SSP dynamic Ad
                 addElement('sweeper', adDecision.durationMs, adDecision.mediaUrl, { title: adDecision.campaignTitle, isAd: true });
                 console.log(`[AgentX SSP] Weaving Ad: ${adDecision.campaignTitle}`);
              } else {
                 // Fallback Song to retain listening appeal
                 const fallbackSong = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
                 addElement('song', getSafeSongDuration(fallbackSong), fallbackSong.streamUrl, { title: fallbackSong.title, artist: fallbackSong.artist, trackId: fallbackSong.id });
              }
              
              // Bumper out of the Ad
              const sweeper3 = getSweeperByGenre(currentShow.energy);
              addElement('sweeper', await getLocalAudioDuration(sweeper3), sweeper3, { title: "Radio Sweeper" });
          } else {
              // Segment 5 end, just a zapper out
              const zapperOut = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
              addElement('sweeper', await getLocalAudioDuration(zapperOut), zapperOut, { title: "Zapper Transition" });
          }
          
          segmentIndex++;
      } else {
          // Fill the remaining time in the hour (52-minute music budget) without any more RJ talks
          const fillSong = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
          addElement('song', getSafeSongDuration(fillSong), fillSong.streamUrl, { title: fillSong.title, artist: fillSong.artist, trackId: fillSong.id });
          
          // Zapper instead of Sweeper for fill time
          const fillZapper = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
          addElement('sweeper', await getLocalAudioDuration(fillZapper), fillZapper, { title: "Zapper Transition" });
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
      message: `Generated ${schedule.length} elements for ${currentShow.name}.`,
      schedule
    });

  } catch (err: any) {
    console.error("[Master Clock] Failed to generate hour:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
