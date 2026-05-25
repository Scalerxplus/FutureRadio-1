import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import yts from "yt-search";
import * as mm from "music-metadata";
import path from "path";

// Allow the Vercel Serverless Function to run for the absolute maximum time allowed on the Hobby Tier (60 seconds)
// This is critical because the LLM + external API calls may exceed the default 10-second limit.
export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const ytCache = new Map<string, { video: any; expiresAt: number }>();

const STATION_IDS = [
  "/audio/jingles/Future Radio Jingle.mp3",
  "/audio/jingles/Future Radio Tuned.mp3",
];
const SWEEPERS = [
  "/audio/jingles/Future Radio Tuned (1).mp3",
  "/audio/jingles/Future Radio.mp3",
  "/audio/jingles/Future Radio (1).mp3",
];

const ARTIST_DATABASE = [
  "Diljit Dosanjh", "Honey Singh", "Badshah", "Parmish Verma", 
  "Papon", "Nusrat Fateh Ali Khan", "Coke Studio Pakistan", "Coke Studio India",
  "Arijit Singh", "Shreya Ghoshal", "Atif Aslam", "Prateek Kuhad", "Anuv Jain", 
  "Darshan Raval", "Armaan Malik", "Jubin Nautiyal", "B Praak", "Vishal Mishra",
  "A.R. Rahman", "Mohit Chauhan", "KK", "Sonu Nigam", "Shaan", "Sunidhi Chauhan",
  "Mika Singh", "Neha Kakkar", 
  "Kumar Sanu", "Alka Yagnik", "Udit Narayan", "Kishore Kumar",
  "Lucky Ali", "Euphoria", "Silk Route", "Bombay Vikings", "Falguni Pathak"
];

function getIstHour(date: Date) {
  const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' });
  return parseInt(istString, 10);
}

function getDaypart(istHour: number) {
  if (istHour >= 7 && istHour < 12) return "morning";
  if (istHour >= 12 && istHour < 17) return "noon";
  if (istHour >= 17 || istHour < 1) return "evening";
  return "latenight";
}

function getTargetEnergy(daypart: string, phase: "hook" | "connection" | "nostalgia" | "ramp") {
  if (daypart === "morning" || daypart === "evening") {
    return (phase === "hook" || phase === "ramp") ? "high" : "mid";
  } else if (daypart === "noon") {
    return (phase === "hook" || phase === "ramp") ? "mid" : "low";
  } else if (daypart === "latenight") {
    return "low";
  }
  return "mid";
}

function selectArtist(daypart: string, phase: "hook" | "connection" | "nostalgia" | "ramp") {
  if (phase === "nostalgia" && daypart !== "latenight") {
     const nostalgiaPool = ["Kumar Sanu", "Alka Yagnik", "Udit Narayan", "Kishore Kumar", "Lucky Ali", "Euphoria", "Silk Route", "Bombay Vikings", "Falguni Pathak", "KK", "Sonu Nigam", "Shaan"];
     return nostalgiaPool[Math.floor(Math.random() * nostalgiaPool.length)];
  }
  return ARTIST_DATABASE[Math.floor(Math.random() * ARTIST_DATABASE.length)];
}

async function getSong(searchQuery: string, cityId: string) {
  const cacheKey = `${searchQuery}-${cityId}`;
  const cached = ytCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.video;

  const searchResults = await yts(`${searchQuery}`);
  const videos = searchResults.videos.slice(0, 5);
  const selectedSong = videos[Math.floor(Math.random() * videos.length)];

  ytCache.set(cacheKey, { video: selectedSong, expiresAt: Date.now() + 60 * 60 * 1000 });
  return selectedSong;
}

async function getLocalAudioDuration(urlPath: string) {
  try {
    const filePath = path.join(process.cwd(), "public", urlPath);
    const metadata = await mm.parseFile(filePath);
    return Math.round((metadata.format.duration || 10) * 1000);
  } catch (e) {
    console.error("[Master Clock] Error reading audio duration for", urlPath, e);
    return 15000;
  }
}

// --- HELPER: GET AI SCRIPT (CO-HOST AWARE) ---
async function getJocktalk(
  segmentType: "news" | "traffic",
  cityId: string, 
  daypart: string, 
  topic: string, 
  phase: string, 
  previousSongTitle: string, 
  upcomingSongTitle: string,
  currentRj: any,
  otherRj: any,
  segmentProgress: string
) {
  const prompt = `You are the Lead Scriptwriter for 'Future Radio', writing a script for a dual-hosted show.
The hosts are ${currentRj.name} (${currentRj.gender}, ${currentRj.personality}) and ${otherRj.name} (${otherRj.gender}, ${otherRj.personality}). They are extremely friendly, respectful, and intelligent co-hosts.

Right now, YOU ARE WRITING ONLY FOR: ${currentRj.name}.
${currentRj.name} is currently speaking on air alone for this segment. ${currentRj.name} must playfully or intellectually refer to something ${otherRj.name} said earlier, or pass the baton to ${otherRj.name} at the end, making it feel like a seamless dual-hosted show.

CRITICAL RULES FOR GENERATION:
1. LANGUAGE: Speak entirely in conversational Hinglish (Hindi written in English alphabet, mixed with casual English words).
2. BREVITY: Keep the script exactly between 25 to 30 words so it takes exactly 15 seconds to speak.
3. THE MICRO-PAUSE & EMOTION HACK (BRACKET TAGS): You must use bracketed performance tags to direct the AI voice.
    - Use [pause] for a quick, natural comma-like breath.
    - Use [long pause] before introducing a song or changing topics for dramatic effect.
    - Use emotion tags like [amused], [excited], or [sigh] at the start of a sentence to set the tone.
4. TONE: Never use formal greetings. Start abruptly with a casual hook (e.g., "Bhai...", "Yaar...", "Socho..."). Act like you are talking to a friend sitting in the passenger seat of a car. Keep your persona intact.
5. PROGRESSIVE STORYTELLING: You are part of an hour-long radio show. Do not sound like you are starting from scratch. Speak progressively as if carrying on a continuous conversation with your audience based on the 'CONTENT LOG BUILDER' instructions below.

Hourly Context Topic: "${topic}"
City: ${cityId}
Daypart: ${daypart}
Phase: ${phase} (Drive the narrative forward based on this phase)
Just Played: ${previousSongTitle}
Next Song: ${upcomingSongTitle}

CONTENT LOG BUILDER: ${segmentProgress}.
${segmentType === "traffic" ? `Also weave in a quick, helpful local street traffic update for ${cityId} (invent a realistic street name). Be the smart, aware co-pilot saving them time.` : ''}

EXAMPLE OUTPUT FORMAT:
"[amused] Bhai... [pause] bahar ki garmi toh alag hi level pe hai aaj. [long pause] AC full pe rakho aur seatbelt baandh lo. [pause] Kyunki ab jo track aa raha hai na... [excited] woh seedha vibe set karega."`;
    
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
  });

  return chatCompletion.choices[0]?.message?.content || "Namaskar! Enjoy the music on Future Radio.";
}

// Dynamically generate a live trending topic for the hour
async function getTrendingHourlyTopic(cityId: string, daypart: string) {
  const dateString = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const prompt = `You are the Content Director for 'Future Radio', a Gen-Z Indian Radio Station.
Generate exactly ONE extremely engaging, intellectual, or pop-culture trending topic for the RJ to talk about for the entire next hour.
City: ${cityId}. Daypart: ${daypart}. Date: ${dateString}.
Make it highly relevant to Gen-Z / Millennials in India. It could be about digital life, modern dating, neuroscience of music, nostalgia, pop-culture, or mental health.
Keep it under 15 words. DO NOT wrap it in quotes. DO NOT output any other text, just the topic itself.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
    });
    return chatCompletion.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || "The psychology of nostalgia and why old music feels so comforting";
  } catch (e) {
    return "The massive global rise of Punjabi Pop and its cultural impact on Gen-Z";
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const cityId = url.searchParams.get("city") || "raipur";
    const startTime = new Date();
    
    console.log(`[Master Clock] Generating 1-Hour Schedule for ${cityId} starting at ${startTime.toISOString()}`);

    const schedule = [];
    let currentTimeMs = startTime.getTime();

    const addElement = (type: any, durationMs: number, urlOrId: string, metadata: any = {}) => {
      schedule.push({
        city_id: cityId,
        start_time: new Date(currentTimeMs).toISOString(),
        end_time: new Date(currentTimeMs + durationMs).toISOString(),
        duration_ms: durationMs,
        element_type: type,
        [type === 'song' ? 'youtube_id' : 'media_url']: urlOrId,
        metadata
      });
      currentTimeMs += durationMs;
    };

    const targetEndTime = startTime.getTime() + (60 * 60 * 1000); // +1 hour
    const currentIstHour = getIstHour(startTime);
    const currentDaypart = getDaypart(currentIstHour);

    const selectedHourlyTopic = await getTrendingHourlyTopic(cityId, currentDaypart);
    console.log(`[Master Clock] CLB Hourly Topic Selected: ${selectedHourlyTopic}`);

    const RJS = [
      {
        name: "AIRA",
        gender: "female",
        personality: "Energetic, playful, and incredibly smart Gen-Z girl",
        voiceId: "cgSgspJ2msm6clMCkdW9"
      },
      {
        name: "Maanas",
        gender: "male",
        personality: "Chill, deeply intellectual, smooth, and very respectful Gen-Z guy",
        voiceId: "nPczCjzI2devNBz1zQrb"
      }
    ];

    let rjIndex = 0; // Toggle to alternate RJs per segment

    const PHASES: Array<"hook" | "connection" | "nostalgia" | "ramp"> = ["hook", "connection", "nostalgia", "ramp"];
    let phaseIndex = 0;
    let segmentIndex = 1;
    let lastSongTitle = "nothing";

    const getSearchQuery = (daypart: string, phase: "hook" | "connection" | "nostalgia" | "ramp") => {
      const artist = selectArtist(daypart, phase);
      const energy = getTargetEnergy(daypart, phase);
      
      let keyword = "hit song audio";
      if (energy === "high") keyword = "party dance upbeat hit audio";
      else if (energy === "low") {
         if (artist === "Nusrat Fateh Ali Khan") keyword = "lofi ghazal mix audio";
         else keyword = "lofi slow reverb soulful song audio";
      }
      return `${artist} ${keyword}`;
    };

    while (currentTimeMs < targetEndTime) {
      // PRE-FETCH SONGS
      let currentPhase = PHASES[phaseIndex % PHASES.length];
      const song1 = await getSong(getSearchQuery(currentDaypart, currentPhase), cityId);
      phaseIndex++;
      
      currentPhase = PHASES[phaseIndex % PHASES.length];
      const song2 = await getSong(getSearchQuery(currentDaypart, currentPhase), cityId);
      phaseIndex++;

      currentPhase = PHASES[phaseIndex % PHASES.length];
      const song3 = await getSong(getSearchQuery(currentDaypart, currentPhase), cityId);
      phaseIndex++;

      // 1. Station ID
      const stationId = STATION_IDS[Math.floor(Math.random() * STATION_IDS.length)];
      const stationDur = await getLocalAudioDuration(stationId);
      addElement('station_id', stationDur, stationId, { title: "Station ID" });

      // 2. RJ Jocktalk (Top of block)
      let segmentProgress1 = segmentIndex === 1 
        ? `This is Segment ${segmentIndex} (Top of the Hour). Introduce yourself, hype up the hour, and casually introduce the main topic of the hour: "${selectedHourlyTopic}".` 
        : `This is Segment ${segmentIndex}. Progressively continue your discussion about this hour's core topic: "${selectedHourlyTopic}". Share a new thought or opinion about it, continuing naturally from where you left off.`;
      
      let currentRj = RJS[rjIndex];
      let otherRj = RJS[(rjIndex + 1) % 2];
      
      const newsScript = await getJocktalk("news", cityId, currentDaypart, selectedHourlyTopic, currentPhase, lastSongTitle, song1.title, currentRj, otherRj, segmentProgress1);
      
      let cbParam = Date.now() + Math.floor(Math.random() * 1000);
      let ttsUrl = `/api/broadcast/tts?text=${encodeURIComponent(newsScript)}&voiceId=${currentRj.voiceId}&cb=${cbParam}`;
      let dynamicMs = Math.floor((newsScript.length / 10.0) * 1000) + 3500; 

      addElement("jocktalk", dynamicMs, ttsUrl, { transcript: newsScript, rjName: currentRj.name, rjVoice: currentRj.voiceId });
      
      rjIndex = (rjIndex + 1) % 2; // Toggle RJ
      segmentIndex++;

      // 3. Song 1
      const duration1 = Math.min(Math.round(song1.seconds * 1000), 300000);
      addElement('song', duration1, song1.videoId, { title: song1.title, artist: song1.author.name });

      // 4. Sweeper
      const sweeper = SWEEPERS[Math.floor(Math.random() * SWEEPERS.length)];
      const sweeperDur = await getLocalAudioDuration(sweeper);
      addElement('sweeper', sweeperDur, sweeper, { title: "Radio Sweeper" });

      // 5. Song 2
      const duration2 = Math.min(Math.round(song2.seconds * 1000), 300000);
      addElement('song', duration2, song2.videoId, { title: song2.title, artist: song2.author.name });

      // 6. RJ Jocktalk (Traffic Bumper)
      let segmentProgress2 = `This is Segment ${segmentIndex}. Briefly connect back to the overarching topic: "${selectedHourlyTopic}". Keep it perfectly interwoven.`;
      
      currentRj = RJS[rjIndex];
      otherRj = RJS[(rjIndex + 1) % 2];

      const trafficScript = await getJocktalk("traffic", cityId, currentDaypart, selectedHourlyTopic, currentPhase, song2.title, song3.title, currentRj, otherRj, segmentProgress2);
      
      cbParam = Date.now() + Math.floor(Math.random() * 1000);
      ttsUrl = `/api/broadcast/tts?text=${encodeURIComponent(trafficScript)}&voiceId=${currentRj.voiceId}&cb=${cbParam}`;
      dynamicMs = Math.floor((trafficScript.length / 10.0) * 1000) + 3500; 

      addElement('traffic', dynamicMs, ttsUrl, { transcript: trafficScript, rjName: currentRj.name, rjVoice: currentRj.voiceId });
      
      rjIndex = (rjIndex + 1) % 2; // Toggle RJ
      segmentIndex++;

      // 7. Song 3
      const duration3 = Math.min(Math.round(song3.seconds * 1000), 300000);
      addElement('song', duration3, song3.videoId, { title: song3.title, artist: song3.author.name });
      lastSongTitle = song3.title;
    }

    const { error } = await supabase.from("broadcast_schedule").insert(schedule);

    if (error) {
      console.error("[Master Clock] Insert failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${schedule.length} scheduled elements.`,
      schedule
    });

  } catch (err: any) {
    console.error("[Master Clock] Failed to generate hour:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
