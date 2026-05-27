"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "./useAudioStore";
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

  const ytPlayerRef = useRef<YTPlayerInstance | null>(null);
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
    const channel = supabase.channel(`radio_listeners_${cityId}`, {
      config: { presence: { key: listenerId } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      console.log("[Presence] Synced listeners.");
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ status: 'listening', startedAt: Date.now() });
      }
    });

    return () => {
      channel.untrack().then(() => supabase.removeChannel(channel));
    };
  }, [isPlaying, cityId, listenerId]);

  // 1. Initialize YouTube Iframe API
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) {
      initYoutubePlayer();
    } else {
      const existingScript = document.getElementById("yt-api-script");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      window.onYouTubeIframeAPIReady = () => initYoutubePlayer();
    }
    return () => {
      if (ytPlayerRef.current) try { ytPlayerRef.current.destroy(); } catch (e) {}
    };
  }, []);

  const initYoutubePlayer = () => {
    if (!window.YT) return;
    ytPlayerRef.current = new window.YT.Player("yt-player-container", {
      height: "100%", width: "100%", videoId: "",
      playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, showinfo: 0, origin: window.location.origin },
      events: {
        onReady: () => console.log("[Sync Engine] YouTube Player Ready"),
      },
    } as unknown as Record<string, unknown>);
  };

  // 2. Fetch Master Clock and Schedule on Mount
  useEffect(() => {
    if (!hasGesture) return;

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

        // Fetch Schedule
        const data = await getBroadcastSchedule(cityId);
        if (active) {
          setSchedule(data);
          console.log(`[Sync Engine] Loaded ${data.length} schedule elements`);
        }
      } catch (err) {
        console.error("[Sync Engine] Initialization failed:", err);
      }
    }
    initSync();
    return () => { active = false; };
  }, [hasGesture, cityId]);

  // 3. The Global Synchronizer Loop (Runs every 500ms)
  useEffect(() => {
    if (!hasGesture || !isPlaying || schedule.length === 0) return;

    const interval = setInterval(() => {
      const serverNow = new Date(Date.now() + syncOffsetMs);
      
      const activeElementIndex = schedule.findIndex(el => {
        const start = new Date(el.start_time);
        const end = new Date(el.end_time);
        return serverNow >= start && serverNow < end;
      });

      if (activeElementIndex === -1) {
        setPhase("idle");
        if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
        audioRef.current?.pause();
        bedRef.current?.pause();
        
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
      if (activeElement.element_type === "song" && ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
        if (remainingSeconds <= 4.0 && remainingSeconds > 0) {
          // Fade volume from 100 down to 0 over the last 4 seconds
          const fadeVol = Math.max(0, Math.floor((remainingSeconds / 4.0) * 100));
          ytPlayerRef.current.setVolume(fadeVol);
        } else {
          // Keep YouTube video at 100% max resolution volume
          ytPlayerRef.current.setVolume(100);
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
          songArtist: activeElement.metadata?.artist || "AI RJ AIRA",
          songDurationS: activeElement.duration_ms / 1000,
          rjAudioUrl: "", jingleUrl: "", rjTranscript: activeElement.metadata?.transcript || "",
          newsHeadlines: [], mood: "Live", validFrom: activeElement.start_time, validUntil: activeElement.end_time
        };
        setCurrentBlock(mockBlock);

        // Map upcoming 2 blocks
        const nextElements = schedule.slice(activeElementIndex + 1, activeElementIndex + 3);
        const upcomingMockBlocks = nextElements.map((el) => ({
          blockId: el.id,
          cityId: el.city_id,
          youtubeId: el.youtube_id || "",
          songTitle: el.metadata?.title || (el.element_type === 'jocktalk' ? 'AI RJ Break' : 'Radio Sweeper'),
          songArtist: el.metadata?.artist || "AI RJ AIRA",
          songDurationS: el.duration_ms / 1000,
          rjAudioUrl: "", jingleUrl: "", rjTranscript: "",
          newsHeadlines: [], mood: el.element_type, validFrom: el.start_time, validUntil: el.end_time
        }));
        setUpcomingBlocks(upcomingMockBlocks);

        // --- SEAMLESS TIGHT SEGUE ---
        // Instead of hard-pausing all players instantly causing dead air, we let the YouTube player overlap
        // for 2 seconds while the new audio element starts. 
        if (activeElement.element_type !== "song" && ytPlayerRef.current?.pauseVideo) {
          const yt = ytPlayerRef.current;
          setTimeout(() => yt.pauseVideo(), 2000);
        }
        
        // For HTML5 audio (Jocktalk), we pause immediately
        audioRef.current?.pause();
        
        // We DO NOT pause jingleRef! This allows the Jingle to overlap and 
        // organically "smartfade" into the next song or jocktalk!

        // If transitioning AWAY from a jocktalk, fade out the bed naturally over 1.5 seconds instead of hard cutting
        if (activeElement.element_type !== "jocktalk" && activeElement.element_type !== "traffic") {
          if (bedRef.current && !bedRef.current.paused) {
            const bed = bedRef.current;
            const startVol = bed.volume;
            let step = 0;
            const fadeInterval = setInterval(() => {
              step++;
              const newVol = startVol - (startVol * (step / 15)); // 15 steps over 1.5s
              if (newVol <= 0.05 || step >= 15) {
                bed.pause();
                bed.volume = 0;
                clearInterval(fadeInterval);
              } else {
                bed.volume = Math.max(0, newVol);
              }
            }, 100);
          }
        }

        // Start new element
        if (activeElement.element_type === "song") {
          setPhase("playing_song");
          if (ytPlayerRef.current?.loadVideoById) {
            ytPlayerRef.current.loadVideoById(activeElement.youtube_id);
            ytPlayerRef.current.seekTo(offsetSeconds, true);
            ytPlayerRef.current.setVolume(100); // Restored to max 100%
            ytPlayerRef.current.playVideo();
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
        // If an ad interrupts the YouTube iframe or it buffers heavily, aggressively seek it to the master clock
        if (activeElement.element_type === "song" && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const ytTime = ytPlayerRef.current.getCurrentTime();
          const state = ytPlayerRef.current.getPlayerState(); // 1 = playing, 2 = paused
          
          // Force play if it was paused (e.g. user hit play again)
          if (state === 2 || state === -1) {
            ytPlayerRef.current.seekTo(offsetSeconds, true);
            ytPlayerRef.current.playVideo();
          } else if (Math.abs(ytTime - offsetSeconds) > 3.0 && state !== 3) {
            // Drift correction
            console.warn(`[Sync Engine] Clock Drift Detected (Expected: ${offsetSeconds.toFixed(1)}, Actual: ${ytTime.toFixed(1)}). Seeking to master clock.`);
            ytPlayerRef.current.seekTo(offsetSeconds, true);
            ytPlayerRef.current.playVideo(); 
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
      if (ytPlayerRef.current?.pauseVideo) ytPlayerRef.current.pauseVideo();
      if (audioRef.current) audioRef.current.pause();
      if (bedRef.current) bedRef.current.pause();
      if (jingleRef.current) jingleRef.current.pause();
    }
  }, [isPlaying]);

  const handleGestureClick = () => {
    // Unblock browser autoplay stack
    if (ytPlayerRef.current?.playVideo) ytPlayerRef.current.playVideo();
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
      {!hasGesture && (
        <div 
          onClick={handleGestureClick}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center cursor-pointer"
          style={{ backgroundColor: "rgba(10, 10, 15, 0.95)" }}
        >
          <div className="text-6xl mb-4">📻</div>
          <div className="text-white text-xl font-medium">Tap to start Future Radio</div>
          <div className="text-gray-400 text-sm mt-2">Global Broadcast Feed</div>
        </div>
      )}

      <div className="fixed top-0 left-0 bg-black/80 text-cyan-400 p-2 z-[9998] text-xs font-mono border border-cyan-500 rounded-br-lg pointer-events-none">
        <div>[Global Master Clock Sync]</div>
        <div>Offset: {syncOffsetMs}ms</div>
        <div>Schedule: {schedule.length} elements</div>
      </div>

      <div className={playerStyleClass} data-testid="yt-player-container-parent">
        <div id="yt-player-container" className="w-full h-full" />
        
        {/* TV Channel Broadcast Watermark */}
        {isRadioMode && (
          <div className="absolute top-3 right-4 z-50 opacity-60 pointer-events-none drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            <img src="/logo.png" alt="Broadcast Bug" className="h-12 w-auto object-contain mix-blend-screen" />
          </div>
        )}
      </div>

      <audio ref={keepAliveRef} src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" loop preload="auto" />
      <audio ref={audioRef} />
      <audio ref={jingleRef} />
      <audio ref={bedRef} loop />
    </>
  );
}
