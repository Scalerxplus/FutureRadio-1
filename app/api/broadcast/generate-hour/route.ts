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

const STATION_IDS = [
  "/audio/jingles/Station_Jingle_EDM.mp3",
];
const BUMPERS = [
  "/audio/Sweepers/RJ_Bumper_AIRA_High_Energy.mp3",
];

const DESI_SWEEPERS = [
  "/audio/Sweepers/Sweeper_Desi_High_Energy_01.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy_Dhol.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy_India.mp3"
];

const EDM_SWEEPERS = [
  "/audio/Sweepers/Sweeper_Edm_High_Energy_01.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_02.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_03.mp3",
  "/audio/Sweepers/Sweeper_Edm_High_Energy_04.mp3",
  "/audio/Sweepers/Sweeper_EDM_High_Energy_05.mp3"
];

const MID_ENERGY_SWEEPERS = [
  "/audio/Sweepers/Future_Sweeper_Mid_Energy_.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy.mp3",
  "/audio/Sweepers/Future_Sweeper_High_Energy_Fun.mp3"
];

function getSweeperByGenre(energy: string) {
  let list = MID_ENERGY_SWEEPERS;
  if (energy === "high") list = [...DESI_SWEEPERS, ...MID_ENERGY_SWEEPERS];
  if (energy === "high" && Math.random() > 0.5) list = EDM_SWEEPERS; // Mix EDM slightly everywhere
  // Pure EDM for global club handled by returning EDM for late nights, but energy="high"
  return list[Math.floor(Math.random() * list.length)];
}

const SHOWS = [
  { id: "morning_zen", name: "Morning Zen", rj: "Maanas", startHour: 6, endHour: 8, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Calm, motivational start to the day. Positivity, light local news, weather." },
  { id: "morning_drive", name: "The Morning Drive", rj: "AIRA", startHour: 8, endHour: 11, energy: "high", musicQuery: "High energy latest bollywood punjabi trending highest played songs", contentStrategy: "High energy, interactive, traffic updates, viral news, waking up the city." },
  { id: "mid_day", name: "Mid-Day Cafe", rj: "Maanas", startHour: 11, endHour: 16, energy: "mid", musicQuery: "Easy listening latest hit songs", contentStrategy: "Office companion, Bollywood trivia, light humor, relaxed workplace vibe." },
  { id: "evening_rush", name: "Evening Rush", rj: "AIRA", startHour: 16, endHour: 21, energy: "high", musicQuery: "High energy bollywood punjabi trending hit songs", contentStrategy: "High energy, pop-culture, beat the commute traffic, extremely interactive." },
  { id: "global_club", name: "The Global Club", rj: "AIRA", startHour: 21, endHour: 1, energy: "high", musicQuery: "EDM globally trending dj mixes dance music songs", contentStrategy: "Weekend/Party vibe every night, high bass, global trends, hype talks." },
  { id: "night_shift", name: "Night Shift", rj: "Maanas", startHour: 1, endHour: 6, energy: "low", musicQuery: "Easy listening bollywood hit songs", contentStrategy: "Deep late-night thoughts, emotional storytelling, nostalgia, minimal talk." },
];

const RJS = {
  "AIRA": { name: "AIRA", gender: "female", voiceId: "cgSgspJ2msm6clMCkdW9" },
  "Maanas": { name: "Maanas", gender: "male", voiceId: "nPczCjzI2devNBz1zQrb" }
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
  if (istHour >= 16 && istHour < 21) return SHOWS[3];
  if (istHour >= 21 || istHour < 1) return SHOWS[4]; 
  if (istHour >= 1 && istHour < 6) return SHOWS[5];  
  return SHOWS[1]; 
}

function getSearchQueryForShow(show: any) {
  let artist = ARTISTS[Math.floor(Math.random() * ARTISTS.length)];
  if (show.id === "night_shift" || show.id === "morning_zen") {
      if (Math.random() > 0.4) artist = OLD_ARTISTS[Math.floor(Math.random() * OLD_ARTISTS.length)];
  } else if (show.id === "global_club") {
      if (Math.random() > 0.3) artist = EDM_ARTISTS[Math.floor(Math.random() * EDM_ARTISTS.length)];
  }
  return `${artist} ${show.musicQuery} audio`;
}

async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>) {
  // Add "lyrical" or "audio" to avoid long video compilations or dialogs
  const searchResults = await yts(searchQuery + " lyrical");
  
  // Filter out songs longer than 6 minutes (360 seconds) and already played songs
  const validVideos = searchResults.videos.filter((v: any) => v.seconds <= 360 && !playedSongs.has(v.videoId));

  if (validVideos.length === 0) {
    const fallback = searchResults.videos.slice(0, 5);
    const selected = fallback[Math.floor(Math.random() * fallback.length)];
    if (selected) playedSongs.add(selected.videoId);
    return selected;
  }

  const selectedSong = validVideos[Math.floor(Math.random() * Math.min(validVideos.length, 5))];
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
  customRjPrompt: string = ""
) {
  const rjProfile = RJS[currentShow.rj as keyof typeof RJS];
  let segmentProgress = "";

  if (segmentIndex === 1) {
      segmentProgress = `[CLB Step 3 - Core Content]: The Top of the Hour Hook! Introduce the main topic of the hour: "${topic}". Give a quick, catchy hot take to get them hooked!`;
  } else if (segmentIndex === 2) {
      segmentProgress = `[CLB Step 3 - Core Content]: Dive deep into the hourly topic: "${topic}". Tell a quick relatable story, or share an interesting fact about it. Mention what song just played (${previousSongTitle}).`;
  } else {
      segmentProgress = `[CLB Step 3 - Core Content]: Wrap up the discussion on "${topic}". Summarize your final thoughts.`;
  }

  const prompt = `${customRjPrompt || `You are the star Radio Jockey for 'Future Radio', hosting the show "${currentShow.name}".
Your name is ${rjProfile.name} (${rjProfile.gender}). You are a top-tier, world-class presenter.`}

Show Context:
- Current Time: ${istHour}:00 IST in ${cityId}.
- Show Vibe: ${currentShow.contentStrategy}
- Hourly Topic: "${topic}"

CRITICAL RULES FOR GENERATION - YOU MUST STRICTLY FOLLOW THIS CLB (Content Link Breakup) FORMAT:
0. [CRITICAL GRAMMAR CONSTRAINT]: Because your gender is ${rjProfile.gender}, you MUST use strictly ${rjProfile.gender} grammar rules when writing Hindi sentences. For example, if female, you MUST write "Main aa gayi hoon", "Main sun rahi hoon", NOT "Main aa gaya hoon". DO NOT break character.
1. [CLB Step 1 - Brand Intro]: If this is Segment 1, you MUST start exactly with: "Aap sun rahe hain radio ka future 'Future Radio', main hoon aapka dost ${rjProfile.name}, aur aap mere sath hain ${currentShow.name} par."
2. [CLB Step 2 - Local Connect]: Seamlessly mention the city "${cityId}" and weave in the current weather (${liveWeather}).
3. ${segmentProgress}
4. [CLB Step 4 - Tease Next Song]: Build hype for the upcoming song: "${upcomingSongTitle}".
5. [CLB Step 5 - Outro]: Always end your talk exactly with: "Sunte rahiye Future Radio, ab future suno."

MANDATORY DURATION & STYLE:
- LENGTH: You MUST write a MINIMUM of 150 words. This is extremely important to guarantee a 45-second audio duration. Elaborate on your points!
- LANGUAGE: Fluent, stylish, conversational Hinglish. 
- MICRO-PAUSES: Use [pause] or [laughs] to force the AI voice to take natural breaths.

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
  const prompt = `You are the Content Director for 'Future Radio'.
Generate exactly ONE extremely engaging, intellectual, or pop-culture trending topic for the RJ to talk about for the entire next hour.
City: ${cityId}. Show: ${currentShow.name} (Vibe: ${currentShow.contentStrategy}). Date: ${dateString}.
Make it highly relevant to Gen-Z / Millennials in India. It must match the vibe of the show.
Keep it under 15 words. DO NOT wrap it in quotes. DO NOT output any other text, just the topic itself.`;

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
    const startTime = new Date();
    
    const targetEndTime = startTime.getTime() + (60 * 60 * 1000); // 1 hour
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

    while (currentTimeMs < targetEndTime) {
      // 1. TOTH Station ID (Only once per hour)
      if (segmentIndex === 1) {
        const stationId = STATION_IDS[Math.floor(Math.random() * STATION_IDS.length)];
        addElement('station_id', await getLocalAudioDuration(stationId), stationId, { title: "Station ID" });
      }

      // 2. Jocktalk (Intro/Topic)
      const rjScript1 = await getJocktalk(cityId, currentIstHour, currentShow, selectedHourlyTopic, segmentIndex, lastSongTitle, "upcoming hits", liveWeather, globalRjPrompt);
      let ttsUrl = `/api/broadcast/tts?blockId=temp&voiceId=${rjProfile.voiceId}&cb=${Date.now()}`;
      let rjDur1 = Math.floor((rjScript1.length / 10.0) * 1000) + 3500; 
      
      const blockId1 = addElement('jocktalk', rjDur1, ttsUrl, { transcript: rjScript1, rjName: rjProfile.name, rjVoice: rjProfile.voiceId });
      schedule[schedule.length-1].media_url = `/api/broadcast/tts?blockId=${blockId1}&voiceId=${rjProfile.voiceId}&cb=${Date.now()}`;

      // 3. Song 1
      const song1 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song1), song1.videoId, { title: song1.title, artist: song1.author.name });
      
      // 4. Short Sweeper
      const sweeper1 = getSweeperByGenre(currentShow.energy);
      addElement('sweeper', await getLocalAudioDuration(sweeper1), sweeper1, { title: "Radio Sweeper" });

      // 5. Song 2
      const song2 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song2), song2.videoId, { title: song2.title, artist: song2.author.name });
      
      // 6. Long Sweeper
      const sweeper2 = getSweeperByGenre(currentShow.energy);
      addElement('sweeper', await getLocalAudioDuration(sweeper2), sweeper2, { title: "Radio Sweeper" });

      // 7. Jocktalk (Content wrap)
      const rjScript2 = await getJocktalk(cityId, currentIstHour, currentShow, selectedHourlyTopic, segmentIndex + 1, song2.title, "more hits", liveWeather, globalRjPrompt);
      let rjDur2 = Math.floor((rjScript2.length / 10.0) * 1000) + 3500; 
      const blockId2 = addElement('jocktalk', rjDur2, ttsUrl, { transcript: rjScript2, rjName: rjProfile.name, rjVoice: rjProfile.voiceId });
      schedule[schedule.length-1].media_url = `/api/broadcast/tts?blockId=${blockId2}&voiceId=${rjProfile.voiceId}&cb=${Date.now()}`;

      // 8. Song 3
      const song3 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song3), song3.videoId, { title: song3.title, artist: song3.author.name });

      // 9. Song 4
      const song4 = await getSong(getSearchQueryForShow(currentShow), cityId, playedSongs);
      addElement('song', getSafeSongDuration(song4), song4.videoId, { title: song4.title, artist: song4.author.name });
      lastSongTitle = song4.title;

      // 10. Short Sweeper
      const sweeper3 = getSweeperByGenre(currentShow.energy);
      addElement('sweeper', await getLocalAudioDuration(sweeper3), sweeper3, { title: "Radio Sweeper" });

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
