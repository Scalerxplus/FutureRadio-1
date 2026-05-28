"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore, unlockAudio } from "./useAudioStore";
import { useUiStore, useCityStore } from "@/lib/store";
import { getBroadcastSchedule } from "@/lib/supabase/playlist";
import { createClient } from "@/lib/supabase/client";
import { PlaylistBlock } from "@/lib/types";

interface YTPlayerInstance {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(volume: number): void;
  loadVideoById(videoId: string): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}

declare global {
  interface Window {
    YT: { Player: new (id: string, options: Record<string, unknown>) => YTPlayerInstance };
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

// Native Web Audio API Radio Zap/Swoosh
function playRadioZapper() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const bufferSize = ctx.sampleRate * 3.0; // 3.0 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Add a bandpass filter to give it that authentic FM tuning "zap"
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(7000, ctx.currentTime + 1.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    // 30% volume boost (0.2 -> 0.26) and peak exactly in the middle (1.5s)
    gain.gain.linearRampToValueAtTime(0.26, ctx.currentTime + 1.5); // Smooth fade in
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.8); // Long tail fade out

    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch (e) {
    // Ignore errors on devices with strict autoplay policies
  }
}



export default function AudioOrchestrator() {
  const { mode } = useUiStore();
  const { cityId } = useCityStore();
  const {
    isPlaying,
    hasGesture,
    setPhase,
    setCurrentBlock,
    setUpcomingBlocks,
    setIsPlaying,
    setHasGesture,
  } = useAudioStore();

  // HTML5 Media Players
  const audiusRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const jingleRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);
  const currentElementIdRef = useRef<string | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
  const zapperFiredRef = useRef<boolean>(false);
  const prefetchedUrlsRef = useRef<Set<string>>(new Set());
  const [listenerId] = useState(() => typeof window !== "undefined" ? crypto.randomUUID() : "anon");

  // Realtime Presence Tracker for Live Listeners Count
  useEffect(() => {
    if (!isPlaying) return;
    
    const supabase = createClient();
    const channelName = `radio_listeners_${cityId}`;
    let activeChannel: any;

    const setupPresence = async () => {
      // Clean up any existing strict-mode channels first to prevent "cannot add presence after subscribe" error
      await supabase.removeAllChannels();

      activeChannel = supabase.channel(channelName, {
        config: { presence: { key: listenerId } }
      });

      activeChannel.on('presence', { event: 'sync' }, () => {
        // Presence synced
      }).subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          activeChannel.track({ status: 'listening', startedAt: Date.now() });
        }
      });
    };

    setupPresence();

    return () => {
      if (activeChannel) {
        activeChannel.untrack().then(() => supabase.removeChannel(activeChannel));
      } else {
        supabase.removeAllChannels();
      }
    };
  }, [isPlaying, cityId, listenerId]);

  // 1. Initialize Native Audio Elements
  useEffect(() => {
    if (typeof window !== "undefined" && !audiusRef.current) {
      audiusRef.current = new Audio();
      audiusRef.current.crossOrigin = "anonymous";
    }
    return () => {
      if (audiusRef.current) {
         audiusRef.current.pause();
         audiusRef.current.src = "";
      }
    };
  }, []);

  // 1.5 Global interaction listener to auto-unlock audio on first touch/scroll anywhere
  useEffect(() => {
    if (hasGesture) return;
    
    const unlockFn = () => {
      unlockAudio(true);
      setHasGesture(true);
      if (!isPlaying) setIsPlaying(true);
    };

    window.addEventListener("click", unlockFn, { once: true });
    window.addEventListener("touchstart", unlockFn, { once: true });
    window.addEventListener("scroll", unlockFn, { once: true });
    window.addEventListener("keydown", unlockFn, { once: true });

    return () => {
      window.removeEventListener("click", unlockFn);
      window.removeEventListener("touchstart", unlockFn);
      window.removeEventListener("scroll", unlockFn);
      window.removeEventListener("keydown", unlockFn);
    };
  }, [hasGesture, isPlaying, setHasGesture, setIsPlaying]);

  // 2. Fetch Master Clock and Schedule on Mount
  useEffect(() => {
    let active = true;
    async function initSync() {
      try {
        // Sync Time
        const timeRes = await fetch("/api/time");
        const timeData = await timeRes.json();
        const serverTime = new Date(timeData.server_time).getTime();
        const offset = serverTime - Date.now();
        setSyncOffsetMs(offset);
        console.log(`[Sync Engine] Clock offset calculated: ${offset}ms`);

        // Fetch Schedule Initial
        const data = await getBroadcastSchedule(cityId);
        if (active) {
          setSchedule(data);
          console.log(`[Sync Engine] Loaded ${data.length} schedule elements`);
        }

        // Live Hot-Reloading: Poll for schedule updates every 30 seconds
        // This ensures any dashboard injections/edits take effect immediately for active listeners
        const pollInterval = setInterval(async () => {
          if (!active) return;
          try {
            const freshData = await getBroadcastSchedule(cityId);
            setSchedule(freshData);
          } catch(e) {
            console.warn("[Sync Engine] Background schedule refresh failed", e);
          }
        }, 30000);

        return () => clearInterval(pollInterval);
      } catch (err) {
        console.error("[Sync Engine] Initialization failed:", err);
      }
    }
    const cleanupPoll = initSync();
    return () => { active = false; cleanupPoll.then(c => c && c()); };
  }, [hasGesture, cityId]);

  // 3. The Global Synchronizer Loop (Runs every 500ms)
  useEffect(() => {
    if (schedule.length === 0) return;

    const interval = setInterval(() => {
      const serverNow = new Date(Date.now() + syncOffsetMs);
      
      const activeElementIndex = schedule.findIndex(el => {
        const start = new Date(el.start_time);
        const end = new Date(el.end_time);
        return serverNow >= start && serverNow < end;
      });

      if (activeElementIndex === -1) {
        if (currentElementIdRef.current !== "FALLBACK") {
          currentElementIdRef.current = "FALLBACK";
          setPhase("idle"); // using idle so UI shows "Station Standby" or similar
          audioRef.current?.pause();
          bedRef.current?.pause();
          
          if (audiusRef.current) {
            // Ultimate safe fallback
            audiusRef.current.src = "https://discoveryprovider.audius.co/v1/tracks/l88e8/stream?app_name=FutureRadio";
            audiusRef.current.play().catch(e => console.error(e));
            console.log(`[Sync Engine] Undershoot detected! Playing supplement fallback track`);
          }
        }
        
        // Auto-generate next hour if schedule has expired
        if (!isGeneratingRef.current && schedule.length > 0) {
          isGeneratingRef.current = true;
          console.log("[Sync Engine] Schedule ran out. Auto-generating next hour...");
          fetch("/api/broadcast/generate-hour", { method: "POST" })
            .then(() => getBroadcastSchedule(cityId))
            .then((newData) => {
              setSchedule(newData);
              isGeneratingRef.current = false;
            })
            .catch((err) => {
              console.error("[Sync Engine] Auto-generation failed:", err);
              isGeneratingRef.current = false;
            });
        }
        return;
      }

      const activeElement = schedule[activeElementIndex];

      const offsetSeconds = (serverNow.getTime() - new Date(activeElement.start_time).getTime()) / 1000;
      const remainingSeconds = (new Date(activeElement.end_time).getTime() - serverNow.getTime()) / 1000;

      // --- SMART CROSSFADING (FADE OUT) ---
      if (activeElement.element_type === "song" && audiusRef.current) {
        if (remainingSeconds <= 4.0 && remainingSeconds > 0) {
          // Fade volume from 1.0 down to 0 over the last 4 seconds
          const fadeVol = Math.max(0, remainingSeconds / 4.0);
          audiusRef.current.volume = fadeVol;
        } else {
          audiusRef.current.volume = 1.0;
        }
      }

      // --- AUDIO DUCKING LOGIC FOR RJ BED ---
      if ((activeElement.element_type === "jocktalk" || activeElement.element_type === "traffic") && bedRef.current) {
        const elapsed = offsetSeconds;
        const remain = remainingSeconds;

        let targetVol = 0.1;
        if (elapsed < 2.0) {
          targetVol = 0.4 - (elapsed / 2.0) * 0.3; // Fade down from 0.4 to 0.1 over 2 seconds
        } else if (remain < 2.0) {
          targetVol = 0.4 - (remain / 2.0) * 0.3;  // Fade up from 0.1 to 0.4 over last 2 seconds
        } else {
          targetVol = 0.1;
        }
        bedRef.current.volume = Math.max(0, Math.min(1, targetVol));
      } else if (activeElement.element_type !== "jocktalk" && activeElement.element_type !== "traffic" && bedRef.current && offsetSeconds > 0.5) {
        // FAILSAFE: Force pause the bed if we are in a song, ad, or jingle.
        // This prevents the bed from accidentally looping behind songs indefinitely, especially in background tabs.
        if (!bedRef.current.paused) {
            bedRef.current.pause();
            bedRef.current.volume = 0;
        }
      }

      // --- 60s PRE-FETCH QUEUE LOGIC (BUG 2 FIX) ---
      // Triggers LLM + TTS generation 60s early so it's fully cached before the break
      const nextElement = schedule[activeElementIndex + 1];
      if (nextElement && (nextElement.element_type === "jocktalk" || nextElement.element_type === "traffic")) {
        if (remainingSeconds <= 60 && remainingSeconds > 0 && !prefetchedUrlsRef.current.has(nextElement.id)) {
          console.log(`[Sync Engine] Pre-fetching TTS (60s early) for upcoming block: ${nextElement.id}`);
          prefetchedUrlsRef.current.add(nextElement.id);
          fetch(nextElement.media_url, { cache: "force-cache" }).catch(e => console.error("Prefetch failed", e));
        }
      }

      // --- MAGIC 1.5s ZAPPER CROSSFADE SEGUE ---
      if (remainingSeconds <= 1.5 && remainingSeconds > 0 && !zapperFiredRef.current) {
        console.log(`[Sync Engine] Firing Zapper crossfade (1.5s remaining)`);
        playRadioZapper();
        zapperFiredRef.current = true;
      }

      // --- STATE TRANSITION DETECTED ---
      if (currentElementIdRef.current !== activeElement.id) {
        console.log(`[Sync Engine] Transitioning to ${activeElement.element_type} (Offset: ${offsetSeconds.toFixed(1)}s)`);
        currentElementIdRef.current = activeElement.id;
        zapperFiredRef.current = false; // Reset for the next transition

        // Map to mock PlaylistBlock for the UI
        const mockBlock: PlaylistBlock = {
          blockId: activeElement.id,
          cityId: activeElement.city_id,
          youtubeId: activeElement.youtube_id || "",
          songTitle: activeElement.metadata?.title || "Future Radio Broadcast",
          songArtist: activeElement.metadata?.artist || "Future Radio Intelligence",
          songDurationS: activeElement.duration_ms / 1000,
          rjAudioUrl: "", jingleUrl: "", rjTranscript: activeElement.metadata?.transcript || "",
          newsHeadlines: [], mood: "Live", validFrom: activeElement.start_time, validUntil: activeElement.end_time,
          coverArt: activeElement.metadata?.coverArt || activeElement.metadata?.artwork_url || ""
        };
        setCurrentBlock(mockBlock);

        if ('mediaSession' in navigator) {
          const displayTitle = activeElement.element_type === 'jocktalk' ? 'Station Intelligence Break' : (activeElement.element_type === 'sweeper' ? 'Radio Sweeper' : mockBlock.songTitle);
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `Future Radio - ${displayTitle}`,
            artist: mockBlock.songArtist,
            album: "Live 24/7"
          });
        }

        // Map upcoming 2 blocks
        const nextElements = schedule.slice(activeElementIndex + 1, activeElementIndex + 3);
        const upcomingMockBlocks = nextElements.map((el) => ({
          blockId: el.id,
          cityId: el.city_id,
          youtubeId: el.youtube_id || "",
          songTitle: el.metadata?.title || (el.element_type === 'jocktalk' ? 'Station Intelligence Break' : 'Radio Sweeper'),
          songArtist: el.metadata?.artist || "Future Radio Intelligence",
          songDurationS: el.duration_ms / 1000,
          rjAudioUrl: "", jingleUrl: "", rjTranscript: "",
          newsHeadlines: [], mood: el.element_type, validFrom: el.start_time, validUntil: el.end_time,
          coverArt: el.metadata?.coverArt || el.metadata?.artwork_url || ""
        }));
        setUpcomingBlocks(upcomingMockBlocks);

        // --- SEAMLESS TIGHT SEGUE ---
        // Instead of hard-pausing all players instantly causing dead air, we let the Audius player overlap
        // for 2 seconds while the new audio element starts. 
        if (activeElement.element_type !== "song" && audiusRef.current && !audiusRef.current.paused) {
          const audius = audiusRef.current;
          if (activeElement.element_type === "sweeper" || activeElement.element_type === "station_id") {
            audius.pause();
          } else {
            setTimeout(() => audius.pause(), 2000);
          }
        }
        
        // For HTML5 audio (Jocktalk), we pause immediately
        audioRef.current?.pause();
        
        // We DO NOT pause jingleRef! This allows the Jingle to overlap and 
        // organically "smartfade" into the next song or jocktalk!

        // Fading with setInterval causes 30+ second overlapping bugs when browser tabs are in the background and JS is throttled.
        if (activeElement.element_type !== "jocktalk" && activeElement.element_type !== "traffic") {
          if (bedRef.current && !bedRef.current.paused) {
            bedRef.current.pause();
            bedRef.current.volume = 0;
          }
        }

        // If the user hasn't explicitly hit Play, we stop here. 
        // UI metadata (above) is updated, but no audio will automatically play.
        if (!hasGesture || !isPlaying) return;

        // Start new element
        if (activeElement.element_type === "song") {
          setPhase("playing_song");
          if (audiusRef.current) {
            if (audiusRef.current.src !== activeElement.youtube_id) {
               audiusRef.current.src = activeElement.youtube_id; // For Audius, youtube_id actually holds the streamUrl!
            }
            if (offsetSeconds > 0.5) {
               try { audiusRef.current.currentTime = offsetSeconds; } catch(e) {}
            }
            audiusRef.current.volume = 1.0;
            audiusRef.current.play().catch(e => console.error("Audius play error", e));
          }
        } else {
          setPhase(activeElement.element_type === "jocktalk" || activeElement.element_type === "traffic" ? "playing_jocktalk" : "playing_jingle");
          
          if (activeElement.element_type === "jocktalk" || activeElement.element_type === "traffic") {
            if (audioRef.current) {
              audioRef.current.src = activeElement.media_url;
              audioRef.current.volume = 1.0;
              audioRef.current.onloadedmetadata = () => {
                if (audioRef.current && offsetSeconds > 0.5 && offsetSeconds < (activeElement.duration_ms / 1000)) {
                  try { audioRef.current.currentTime = offsetSeconds; } catch (e) {}
                }
              };
              audioRef.current.play().catch(e => {
                console.error("Audio block failed:", e);
                // FAILSAFE (BUG 2 FIX): Play local station ID if TTS fetch fails
                if (audioRef.current) {
                  audioRef.current.src = "/audio/jingles/lofi-bed.mp3";
                  audioRef.current.play().catch(() => {});
                }
              });
              
              // CLEAR BUFFER (BUG 1 FIX)
              audioRef.current.onended = () => {
                if (audioRef.current) audioRef.current.src = "";
              };
            }
          } else {
            // It's a Station ID or Sweeper! Use the dedicated overlapping Jingle player
            if (jingleRef.current) {
              jingleRef.current.src = activeElement.media_url;
              jingleRef.current.volume = 1.0;
              jingleRef.current.onloadedmetadata = () => {
                if (jingleRef.current && offsetSeconds > 0.5 && offsetSeconds < (activeElement.duration_ms / 1000)) {
                  try { jingleRef.current.currentTime = offsetSeconds; } catch (e) {}
                }
              };
              jingleRef.current.play().catch(e => console.error("Jingle block failed:", e));
            }
          }

          // Start ambient bed
          if ((activeElement.element_type === "jocktalk" || activeElement.element_type === "traffic") && bedRef.current) {
            
            // Dynamic Day-Part News Bed Mapping
            const hour = serverNow.getHours();
            let bedFile = "news-bed-deep.mp3"; // Default for Night/Morning Zen (analytical/deep economy)
            if (hour >= 8 && hour < 11) bedFile = "news-bed-urgent.mp3"; // Morning Drive (fast-paced opening bell)
            else if (hour >= 11 && hour < 16) bedFile = "news-bed-analytical.mp3"; // Mid-Day (market insights)
            else if (hour >= 16 && hour < 21) bedFile = "news-bed-urgent.mp3"; // Evening Rush (breaking news / closing bell)
            else if (hour >= 21 || hour < 1) bedFile = "news-bed-global.mp3"; // Global Club (international markets)
            
            const targetBedSrc = `/audio/jingles/${bedFile}`;

            // Only restart bed if it's not already playing the correct track
            if (bedRef.current.paused || !bedRef.current.src.includes(bedFile)) {
              bedRef.current.src = targetBedSrc;
              bedRef.current.volume = 0.4; // Starts normalized at 40%, ducking logic will push it down to 10%
              bedRef.current.play().catch(() => {});
            }
          }
        }
      } else {
        // --- CONTINUOUS SYNC CORRECTION & PLAYBACK RESUMPTION ---
        // If the player is paused, don't attempt continuous playback resumption
        if (!hasGesture || !isPlaying) return;
        
        // If the audio buffers heavily, aggressively seek it to the master clock
        if (activeElement.element_type === "song" && audiusRef.current) {
          const audioTime = audiusRef.current.currentTime;
          
          if (audiusRef.current.paused) {
            try { audiusRef.current.currentTime = offsetSeconds; } catch(e) {}
            audiusRef.current.play().catch(() => {});
          } else if (Math.abs(audioTime - offsetSeconds) > 3.0) {
            // Drift correction
            console.warn(`[Sync Engine] Clock Drift Detected (Expected: ${offsetSeconds.toFixed(1)}, Actual: ${audioTime.toFixed(1)}). Seeking to master clock.`);
            try { audiusRef.current.currentTime = offsetSeconds; } catch(e) {}
          }
        } else if (activeElement.element_type === "jocktalk" || activeElement.element_type === "traffic") {
          // Resume HTML5 Audio if paused
          if (audioRef.current && audioRef.current.paused) {
            try { audioRef.current.currentTime = offsetSeconds; } catch (e) {}
            audioRef.current.play().catch(() => {});
          }
          if (bedRef.current && bedRef.current.paused) {
            try { bedRef.current.currentTime = offsetSeconds; } catch(e) {}
            bedRef.current.play().catch(() => {});
          }
        } else {
          // Resume Jingle if paused
          if (jingleRef.current && jingleRef.current.paused) {
            try { jingleRef.current.currentTime = offsetSeconds; } catch (e) {}
            jingleRef.current.play().catch(() => {});
          }
        }
      }

    }, 500);

    return () => clearInterval(interval);
  }, [hasGesture, isPlaying, schedule, syncOffsetMs, setPhase, setCurrentBlock]);

  // Handle play/pause state
  useEffect(() => {
    if (isPlaying) {
      if (keepAliveRef.current) keepAliveRef.current.play().catch(() => {});
    } else {
      // Pause all active media when user hits Stop
      if (audiusRef.current) audiusRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      if (bedRef.current) bedRef.current.pause();
      if (jingleRef.current) jingleRef.current.pause();
    }
  }, [isPlaying]);

  const handleGestureClick = () => {
    // Unblock browser autoplay stack
    if (audiusRef.current && audiusRef.current.paused) audiusRef.current.play().catch(() => {});
    
    const silentSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    if (audiusRef.current && !audiusRef.current.src) audiusRef.current.src = silentSrc;
    if (audioRef.current && !audioRef.current.src) audioRef.current.src = silentSrc;
    if (bedRef.current && !bedRef.current.src) bedRef.current.src = silentSrc;
    if (jingleRef.current && !jingleRef.current.src) jingleRef.current.src = silentSrc;

    audiusRef.current?.play().catch(() => {});
    audioRef.current?.play().catch(() => {});
    bedRef.current?.play().catch(() => {});
    jingleRef.current?.play().catch(() => {});
    keepAliveRef.current?.play().catch(() => {});

    setHasGesture(true);
    setIsPlaying(true);
  };

  const isRadioMode = mode === "radio";
  const playerStyleClass = isRadioMode
    ? "absolute top-[76px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] aspect-[16/9] rounded-2xl border border-[#2a2a35] bg-[#111118] shadow-2xl z-30 overflow-hidden pointer-events-none"
    : "absolute bottom-0 left-0 w-[1px] h-[1px] overflow-hidden pointer-events-none";

  return (
    <>
      {/* Tap to Start overlay removed globally */}



      <audio id="keepalive-player" ref={keepAliveRef} src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" loop preload="auto" />
      <audio id="audius-player" ref={audiusRef} crossOrigin="anonymous" />
      <audio id="html5-player" ref={audioRef} />
      <audio id="jingle-player" ref={jingleRef} />
      <audio id="bed-player" ref={bedRef} loop />
    </>
  );
}
