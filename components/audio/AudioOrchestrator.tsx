"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore, unlockAudio } from "./useAudioStore";
import { useUiStore, useCityStore } from "@/lib/store";
import { getBroadcastSchedule } from "@/lib/supabase/playlist";
import { createClient } from "@/lib/supabase/client";
import { PlaylistBlock } from "@/lib/types";

// Native Web Audio API Radio Zap/Swoosh
function playRadioZapper() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const bufferSize = ctx.sampleRate * 3.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(7000, ctx.currentTime + 1.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.26, ctx.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
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

  // 3-Deck Continuous Playout Model
  const mediaRefA = useRef<HTMLAudioElement | null>(null);
  const mediaRefB = useRef<HTMLAudioElement | null>(null);
  const mediaRefC = useRef<HTMLAudioElement | null>(null);
  const activeDeckRef = useRef<"A" | "B" | "C">("A");
  const sweeperRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);
  const currentElementIdRef = useRef<string | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
  const zapperFiredRef = useRef<boolean>(false);
  const prefetchedUrlsRef = useRef<Set<string>>(new Set());
  const activeBlockIdRef = useRef<string | null>(null);
  const transitionTimeRef = useRef<number>(0);
  const webAudioInitializedRef = useRef<boolean>(false);
  const [listenerId] = useState(() => typeof window !== "undefined" ? crypto.randomUUID() : "anon");

  // --- LOUDNORM: Inject Web Audio API Compressor ---
  useEffect(() => {
    if (hasGesture && !webAudioInitializedRef.current) {
      webAudioInitializedRef.current = true;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(12, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);
        
        compressor.connect(ctx.destination);

        const refs = [mediaRefA, mediaRefB, mediaRefC, sweeperRef];
        refs.forEach(r => {
          if (r.current) {
            const source = ctx.createMediaElementSource(r.current);
            source.connect(compressor);
          }
        });
        
        console.log("[AudioOrchestrator] Web Audio API Loudness Normalizer (Compressor) injected!");
      } catch (e) {
        console.error("[AudioOrchestrator] Failed to inject Compressor (CORS/State Error)", e);
      }
    }
  }, [hasGesture]);

  // --- SMART AUTO-HEAL: Silence Detection ---
  const handleMediaError = (deckType: "A" | "B" | "C" | "sweeper") => {
    let targetRef: React.MutableRefObject<HTMLAudioElement | null> | null = null;
    let fallbackSrc = "";

    switch(deckType) {
      case "A": targetRef = mediaRefA; fallbackSrc = "/audio/fallbacks/Future_Radio_2.mp3"; break;
      case "B": targetRef = mediaRefB; fallbackSrc = "/audio/fallbacks/Future_Radio_8.mp3"; break;
      case "C": targetRef = mediaRefC; fallbackSrc = "/audio/fallbacks/Future_Radio_Tuned_1.mp3"; break;
      case "sweeper": targetRef = sweeperRef; fallbackSrc = "/audio/jingles/Generic_Sponsor_Break.mp3"; break;
    }

    if (targetRef && targetRef.current && targetRef.current.src && !targetRef.current.src.includes(fallbackSrc)) {
      console.warn(`[Auto-Heal] Silence/Error detected on Deck ${deckType}. Injecting fallback audio!`);
      targetRef.current.src = fallbackSrc;
      targetRef.current.play().catch(() => {});
    }
  };

  // Realtime Presence Tracker for Live Listeners Count
  useEffect(() => {
    if (!isPlaying) return;
    const supabase = createClient();
    const channelName = `radio_listeners_${cityId}`;
    let activeChannel: any;

    const setupPresence = async () => {
      await supabase.removeAllChannels();
      activeChannel = supabase.channel(channelName, {
        config: { presence: { key: listenerId } }
      });

      activeChannel.on('presence', { event: 'sync' }, () => {}).subscribe((status: string) => {
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
    if (typeof window !== "undefined") {
      if (!mediaRefA.current) { mediaRefA.current = new Audio(); mediaRefA.current.crossOrigin = "anonymous"; }
      if (!mediaRefB.current) { mediaRefB.current = new Audio(); mediaRefB.current.crossOrigin = "anonymous"; }
      if (!mediaRefC.current) { mediaRefC.current = new Audio(); mediaRefC.current.crossOrigin = "anonymous"; }
    }
    return () => {
      if (mediaRefA.current) { mediaRefA.current.pause(); mediaRefA.current.src = ""; }
      if (mediaRefB.current) { mediaRefB.current.pause(); mediaRefB.current.src = ""; }
      if (mediaRefC.current) { mediaRefC.current.pause(); mediaRefC.current.src = ""; }
    };
  }, []);

  // 1.5 Global interaction listener to auto-unlock audio
  useEffect(() => {
    if (hasGesture) return;
    const unlockFn = () => {
      unlockAudio();
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
        const timeRes = await fetch("/api/time");
        const timeData = await timeRes.json();
        const serverTime = new Date(timeData.server_time).getTime();
        const offset = serverTime - Date.now();
        setSyncOffsetMs(offset);

        const data = await getBroadcastSchedule(cityId);
        if (active) setSchedule(data);

        const pollInterval = setInterval(async () => {
          if (!active) return;
          try {
            const freshData = await getBroadcastSchedule(cityId);
            setSchedule(freshData);
          } catch(e) {}
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
    const interval = setInterval(() => {
      if (schedule.length === 0) {
        if (currentElementIdRef.current !== "FALLBACK") {
          currentElementIdRef.current = "FALLBACK";
          setPhase("idle");
          mediaRefB.current?.pause();
          mediaRefC.current?.pause();
          if (mediaRefA.current) {
            mediaRefA.current.src = "https://discoveryprovider.audius.co/v1/tracks/l88e8/stream?app_name=FutureRadio";
            mediaRefA.current.play().catch(e => console.error(e));
          }
        }
        return;
      }

      const serverNow = new Date(Date.now() + syncOffsetMs);
      let currentIndex = -1;
      
      if (activeBlockIdRef.current) {
         currentIndex = schedule.findIndex(el => el.id === activeBlockIdRef.current);
      }
      
      if (currentIndex === -1) {
         currentIndex = schedule.findIndex(el => {
           const start = new Date(el.start_time).getTime();
           const end = new Date(el.end_time).getTime();
           return serverNow.getTime() >= start && serverNow.getTime() < end;
         });
         
         if (currentIndex !== -1) {
             activeBlockIdRef.current = schedule[currentIndex].id;
             transitionTimeRef.current = Date.now() - (serverNow.getTime() - new Date(schedule[currentIndex].start_time).getTime());
         }
      }

      if (currentIndex === -1) {
        if (currentElementIdRef.current !== "FALLBACK") {
          currentElementIdRef.current = "FALLBACK";
          setPhase("idle");
          mediaRefB.current?.pause();
          mediaRefC.current?.pause();
          if (mediaRefA.current) {
            mediaRefA.current.src = "https://discoveryprovider.audius.co/v1/tracks/l88e8/stream?app_name=FutureRadio";
            mediaRefA.current.play().catch(e => console.error(e));
          }
        }
        
        if (!isGeneratingRef.current && schedule.length > 0) {
          isGeneratingRef.current = true;
          fetch("/api/broadcast/generate-hour", { method: "POST" })
            .then(() => getBroadcastSchedule(cityId))
            .then((newData) => {
              setSchedule(newData);
              isGeneratingRef.current = false;
              activeBlockIdRef.current = null;
            })
            .catch(() => { isGeneratingRef.current = false; });
        }
        return;
      }

      const activeElement = schedule[currentIndex];
      
      // Identify Active Deck based on continuous rotation (except sweepers)
      let activeDeck: HTMLAudioElement | null = null;
      if (activeElement.element_type === "sweeper" || activeElement.element_type === "station_id") {
         activeDeck = sweeperRef.current;
      } else {
         activeDeck = activeDeckRef.current === "A" ? mediaRefA.current : (activeDeckRef.current === "B" ? mediaRefB.current : mediaRefC.current);
      }

      let offsetSeconds = (Date.now() - transitionTimeRef.current) / 1000;
      let pseudoRemainingSeconds = (activeElement.duration_ms / 1000) - offsetSeconds;
      
      if (activeDeck && activeDeck.duration && !isNaN(activeDeck.duration)) {
          pseudoRemainingSeconds = activeDeck.duration - activeDeck.currentTime;
      }

      const activeElementEndTime = new Date(activeElement.end_time).getTime();
      const isExpiredByClock = serverNow.getTime() >= (activeElementEndTime - 3500);
      
      let shouldAdvance = false;
      if (isPlaying && activeDeck && activeDeck.duration && !isNaN(activeDeck.duration)) {
         const remainingTimeOnDeck = activeDeck.duration - activeDeck.currentTime;
         if ((remainingTimeOnDeck <= 1.0 && remainingTimeOnDeck > 0) || activeDeck.ended) {
            shouldAdvance = true;
         }
      }
      if (!shouldAdvance && isExpiredByClock) {
         shouldAdvance = true;
      }

      if (shouldAdvance) {
         if (currentIndex + 1 < schedule.length) {
            activeBlockIdRef.current = schedule[currentIndex + 1].id;
            currentIndex = currentIndex + 1;
            transitionTimeRef.current = Date.now();
            offsetSeconds = 0.0;
            pseudoRemainingSeconds = schedule[currentIndex].duration_ms / 1000;
         } else {
            currentIndex = currentIndex + 1;
         }
      }

      if (currentIndex >= schedule.length) return;
      const currentElementToPlay = schedule[currentIndex];

      // --- 60s PRE-FETCH QUEUE LOGIC ---
      const nextElement = schedule[currentIndex + 1];
      if (nextElement && (nextElement.element_type === "jocktalk" || nextElement.element_type === "traffic")) {
        if (pseudoRemainingSeconds <= 60 && pseudoRemainingSeconds > 0 && !prefetchedUrlsRef.current.has(nextElement.id)) {
          prefetchedUrlsRef.current.add(nextElement.id);
          fetch(nextElement.media_url, { cache: "force-cache" }).catch(e => console.error("Prefetch failed", e));
        }
      }

      // --- NEXT DECK AHEAD-OF-TIME (AOT) HTML5 PRELOADING ---
      if (nextElement && nextElement.element_type !== "sweeper" && nextElement.element_type !== "station_id") {
          const nextDeckName = activeDeckRef.current === "A" ? "B" : (activeDeckRef.current === "B" ? "C" : "A");
          const nextDeck = nextDeckName === "A" ? mediaRefA.current : (nextDeckName === "B" ? mediaRefB.current : mediaRefC.current);
          const nextTargetUrl = nextElement.element_type === "song" ? nextElement.youtube_id : nextElement.media_url;
          
          if (nextDeck && nextDeck.src !== nextTargetUrl && nextTargetUrl) {
              nextDeck.src = nextTargetUrl;
              nextDeck.preload = "auto";
              console.log(`[Smart Preload] Loading upcoming track into Deck ${nextDeckName} early.`);
          }
      }

      // --- MAGIC 1.5s ZAPPER CROSSFADE SEGUE ---
      if (pseudoRemainingSeconds <= 1.5 && pseudoRemainingSeconds > 0 && !zapperFiredRef.current) {
        playRadioZapper();
        zapperFiredRef.current = true;
      }

      // --- STATE TRANSITION DETECTED ---
      if (currentElementIdRef.current !== currentElementToPlay.id) {
        currentElementIdRef.current = currentElementToPlay.id;
        zapperFiredRef.current = false;

        // Toggle 3-Deck Rotation for main media (not sweepers)
        if (currentElementToPlay.element_type !== "sweeper" && currentElementToPlay.element_type !== "station_id") {
          activeDeckRef.current = activeDeckRef.current === "A" ? "B" : (activeDeckRef.current === "B" ? "C" : "A");
        }

        const mockBlock: PlaylistBlock = {
          blockId: currentElementToPlay.id,
          cityId: currentElementToPlay.city_id,
          youtubeId: currentElementToPlay.youtube_id || "",
          songTitle: currentElementToPlay.metadata?.title || "Future Radio Broadcast",
          songArtist: currentElementToPlay.metadata?.artist || "Future Radio Intelligence",
          songDurationS: currentElementToPlay.duration_ms / 1000,
          rjAudioUrl: "", jingleUrl: "", rjTranscript: currentElementToPlay.metadata?.transcript || "",
          newsHeadlines: [], mood: "Live", validFrom: currentElementToPlay.start_time, validUntil: currentElementToPlay.end_time,
          coverArt: currentElementToPlay.metadata?.coverArt || currentElementToPlay.metadata?.artwork_url || ""
        };
        setCurrentBlock(mockBlock);

        if ('mediaSession' in navigator) {
          const displayTitle = currentElementToPlay.element_type === 'jocktalk' ? 'Station Intelligence Break' : (currentElementToPlay.element_type === 'sweeper' ? 'Radio Sweeper' : mockBlock.songTitle);
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `Future Radio - ${displayTitle}`,
            artist: mockBlock.songArtist,
            album: "Live 24/7"
          });
        }

        const nextElements = schedule.slice(currentIndex + 1, currentIndex + 3);
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

        // --- SEAMLESS TIGHT SEGUE (2-second overlapping crossfade) ---
        // Pause previous decks gracefully instead of instantly
        [mediaRefA, mediaRefB, mediaRefC].forEach((ref, index) => {
           const deckName = ["A", "B", "C"][index];
           if (deckName !== activeDeckRef.current && ref.current && !ref.current.paused) {
               const player = ref.current;
               setTimeout(() => { player.pause(); player.volume = 1; }, 2000);
           }
        });

        if (!hasGesture || !isPlaying) return;

        const primaryDeck = activeDeckRef.current === "A" ? mediaRefA.current : (activeDeckRef.current === "B" ? mediaRefB.current : mediaRefC.current);

        if (currentElementToPlay.element_type === "sweeper" || currentElementToPlay.element_type === "station_id") {
           setPhase("playing_jingle");
           const player = sweeperRef.current;
           if (player) {
              if (player.src !== currentElementToPlay.media_url) player.src = currentElementToPlay.media_url;
              player.volume = 1.0;
              if (offsetSeconds > 0.5) try { player.currentTime = offsetSeconds; } catch(e) {}
              player.play().catch(e => handleMediaError("sweeper"));
           }
        } else {
           setPhase(currentElementToPlay.element_type === "jocktalk" ? "playing_jocktalk" : "playing_song");
           const targetUrl = currentElementToPlay.element_type === "song" ? currentElementToPlay.youtube_id : currentElementToPlay.media_url;
           if (primaryDeck) {
              if (primaryDeck.src !== targetUrl) primaryDeck.src = targetUrl;
              primaryDeck.volume = 1.0;
              if (offsetSeconds > 0.5) try { primaryDeck.currentTime = offsetSeconds; } catch(e) {}
              primaryDeck.play().catch(e => handleMediaError(activeDeckRef.current));
           }
        }
      } else {
        if (!hasGesture || !isPlaying) return;

        // --- HARDCODE EXCLUSIVITY RULE (MUTEX) WITH 1.5s CROSSFADE GRACE PERIOD ---
        const CROSSFADE_GRACE_PERIOD = 1.5;
        if (offsetSeconds > CROSSFADE_GRACE_PERIOD) {
           // Ensure only active deck and sweeper are playing, hard-pause others
           [mediaRefA, mediaRefB, mediaRefC].forEach((ref, index) => {
              const deckName = ["A", "B", "C"][index];
              if (deckName !== activeDeckRef.current && ref.current && !ref.current.paused) {
                  ref.current.pause();
              }
           });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [schedule, isPlaying, syncOffsetMs, cityId, hasGesture, setPhase, setCurrentBlock, setUpcomingBlocks]);

  // Handle HTML Media Fallbacks
  const syncAudioElement = (el: HTMLAudioElement | null) => {
    if (!el || el.paused || !hasGesture || !isPlaying) return;
  };

  useEffect(() => {
    const interval = setInterval(() => {
       syncAudioElement(mediaRefA.current);
       syncAudioElement(mediaRefB.current);
       syncAudioElement(mediaRefC.current);
       syncAudioElement(sweeperRef.current);
    }, 10000);
    return () => clearInterval(interval);
  }, [hasGesture, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      if (keepAliveRef.current) keepAliveRef.current.play().catch(() => {});
    } else {
      if (mediaRefA.current) mediaRefA.current.pause();
      if (mediaRefB.current) mediaRefB.current.pause();
      if (mediaRefC.current) mediaRefC.current.pause();
      if (sweeperRef.current) sweeperRef.current.pause();
    }
  }, [isPlaying]);

  const handleGestureClick = () => {
    if (mediaRefA.current && mediaRefA.current.paused) mediaRefA.current.play().catch(() => {});
    if (mediaRefB.current && mediaRefB.current.paused) mediaRefB.current.play().catch(() => {});
    if (mediaRefC.current && mediaRefC.current.paused) mediaRefC.current.play().catch(() => {});
    
    const silentSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    if (mediaRefA.current && !mediaRefA.current.src) mediaRefA.current.src = silentSrc;
    if (mediaRefB.current && !mediaRefB.current.src) mediaRefB.current.src = silentSrc;
    if (mediaRefC.current && !mediaRefC.current.src) mediaRefC.current.src = silentSrc;
    if (sweeperRef.current && !sweeperRef.current.src) sweeperRef.current.src = silentSrc;

    mediaRefA.current?.play().catch(() => {});
    mediaRefB.current?.play().catch(() => {});
    mediaRefC.current?.play().catch(() => {});
    sweeperRef.current?.play().catch(() => {});
    keepAliveRef.current?.play().catch(() => {});

    setHasGesture(true);
    setIsPlaying(true);
  };

  return (
    <>
      <audio id="keepalive-player" ref={keepAliveRef} src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" loop preload="auto" />
      <audio id="media-player-a" ref={mediaRefA} crossOrigin="anonymous" onError={() => handleMediaError("A")} />
      <audio id="media-player-b" ref={mediaRefB} crossOrigin="anonymous" onError={() => handleMediaError("B")} />
      <audio id="media-player-c" ref={mediaRefC} crossOrigin="anonymous" onError={() => handleMediaError("C")} />
      <audio id="sweeper-player" ref={sweeperRef} crossOrigin="anonymous" onError={() => handleMediaError("sweeper")} />
    </>
  );
}
