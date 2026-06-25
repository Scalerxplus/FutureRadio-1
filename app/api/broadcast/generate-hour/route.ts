import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPodcastEpisode } from "@/lib/itunes";
import { LocalTrack } from "@/lib/types";
import { getGlobalNewsBite, getShortGlobalNewsBite } from "@/lib/newsbites";
import { fetchContextualAd, SspContext } from "@/lib/ssp";
import { getOriginalForStation, getFallbackOriginal, getOriginalTracks } from "@/lib/originals";
import * as mm from "music-metadata";
import path from "path";
import fs from "fs";
import { getLiveWeather } from "@/lib/live-data";

export const maxDuration = 60;

const ytCache = new Map<string, { video: any; expiresAt: number }>();

const globalPlayedSweepers = new Set<string>();
const globalPlayedJingles = new Set<string>();

async function getContextualSweeper(genre: string, targetEnergy?: number) {
  try {
    const supabase = createClient();
    let query = supabase.from('curated_sweepers').select('media_url, energy_score');
    
    // All stations share global sweepers except news
    if (genre.toLowerCase() === "news") {
      query = query.eq('genre', 'news');
    } else {
      query = query.eq('genre', 'global');
    }
    
    const { data: sweepers } = await query;
    if (sweepers && sweepers.length > 0) {
      if (targetEnergy !== undefined) {
        // Sort by how close they are to the target energy
        sweepers.sort((a, b) => Math.abs(a.energy_score - targetEnergy) - Math.abs(b.energy_score - targetEnergy));
        
        // Take from the top 3 closest matches randomly
        const topMatches = sweepers.slice(0, 3);
        const selected = topMatches[Math.floor(Math.random() * topMatches.length)];
        return selected.media_url;
      } else {
        const selected = sweepers[Math.floor(Math.random() * sweepers.length)];
        return selected.media_url;
      }
    }
  } catch (e) {
    console.error("[Master Clock] Failed to get contextual sweeper:", e);
  }
  
  // Try FR Fallback original track first
  const frFallback = getFallbackOriginal(targetEnergy);
  if (frFallback) {
    return frFallback;
  }
  
  // Static Fallback
  let staticGenre = "chill";
  if (genre.toLowerCase() === "news") {
      staticGenre = "news";
  } else {
      const globals = ["chill", "drive", "party", "romance"];
      staticGenre = globals[Math.floor(Math.random() * globals.length)];
  }
  
  // Try dynamic first from 1_Station_Jingle
  try {
    const jinglesDir = path.join(process.cwd(), "public", "local_audio_vault", "regional", genre, "1_Station_Jingle");
    if (fs.existsSync(jinglesDir)) {
      const files = fs.readdirSync(jinglesDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
      if (files.length > 0) {
        return `/local_audio_vault/regional/${genre}/1_Station_Jingle/${files[Math.floor(Math.random() * files.length)]}`;
      }
    }
  } catch (e) {
      console.error("[Master Clock] Error picking local sweeper", e);
  }
  
  // Static Fallbacks
  const sweepers = [
    `/local_audio_vault/regional/Sweepers/Sweeper_${staticGenre}_01.mp3`,
    `/local_audio_vault/regional/Sweepers/Sweeper_${staticGenre}_02.mp3`,
    `/local_audio_vault/regional/Sweepers/Sweeper_${staticGenre}_03.mp3`,
    `/local_audio_vault/regional/Sweepers/Sweeper_${staticGenre}_04.mp3`,
  ];
  return sweepers[Math.floor(Math.random() * sweepers.length)];
}

function getJingleByGenre(genre: string, currentHour?: number) {
  try {
    const jinglesDir = path.join(process.cwd(), "public", "local_audio_vault", "regional", genre, "1_Station_Jingle");
    if (fs.existsSync(jinglesDir)) {
      if (genre.toLowerCase() === "bagheli" && currentHour !== undefined) {
        const bagheliFiles = fs.readdirSync(jinglesDir).filter(f => f.toLowerCase().includes('bagheli') && f.endsWith(".mp3")).sort();
        if (bagheliFiles.length > 0) {
          const index = currentHour % bagheliFiles.length;
          return `/local_audio_vault/regional/${genre}/1_Station_Jingle/${bagheliFiles[index]}`;
        }
      }

      const files = fs.readdirSync(jinglesDir).filter(f => f.toLowerCase().includes(`station_jingle_`) && f.endsWith(".mp3"));
      if (files.length > 0) {
        return `/local_audio_vault/regional/${genre}/1_Station_Jingle/${files[Math.floor(Math.random() * files.length)]}`;
      }
    }
  } catch (e) {}
  
  return `/audio/jingles/Station_Jingle_chill.mp3`;
}


const PREMIUM_GENRES = {
  drive: {
    punjabi: ["punjabi indie pop", "punjabi hip hop", "desi hip hop", "punjabi rap", "upbeat desi indie"],
    hindi: ["hindi indie pop", "desi indie", "mumbai indie", "hindi upbeat synth", "indian pop indie"],
    intl: ["indie pop", "synth pop", "upbeat indie", "bedroom pop", "alt pop"]
  },
  chill: {
    punjabi: ["punjabi acoustic", "punjabi indie chill", "punjabi folk chill", "desi chill ambient"],
    hindi: ["hindi indie chill", "desi acoustic chill", "hindi chillwave", "indian ambient indie"],
    intl: ["lofi hip hop", "chillhop indie", "ambient electronic", "chill wave", "night drive ambient"]
  },
  party: {
    punjabi: ["punjabi trap", "punjabi edm", "desi bass", "desi trap indie"],
    hindi: ["desi bass", "hindi edm", "mumbai electronic", "indian edm", "hindi club indie"],
    intl: ["tech house", "festival bass", "electronic dance", "progressive house", "edm"]
  },
  romance: {
    punjabi: ["punjabi acoustic romance", "sufi acoustic", "punjabi folk love", "desi indie soul"],
    hindi: ["hindi acoustic love", "urdu acoustic", "desi soul", "hindi indie romance", "indian indie love"],
    intl: ["r&b romance", "slow jams indie", "acoustic love", "soulful pop", "indie folk romance"]
  },
  news: {
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

async function getSong(vibeConfig: { query: string, derivedVibe: string } | string, cityId: string, playedSongs: Set<string>): Promise<LocalTrack> {
  const isFallbackCall = typeof vibeConfig === "string" && vibeConfig === "fallback";
  
  // --- NEWS/TALK STATION PODCAST ROUTING ---
  if (cityId === "news" && !isFallbackCall) {
      const topics = ["technology india", "finance india", "artificial intelligence hindi", "startups india", "wellness hindi", "business india hindi", "career india", "leadership hindi"];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const podcast = await searchPodcastEpisode(randomTopic, playedSongs);
      if (podcast && !podcast.id.startsWith("system-fallback")) {
          playedSongs.add(podcast.id);
      }
      return podcast;
  }

  // --- LOCAL FILE SYSTEM AUDIO ENGINE ---
  // The system looks in `public/local_audio_vault/regional/{cityId}/5_Music`
  const baseAudioDir = path.join(process.cwd(), "public", "local_audio_vault", "regional");
  const targetDir = path.join(baseAudioDir, cityId, "5_Music");
  const globalFallbackDir = path.join(process.cwd(), "public", "audio", "global", "songs");
  const staticFallbackDir = path.join(process.cwd(), "public", "audio", "fallbacks");

  let files: string[] = [];
  let selectedDir = targetDir;

  if (fs.existsSync(targetDir)) {
      files = fs.readdirSync(targetDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
  }

  // Fallback to Global Songs if dialect folder is missing or empty
  if (files.length === 0 && fs.existsSync(globalFallbackDir)) {
      selectedDir = globalFallbackDir;
      files = fs.readdirSync(globalFallbackDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
  }

  // Absolute static fallback
  if (files.length === 0) {
      selectedDir = staticFallbackDir;
      if (fs.existsSync(staticFallbackDir)) {
          files = fs.readdirSync(staticFallbackDir).filter(f => f.endsWith(".mp3") || f.endsWith(".wav"));
      }
  }

  // Generate Fallback Track Object
  if (files.length === 0) {
      const fallbackTrack: LocalTrack = {
          id: "system-fallback-" + Math.random().toString(36).substring(7),
          title: "Future Radio Chill Mix (Backup)",
          artist: "System",
          durationSeconds: 339,
          streamUrl: "/audio/fallbacks/Future_Radio_1.mp3",
          permalink: "https://thefutureradio.com",
          license: "CC-BY",
          energyScore: 0.5
      };
      playedSongs.add(fallbackTrack.id);
      return fallbackTrack;
  }

  // Filter out played songs if we have enough tracks
  let validFiles = files.filter(f => !playedSongs.has(f));
  if (validFiles.length === 0) {
      playedSongs.clear(); // Reset history if we exhausted the library
      validFiles = files;
  }

  // Pick a random track
  const randomFile = validFiles[Math.floor(Math.random() * validFiles.length)];
  const relativeUrl = selectedDir.replace(path.join(process.cwd(), "public"), "").replace(/\\/g, "/");
  const streamUrl = `${relativeUrl}/${randomFile}`;

  let durSeconds = 200; // default 3 min 20 sec
  let trackTitle = randomFile.replace(/\.[^/.]+$/, "");
  let trackArtist = "Future Radio Artist";

  try {
      const metadata = await mm.parseFile(path.join(selectedDir, randomFile));
      durSeconds = metadata.format.duration || 200;
      if (metadata.common.title) trackTitle = metadata.common.title;
      if (metadata.common.artist) trackArtist = metadata.common.artist;
  } catch(e) {
      console.warn(`[Master Clock] Warning: Could not read metadata for song ${randomFile}. Error:`, e);
  }

  const track: LocalTrack = {
      id: randomFile, // use filename as unique ID locally
      title: trackTitle,
      artist: trackArtist,
      durationSeconds: durSeconds,
      streamUrl: streamUrl,
      permalink: "",
      license: "Local",
      energyScore: 0.5
  };

  playedSongs.add(track.id);
  return track;
}

async function getLocalAudioDuration(urlPath: string) {
  try {
    const filePath = path.join(process.cwd(), "public", urlPath);
    const metadata = await mm.parseFile(filePath);
    return Math.round((metadata.format.duration || 10) * 1000);
  } catch (e) {
    console.warn(`[Master Clock] Warning: Could not read duration for ${urlPath}, falling back to 10s. Error:`, e);
    // Return 10 seconds for sweepers/jingles if missing
    return 10000;
  }
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

    console.log(`[Master Clock] Generating channel playlist for Genre: ${cityId} at ${startTime.toISOString()}`);

    const liveWeather = await getLiveWeather(cityId);

    const schedule: any[] = [];
    let currentTimeMs = startTime.getTime();

    const addElement = (type: any, durationMs: number, urlOrId: string, metadata: any = {}) => {
      let finalDurationMs = durationMs;
      
      // HARD STOP: Never overshoot the 60-minute hot clock boundary (xx:59:59)
      if (cityId !== "news" && cityId !== "global" && cityId !== "drive" && currentTimeMs + finalDurationMs > targetEndTime.getTime()) {
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
    const getSafeSongDuration = (song: LocalTrack) => {
      let durMs = Math.round((song.durationSeconds || 0) * 1000);
      if (durMs < 60000) durMs = 240000; // Fallback to 4 mins if search returns a short clip or 0
      return durMs; // No more Math.min cap, let the song play fully!
    };

    const segmentIndex = 1;
    const lastSongTitle = "nothing";
    let lastTrackEnergy = 0.5;
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
             const { data: dbJts, error: jtErr } = await supabase
                 .from('manual_jocktalks')
                 .select('media_url, duration_ms, slot_index')
                 .eq('hour_block', currentIstHour)
                 .order('slot_index', { ascending: true });
                 
             if (!jtErr && dbJts) {
                 // Filter out any placeholders or empty audio to prevent stream breakage
                 manualJocktalks = dbJts.filter(j => j.media_url && j.media_url.trim() !== "" && !j.media_url.toLowerCase().includes("placeholder"));
                 totalManualJtDurMs = manualJocktalks.reduce((acc, curr) => acc + curr.duration_ms, 0);
             }
         } catch(e) {
             console.error("[Master Clock] Error fetching manual jocktalks:", e);
         }
    }

    // 1. TOTH Station Jingle (Always Segment 0)
    let totalScheduledDurationMs = 0;
    const stationId = getJingleByGenre(cityId, currentIstHour);
    const stationIdDur = await getLocalAudioDuration(stationId);
    addElement('station_id', stationIdDur, stationId, { title: "Station ID" });
    totalScheduledDurationMs += stationIdDur;
    
    // 2. Pre-fetch Songs to fill the hour
    const TARGET_HOUR_MS = 3600 * 1000;
    const AD_DURATION_MS = 30000;
    const NUM_ADS = 4;
    const NUM_JTS = isNightMode ? 0 : 4;
    const TOTAL_AD_TIME_MS = AD_DURATION_MS * NUM_ADS;
    
    const prefetchSongs: any[] = [];
    const prefetchSweepers: any[] = [];
    let currentMusicDuration = 0;
    
    let regionalCount = 0;
    let globalCount = 0;
    let bagheliJinglesInjected = 0;
    let globalOriginalsInjected = 0;
    let newOriginalsInjected = 0;
    let hasPlayedSpecialOriginal = false;
    const isCoreStation = cityId === "hindi" || cityId === "punjabi";
    const targetRegionalRatio = isCoreStation ? 0.2 : 0.5;

    // We fetch songs until we hit roughly 50-55 minutes, accounting for Ads and actual Manual Jocktalk durations
    while (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS + totalManualJtDurMs < (TARGET_HOUR_MS - 60000)) {
        if (isFallbackMode) {
             const fallbackTrack = await getSong("fallback", cityId, playedSongs);
             const dur = getSafeSongDuration(fallbackTrack);
             prefetchSongs.push({ type: 'song', song: fallbackTrack, duration: dur });
             currentMusicDuration += dur;
             
             const sw = await getContextualSweeper(cityId, lastTrackEnergy);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        } else {
             let song: any = null;
             
             // Inject Bagheli Original Jingles (2 per hour exactly)
             if (cityId === "bagheli" && bagheliJinglesInjected < 2 && (prefetchSongs.length === 3 || prefetchSongs.length === 7)) {
                 const jingleIndex = (currentIstHour + bagheliJinglesInjected) % 2; // alternates 0 and 1
                 const trackId = jingleIndex === 0 ? "original_fr_bagheli_jingle_1" : "original_fr_bagheli_jingle_2";
                 
                 const tracks = getOriginalTracks();
                 const jingleSong = tracks.find(t => t.id === trackId);
                 if (jingleSong) {
                     song = jingleSong;
                     bagheliJinglesInjected++;
                     playedSongs.add(song.id);
                 }
             }
             
             const totalSongs = regionalCount + globalCount;
             const currentRegionalRatio = totalSongs === 0 ? 0 : (regionalCount / totalSongs);
             
             let trackType = "regional";
             
             // 0.5 Try fetching newly added originals first (Force 2 per hour)
             if (!song && newOriginalsInjected < 2) {
                 song = getOriginalForStation("global", playedSongs, !hasPlayedSpecialOriginal, true);
                 if (song) {
                     newOriginalsInjected++;
                     globalCount++; // They are technically global
                     const tLower = song.title.toLowerCase();
                     if (tLower.includes("dekhi leb") || tLower.includes("tain sun")) hasPlayedSpecialOriginal = true;
                 }
             }
             
             // 1. Try fetching regional track if required
             if (!song && trackType === "regional") {
                 song = getOriginalForStation(cityId, playedSongs, !hasPlayedSpecialOriginal);
                 if (!song) {
                     song = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);
                     if (song.id.startsWith("system-fallback")) song = null;
                 }
                 
                 if (song) {
                     regionalCount++;
                     const tLower = song.title.toLowerCase();
                     if (tLower.includes("dekhi leb") || tLower.includes("tain sun")) hasPlayedSpecialOriginal = true;
                 } else {
                     trackType = "global";
                 }
             }
             
             // 2. Try fetching global track
             if (!song && trackType === "global") {
                 song = getOriginalForStation("global", playedSongs, !hasPlayedSpecialOriginal);
                 if (song) {
                     globalOriginalsInjected++;
                     const tLower = song.title.toLowerCase();
                     if (tLower.includes("dekhi leb") || tLower.includes("tain sun")) hasPlayedSpecialOriginal = true;
                 }
                 
                 if (!song) {
                     song = await getSong(getSearchQueryForGenre("global"), "global", playedSongs);
                     if (song.id.startsWith("system-fallback")) song = null;
                 }
                 
                 if (song) {
                     globalCount++;
                 }
             }
             
             // 3. Absolute Fallback
             if (!song) {
                 song = await getSong("fallback", cityId, playedSongs);
             }
             
             lastTrackEnergy = song.energyScore || 0.5;
             const dur = getSafeSongDuration(song);
             prefetchSongs.push({ type: 'song', song, duration: dur });
             currentMusicDuration += dur;
             
             const sw = await getContextualSweeper(cityId, lastTrackEnergy);
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
        addElement('song', prefetchSongs[i].duration, s.streamUrl, { title: s.title, artist: s.artist, trackId: s.id, permalink: s.permalink, coverArt: s.coverArt });
        
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
                        const fillerSw = await getContextualSweeper(cityId, prefetchSongs[i].song.energyScore || 0.5);
                        const dur = await getLocalAudioDuration(fillerSw);
                        addElement('sweeper', dur, fillerSw, { title: "Ad Fallback Sweeper" });
                    }
                    adCount++;
                } else {
                    // JT Insertion
                    const targetSlot = jtCount + 1;
                    
                    if (cityId === "news") {
                        // --- GLOBAL NEWS BITES FOR NEWS STATION ---
                        const newsBite = await getGlobalNewsBite(targetSlot);
                        if (newsBite) {
                            addElement('jocktalk', newsBite.durationMs, newsBite.mediaUrl, { 
                                title: `${newsBite.providerName} (Live Audio Update)`, 
                                rjName: "Global News Desk",
                                isEmptyPlaceholder: false 
                            });
                        } else {
                            const fillerSw = await getContextualSweeper(cityId, lastTrackEnergy);
                            const dur = await getLocalAudioDuration(fillerSw);
                            addElement('sweeper', dur, fillerSw, { title: "News Sweeper Fallback" });
                        }
                    } else if (cityId === "global" || cityId === "drive") {
                        // --- SHORT GLOBAL NEWS BITES FOR MUSIC STATIONS (1-2 MINS) ---
                        const newsBite = await getShortGlobalNewsBite(targetSlot);
                        if (newsBite) {
                            addElement('jocktalk', newsBite.durationMs, newsBite.mediaUrl, { 
                                title: `${newsBite.providerName} (Quick Global Update)`, 
                                rjName: "Future Radio Global",
                                isEmptyPlaceholder: false,
                                permalink: newsBite.permalink
                            });
                        } else {
                            const fillerSw = await getContextualSweeper(cityId, lastTrackEnergy);
                            const dur = await getLocalAudioDuration(fillerSw);
                            addElement('sweeper', dur, fillerSw, { title: "Global Sweeper Fallback" });
                        }
                    } else {
                        // --- MANUAL JOCKTALK FOR LOCAL MUSIC STATIONS ---
                        const manualJt = manualJocktalks.find(j => j.slot_index === targetSlot);
                        
                        if (manualJt) {
                            addElement('jocktalk', manualJt.duration_ms, manualJt.media_url, { 
                                title: `Live Studio RJ (Segment ${targetSlot})`, 
                                rjName: "Future Radio Live",
                                isEmptyPlaceholder: false 
                            });
                        } else {
                            // Fallback if RJ forgot to upload for this slot
                            const fillerSw = await getContextualSweeper(cityId, lastTrackEnergy);
                            const dur = await getLocalAudioDuration(fillerSw);
                            addElement('sweeper', dur, fillerSw, { title: "Station Sweeper (JT Fallback)" });
                        }
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
