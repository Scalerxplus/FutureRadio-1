import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import yts from "yt-search";
import * as mm from "music-metadata";
import path from "path";
import { getLiveWeather } from "@/lib/live-data";

export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_build_key" });
const ytCache = new Map<string, { video: any; expiresAt: number }>();

const STATION_IDS: Record<string, string[]> = {
  high: ["/audio/jingles/Station_Jingle_EDM.mp3"],
  mid: ["/audio/jingles/Station_Jingle_Mid.mp3"],
  low: ["/audio/jingles/Station_Jingle_LoFi.mp3"],
};

const BUMPERS = [
  "/audio/Sweepers/RJ_Bumper_AIRA_High_Energy.mp3",
];

const HIGH_ENERGY_SWEEPERS = [
  "/audio/Sweepers/Future_Sweeper_High_Energy.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy_Fun.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy_India.mp3",
  "/audio/Sweepers/Sweeper_Desi_High_Energy_01.mp3",
  "/audio/Sweepers/Sweeper_EDM_High_Energy_05.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_01.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_02.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_03.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_04.mp3",
];

const MID_ENERGY_SWEEPERS = [
  "/audio/Sweepers/Future_Sweeper_Mid_Energy_.mp3",
  "/audio/Sweepers/Sweeper_MidEnergy_01.mp3",
  "/audio/Sweepers/Sweeper_MidEnergy_02.mp3",
];

const LOW_ENERGY_SWEEPERS = [
  "/audio/Sweepers/Sweeper_LoFi_01.mp3",
  "/audio/Sweepers/Sweeper_LoFi_02.mp3",
  "/audio/Sweepers/Sweeper_LoFi_03.mp3",
  "/audio/Sweepers/Sweeper_LoFi_04.mp3",
];

function getSweeperByGenre(energy: string, playedSweepers: Set<string>) {
  let list = MID_ENERGY_SWEEPERS;
  if (energy === "high") list = HIGH_ENERGY_SWEEPERS;
  if (energy === "low") list = LOW_ENERGY_SWEEPERS;
  
  let available = list.filter(s => !playedSweepers.has(s));
  if (available.length === 0) {
      // If all sweepers for this energy level are exhausted in a single hour, reset
      available = list;
      playedSweepers.clear();
  }
  
  const picked = available[Math.floor(Math.random() * available.length)];
  playedSweepers.add(picked);
  return picked;
}

const SHOWS = [
  { id: "morning_zen", name: "Morning Zen", rj: "PM", startHour: 6, endHour: 8, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Morning business news, pre-market analysis, global economy summaries, very factual." },
  { id: "morning_drive", name: "The Morning Drive", rj: "PM", startHour: 8, endHour: 11, energy: "high", musicQuery: "High energy latest bollywood punjabi trending highest played songs", contentStrategy: "Opening bell insights, corporate news, Indian tycoons, fast-paced financial data." },
  { id: "mid_day", name: "Mid-Day Cafe", rj: "PM", startHour: 11, endHour: 16, energy: "mid", musicQuery: "Easy listening latest hit songs", contentStrategy: "Mid-day market updates, sports scores, economy deep dives, intellectual analysis." },
  { id: "evening_rush", name: "Evening Rush", rj: "PM", startHour: 16, endHour: 20, energy: "high", musicQuery: "High energy bollywood punjabi trending hit songs", contentStrategy: "Market closing bells, GDP stats, major sports/cricket news, celebrity business ventures." },
  { id: "global_club", name: "The Global Club", rj: "PM", startHour: 20, endHour: 1, energy: "high", musicQuery: "EDM globally trending dj mixes dance music songs", contentStrategy: "Global markets, international business, late-night breaking news, fast-paced reports." },
  { id: "night_shift", name: "Night Shift", rj: "PM", startHour: 1, endHour: 6, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Economy retrospectives, long-form factual storytelling, sports history, very serious tone." },
];

const RJS = {
  "PM": { name: "Prameesh", gender: "male", voiceId: "pm" }
};

const ARTISTS = ["Diljit Dosanjh", "Arijit Singh", "Shreya Ghoshal", "Badshah", "AP Dhillon", "Atif Aslam", "Pritam", "A.R. Rahman", "Karan Aujla", "Sidhu Moose Wala", "B Praak", "Vishal Mishra", "Neha Kakkar"];
const OLD_ARTISTS = ["Kumar Sanu", "Alka Yagnik", "Udit Narayan", "Kishore Kumar", "Lata Mangeshkar", "Mohammed Rafi"];
const EDM_ARTISTS = ["Nucleya", "DJ Snake", "Ritviz", "Lost Stories", "Sickick", "DJ Chetas", "Alan Walker", "Tiesto", "David Guetta", "Calvin Harris"];

function getIstHour(date: Date) {
  const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' });
  return parseInt(istString, 10);
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
  let artist = ARTISTS[Math.floor(Math.random() * ARTISTS.length)];
  let vibe = "hit song";
  
  if (show.id === "night_shift" || show.id === "morning_zen") {
      if (Math.random() > 0.4) artist = OLD_ARTISTS[Math.floor(Math.random() * OLD_ARTISTS.length)];
      vibe = "melody";
  } else if (show.id === "global_club") {
      artist = EDM_ARTISTS[Math.floor(Math.random() * EDM_ARTISTS.length)];
      vibe = "club mix";
  } else if (show.energy === "high") {
      vibe = "party hit";
  }
  
  return `${artist} ${vibe}`;
}

async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>) {
  // Use "official audio" or "official video" instead of "lyrical" to prioritize official music labels
  const querySuffix = Math.random() > 0.5 ? " official audio" : " official video";
    let searchResults;
    try {
        searchResults = await yts(searchQuery + querySuffix);
    } catch (e: any) {
        console.warn(`[Master Clock] yts failed for query ${searchQuery}: ${e.message}`);
        searchResults = { videos: [] };
    }
  
  const excludeKeywords = ["jukebox", "mashup", "mixtape", "lofi", "8d", "status", "ringtone", "cover"];
  
  const isCleanVideo = (v: any) => {
    // Strict duration enforcement: Between 2 minutes and 7 minutes
    if (v.seconds < 120 || v.seconds > 420) return false;
    
    // Filter out compilation/un-official keywords
    const lowerTitle = v.title.toLowerCase();
    for (const kw of excludeKeywords) {
      if (lowerTitle.includes(kw)) return false;
    }
    return true;
  };

  // Primary filter: Clean videos that haven't been played
  let validVideos = searchResults.videos.filter((v: any) => isCleanVideo(v) && !playedSongs.has(v.videoId));

  // Fallback 1: If all clean videos are played, drop the unplayed requirement but KEEP the strict duration/clean filter!
  // Repeating a proper 3-minute song is much better than a 72-minute mixtape crashing the broadcast.
  if (validVideos.length === 0) {
    validVideos = searchResults.videos.filter((v: any) => isCleanVideo(v));
  }

  // Fallback 2: Extreme edge case where the search query returns absolutely no normal songs
  if (validVideos.length === 0) {
    console.warn(`[Master Clock] No clean videos found for query: ${searchQuery}. Using generic safe fallback.`);
    // A safe fallback ID just to keep the stream alive
    const fallbackId = "kJQP7kiw5Fk"; 
    playedSongs.add(fallbackId);
    return { videoId: fallbackId, title: "Future Radio Safe Fallback", seconds: 280, author: { name: "System" } };
  }

  // Pick from the top 3 most relevant results to guarantee the highest quality/official upload
  const topResults = validVideos.slice(0, 3);
  const selectedSong = topResults[Math.floor(Math.random() * topResults.length)];
  
  playedSongs.add(selectedSong.videoId);
  return selectedSong;
}

async function getLocalAudioDuration(urlPath: string) {
  try {
    const filePath = path.join(process.cwd(), "public", urlPath);
    const metadata = await mm.parseFile(filePath);
    return Math.round((metadata.format.duration || 10) * 1000);
  } catch (e) {
    console.error("[Master Clock] Error reading audio duration", e);
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
  const rjProfile = RJS[currentShow.rj as keyof typeof RJS];
  const isNightPersona = currentShow.id === "global_club";
  let segmentProgress = "";
  const anchorWord = rjProfile.gender === "female" ? "aapki news anchor" : "aapka news anchor";

  let hookContent = "";
  if (segmentIndex === 1) {
      hookContent = `[CLB Part 1 - Contextual Intro / Hook]: You MUST start by praising the station's sound. Example: "Future radio ka sound kitna sahi hai na" (or English equivalent). Introduce yourself as the anchor of Future Radio.`;
  } else {
      hookContent = `[CLB Part 1 - Contextual Intro / Hook]: You MUST start by praising the previous song played (${previousSongTitle}) and giving brief credit to the artist. Transition smoothly.`;
  }

  let localNewsProgress = "";
  if (localNewsCache && localNewsCache.headline) {
      localNewsProgress = `[CLB Part 3 - Core Local Content]: Discuss this Breaking Local Utility/Infra News: "${localNewsCache.headline}" - ${localNewsCache.description}. Provide a highly intelligent, empathetic, and connecting reaction/take on it so the audience feels informed and connected.`;
  } else {
      localNewsProgress = `[CLB Part 3 - Core Content]: Dive into the hourly discussion: "${topic}". Provide deep, relatable insights.`;
  }

  let timeOfDay = "Day";
  if (istHour >= 4 && istHour < 12) timeOfDay = "Morning (Subah)";
  else if (istHour >= 12 && istHour < 17) timeOfDay = "Afternoon (Dopahar)";
  else if (istHour >= 17 && istHour < 21) timeOfDay = "Evening (Shaam)";
  else timeOfDay = "Night (Raat)";

  const prompt = `${customRjPrompt || `You are an Expert News Anchor and Data Analyst for 'Future Radio', hosting the broadcast "${currentShow.name}".
Your name is ${rjProfile.name} (${rjProfile.gender}). You deliver data-driven, fact-based news with high professionalism and authority.`}

Show Context:
- Current Time: ${istHour}:00 IST (${timeOfDay}) in ${cityId}.
- Show Vibe: ${currentShow.contentStrategy}
- Hourly Topic: "${topic}"

CRITICAL RULES FOR GENERATION - YOU MUST STRICTLY FOLLOW THIS CLB (Content Link Breakup) FORMAT:
0. [CRITICAL GRAMMAR CONSTRAINT]: ${isNightPersona ? "You are hosting the Global Club EDM show. You MUST speak 100% in FLUENT AMERICAN ENGLISH. Do not use Hindi." : `Your gender is ${rjProfile.gender.toUpperCase()}. You MUST use STRICTLY ${rjProfile.gender.toUpperCase()} Hindi grammar for all verbs and pronouns.`}
1. ${hookContent}
2. [CLB Part 2 - Live Weather & Connect]: Seamlessly mention the city "${cityId}" and weave in the current weather (${liveWeather}). CRITICAL: Be strictly aware of the time (${timeOfDay}).
3. ${localNewsProgress}
4. [CLB Part 4 - Tease Next Song]: Seamlessly transition to a short musical break featuring the track: "${upcomingSongTitle}".
5. [CLB Part 5 - Outro]: Always end your talk EXACTLY with: "${isNightPersona ? `Keep listening to Future Radio, my name is ${rjProfile.name}, Future Radio, Hear the future.` : `Sunte rahiye Future radio, mera nam hai ${rjProfile.name}, Future Radio, Ab future suno.`}"

MANDATORY DURATION & STYLE:
- LENGTH: You MUST write a MINIMUM of 150 words. Provide precise statistics, numbers, and deep analysis!
- LANGUAGE: ${isNightPersona ? "Fluent, dynamic, high-energy American English. Sound like an EDM DJ at a global festival." : 'Modern, conversational Gen-Z Hinglish (a natural mix of Hindi and English vocabulary), but written STRICTLY in Devanagari script (हिंदी लिपि). For example, write "टेक्नोलॉजी" instead of "technology", "वाइब" instead of "vibe". DO NOT use pure, formal shuddh Hindi if English words are more natural. CRITICAL: You must NEVER output any A-Z English characters, write everything in Devanagari.'}
- MICRO-PAUSES: Use [pause] heavily between heavy facts to simulate natural breathing.

Output ONLY the raw script text. Do not output any titles, brackets, or translations.`;
    
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.85,
    });
    return chatCompletion.choices[0]?.message?.content || "Namaskar! Enjoy the music on Future Radio.";
  } catch(e) {
    return `Aap sun rahe hain radio ka future Future Radio, main hoon aapka dost ${rjProfile.name}, aur aap mere sath hain ${currentShow.name} par. Aaj ka din ${cityId} mein bahut hi behtareen lag raha hai, aur weather bhi ekdum perfect hai. Main janta hoon ki aaj kal zindagi kitni fast-paced ho gayi hai, isliye hum yahan hain aapko thoda relax karne ke liye. Pichla gaana kaisa laga? Aise hi aur hits sunte rahiye kyunki aage aane wala hai ek aur chartbuster, "${upcomingSongTitle}". Toh kahin mat jayiye, apni seatbelt baandh lijiye, volume full kar lijiye. Sunte rahiye Future Radio, ab future suno.`;
  }
}

async function getTrendingHourlyTopic(cityId: string, currentShow: any) {
  const dateString = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const prompt = `You are the Executive News Producer for 'Future Radio'.
Generate exactly ONE breaking news or intellectual headline for the News Anchor to analyze for the entire next hour.
City: ${cityId}. Show: ${currentShow.name} (Content Strategy: ${currentShow.contentStrategy}). Date: ${dateString}.
The topic MUST be strictly about one of these: Share Market, Business Tycoons of India (Ambani, Adani, Tata, etc.), Economy/GDP, Indian Cricket Team, or Major Global Sports.
It must be factual, data-driven, and highly professional.
Keep it under 15 words. DO NOT wrap it in quotes. DO NOT output any other text, just the headline itself.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
    });
    return chatCompletion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || "The psychology of nostalgia and why old music feels so comforting";
  } catch (e) {
    return "The massive global rise of Pop Culture and its impact";
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const cityId = url.searchParams.get("city") || "raipur";
    const startTimeParam = url.searchParams.get("startTime");
    const startTime = startTimeParam ? new Date(startTimeParam) : new Date();
    
    // TOTH Sync: Generate schedule ONLY until the end of the current hour (xx:59:59)
    const targetEndTime = new Date(startTime).setMinutes(59, 59, 999);

    const currentIstHour = getIstHour(startTime);
    const currentShow = getCurrentShow(currentIstHour);
    const rjProfile = RJS[currentShow.rj as keyof typeof RJS];

    console.log(`[Master Clock] Generating ${currentShow.name} (RJ: ${rjProfile.name}) for ${cityId} at ${currentIstHour}:00 IST`);

    // --- HITL: Fetch Global Station Settings ---
    let globalRjPrompt = "";
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
      const blockId = crypto.randomUUID();
      schedule.push({
        id: blockId,
        city_id: cityId,
        start_time: new Date(currentTimeMs).toISOString(),
        end_time: new Date(currentTimeMs + durationMs).toISOString(),
        duration_ms: durationMs,
        element_type: type,
        [type === 'song' ? 'youtube_id' : 'media_url']: urlOrId,
        metadata
      });
      currentTimeMs += durationMs;
      return blockId;
    };

    // Helper to calculate a safe song duration and prevent the "2-second zapper bug"
    const getSafeSongDuration = (song: any) => {
      let durMs = Math.round((song.seconds || 0) * 1000);
      if (durMs < 60000) durMs = 240000; // Fallback to 4 mins if YT search returns a short clip or 0
      return durMs; // No more Math.min cap, let the song play fully!
    };

    let segmentIndex = 1;
    let lastSongTitle = "nothing";
    const playedSongs = new Set<string>();
    const playedSweepers = new Set<string>();

    while (currentTimeMs < targetEndTime) {
      // 1. TOTH Station ID (Only once per hour)
      if (segmentIndex === 1) {
        const jingleList = STATION_IDS[currentShow.energy] || STATION_IDS.mid;
        const stationId = jingleList[Math.floor(Math.random() * jingleList.length)];
        addElement('station_id', await getLocalAudioDuration(stationId), stationId, { title: "Station ID" });
      }

      // 2. Jocktalk (Intro/Topic)
      const newsItem1 = localNewsItems.length > 0 ? localNewsItems[0] : null;
      const rjScript1 = await getJocktalk(cityId, currentIstHour, currentShow, selectedHourlyTopic, segmentIndex, lastSongTitle, "upcoming hits", liveWeather, newsItem1, globalRjPrompt);
      
      // Dual-Model TTS Logic
      const voiceId = "pm";
      const language = currentShow.id === "global_club" ? "en" : "hi";
      const speed = currentShow.id === "global_club" ? 0.8 : 0.95;
      
      let rjDur1 = Math.floor((rjScript1.length / 10.0) * 1000) + 3500; 
      
      const blockId1 = addElement('jocktalk', rjDur1, "", { transcript: rjScript1, rjName: rjProfile.name, rjVoice: voiceId, language, speed });
      schedule[schedule.length-1].media_url = `/api/broadcast/tts?blockId=${blockId1}&voiceId=${voiceId}&language=${language}&speed=${speed}&cb=${Date.now()}`;

      // 3. Song 1
      const song1 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song1), song1.videoId, { title: song1.title, artist: song1.author.name });
      
      // 4. Short Sweeper
      const sweeper1 = getSweeperByGenre(currentShow.energy, playedSweepers);
      addElement('sweeper', await getLocalAudioDuration(sweeper1), sweeper1, { title: "Radio Sweeper" });

      // 5. Song 2
      const song2 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song2), song2.videoId, { title: song2.title, artist: song2.author.name });
      
      // 6. Sweeper Before Break
      const sweeper2 = getSweeperByGenre(currentShow.energy, playedSweepers);
      addElement('sweeper', await getLocalAudioDuration(sweeper2), sweeper2, { title: "Radio Sweeper" });

      // 7. Jocktalk (Content wrap)
      const newsItem2 = localNewsItems.length > 1 ? localNewsItems[1] : null;
      const rjScript2 = await getJocktalk(cityId, currentIstHour, currentShow, selectedHourlyTopic, 2, song2.title, "upcoming hits", liveWeather, newsItem2, globalRjPrompt);
      let rjDur2 = Math.floor((rjScript2.length / 10.0) * 1000) + 3500; 
      
      const blockId2 = addElement('jocktalk', rjDur2, "", { transcript: rjScript2, rjName: rjProfile.name, rjVoice: voiceId, language, speed });
      schedule[schedule.length-1].media_url = `/api/broadcast/tts?blockId=${blockId2}&voiceId=${voiceId}&language=${language}&speed=${speed}&cb=${Date.now()}`;

      // 8. Song 3
      const song3 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song3), song3.videoId, { title: song3.title, artist: song3.author.name });

      // 9. Sweeper
      const sweeper3 = getSweeperByGenre(currentShow.energy, playedSweepers);
      addElement('sweeper', await getLocalAudioDuration(sweeper3), sweeper3, { title: "Radio Sweeper" });

      // 10. Song 4
      const song4 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song4), song4.videoId, { title: song4.title, artist: song4.author.name });
      lastSongTitle = song4.title;

      // 11. Sweeper Before Next Block
      const sweeper4 = getSweeperByGenre(currentShow.energy, playedSweepers);
      addElement('sweeper', await getLocalAudioDuration(sweeper4), sweeper4, { title: "Radio Sweeper" });

      segmentIndex += 2;
    }

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
