"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioStore, unlockAudio } from "./useAudioStore";
import { useUiStore, useCityStore } from "@/lib/store";
import { getBroadcastSchedule } from "@/lib/supabase/playlist";
import { createClient } from "@/lib/supabase/client";
import { PlaylistBlock } from "@/lib/types";



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
  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);
  const currentElementIdRef = useRef<string | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
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
      if (!sweeperRef.current) { sweeperRef.current = new Audio(); sweeperRef.current.crossOrigin = "anonymous"; }
      if (!transitionAudioRef.current) { transitionAudioRef.current = new Audio(); transitionAudioRef.current.crossOrigin = "anonymous"; }
    }
    return () => {
      if (mediaRefA.current) { mediaRefA.current.pause(); mediaRefA.current.src = ""; }
      if (mediaRefB.current) { mediaRefB.current.pause(); mediaRefB.current.src = ""; }
      if (mediaRefC.current) { mediaRefC.current.pause(); mediaRefC.current.src = ""; }
      if (sweeperRef.current) { sweeperRef.current.pause(); sweeperRef.current.src = ""; }
      if (transitionAudioRef.current) { transitionAudioRef.current.pause(); transitionAudioRef.current.src = ""; }
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

  
  // 2.5 Instant Transition Sweeper on Channel Change
  useEffect(() => {
    if (!hasGesture || !transitionAudioRef.current) return;
    
    // HARD STOP old audio to prevent mixing when switching stations
    if (sweeperRef.current) sweeperRef.current.pause();
    if (mediaRefA.current) mediaRefA.current.pause();
    if (mediaRefB.current) mediaRefB.current.pause();
    if (mediaRefC.current) mediaRefC.current.pause();
    // Also reset currentElementIdRef to force a clean state transition when new schedule loads
    currentElementIdRef.current = null;

    transitionAudioRef.current.volume = 1.0;
    
    if (isFirstLoadRef.current) {
      // First App Open: Play shuffled Station Jingle
      const JINGLES = [
        "/audio/jingles/Station_Jingle_chill.mp3",
        "/audio/jingles/Station_Jingle_drive.mp3",
        "/audio/jingles/Station_Jingle_news.mp3",
        "/audio/jingles/Station_Jingle_party.mp3",
        "/audio/jingles/Station_Jingle_romance.mp3"
      ];
      transitionAudioRef.current.src = JINGLES[Math.floor(Math.random() * JINGLES.length)];
      isFirstLoadRef.current = false;
    } else {
      // Channel Change: Play specific genre sweeper
      if (cityId === "global") {
        // Random from 1 to 20 for global
        const randomId = Math.floor(Math.random() * 20) + 1;
        transitionAudioRef.current.src = `/audio/fallbacks/Future_Radio_${randomId}.mp3`;
      } else {
        // 01 to 04 for specific genre
        const randomNum = String(Math.floor(Math.random() * 4) + 1).padStart(2, '0');
        transitionAudioRef.current.src = `/audio/Sweepers/Sweeper_${cityId}_${randomNum}.mp3`;
      }
    }
    
    transitionAudioRef.current.onerror = () => {
       transitionAudioRef.current!.src = "/audio/fallbacks/Future_Radio_1.mp3";
    };
    
    transitionAudioRef.current.play().catch(e => console.warn("Transition audio blocked:", e));
    
  }, [cityId, hasGesture]);

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
        if (!isGeneratingRef.current) {
          isGeneratingRef.current = true;
          fetch(`/api/broadcast/generate-hour?city=${cityId}`, { method: "POST" })
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
        
        if (!isGeneratingRef.current) {
          isGeneratingRef.current = true;
          fetch(`/api/broadcast/generate-hour?city=${cityId}`, { method: "POST" })
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
         // Dynamic advance threshold based on element type
         let advanceThreshold = 3.0; // 3s for songs
         if (activeElement.element_type === "sweeper" || activeElement.element_type === "station_id") advanceThreshold = 1.0;
         if (activeElement.element_type === "jocktalk") advanceThreshold = 0.2;
         
         if ((remainingTimeOnDeck <= advanceThreshold && remainingTimeOnDeck > 0) || activeDeck.ended) {
            shouldAdvance = true;
         }
      }
      
      // Do not allow early clock expiration to clip non-song elements
      if (!shouldAdvance && isExpiredByClock && activeElement.element_type === "song") {
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



      // --- STATE TRANSITION DETECTED ---
      if (currentElementIdRef.current !== currentElementToPlay.id) {
        currentElementIdRef.current = currentElementToPlay.id;

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
          coverArt: currentElementToPlay.metadata?.coverArt || currentElementToPlay.metadata?.artwork_url || "",
          permalink: currentElementToPlay.metadata?.permalink || ""
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

        const prevElement = currentIndex > 0 ? schedule[currentIndex - 1] : null;

        // --- HYBRID CROSSFADE & EXCLUSIVITY ENGINE ---
        [mediaRefA, mediaRefB, mediaRefC, sweeperRef].forEach((ref, index) => {
           const deckName = ["A", "B", "C", "sweeper"][index];
           if ((deckName !== activeDeckRef.current && deckName !== "sweeper") || (deckName === "sweeper" && currentElementToPlay.element_type !== "sweeper" && currentElementToPlay.element_type !== "station_id")) {
               if (ref.current && !ref.current.paused) {
                   const player = ref.current;
                   const isEnteringJock = currentElementToPlay.element_type === "jocktalk";
                   const isExitingJock = prevElement && prevElement.element_type === "jocktalk";
                   
                   if (isEnteringJock || isExitingJock) {
                       // Strict exclusivity: zero overlap for jocktalks
                       player.pause();
                       player.volume = 1;
                       try { player.currentTime = 0; } catch(e) {}
                   } else {
                       // Determine fade out duration
                       const isExitingSweeper = prevElement && (prevElement.element_type === "sweeper" || prevElement.element_type === "station_id");
                       const isEnteringSweeper = currentElementToPlay.element_type === "sweeper" || currentElementToPlay.element_type === "station_id";
                       const fadeOutTimeMs = (isExitingSweeper || isEnteringSweeper) ? 1000 : 3000;
                       const steps = 20;
                       const stepTime = fadeOutTimeMs / steps;
                       const volDrop = 1.0 / steps;
                       
                       let vol = player.volume;
                       const fade = setInterval(() => {
                           vol -= volDrop;
                           if (vol <= 0) {
                               player.pause();
                               player.volume = 1;
                               clearInterval(fade);
                           } else {
                               player.volume = vol;
                           }
                       }, stepTime);
                   }
               }
           }
        });

        if (!hasGesture || !isPlaying) return;

        const primaryDeck = activeDeckRef.current === "A" ? mediaRefA.current : (activeDeckRef.current === "B" ? mediaRefB.current : mediaRefC.current);

        // Helper to apply Fade-In
        const applyFadeIn = (player: HTMLAudioElement, elementType: string) => {
            if (elementType === "jocktalk") {
                player.volume = 1.0; // Instant 100% for jocktalks
                return;
            }
            player.volume = 0.0;
            const isSweeper = elementType === "sweeper" || elementType === "station_id";
            const fadeInTimeMs = isSweeper ? 1000 : 3000;
            const steps = 20;
            const stepTime = fadeInTimeMs / steps;
            const volRise = 1.0 / steps;
            
            let volIn = 0.0;
            const fadeIn = setInterval(() => {
                volIn += volRise;
                if (volIn >= 1.0) {
                    player.volume = 1.0;
                    clearInterval(fadeIn);
                } else {
                    player.volume = volIn;
                }
            }, stepTime);
        };

        if (currentElementToPlay.element_type === "sweeper" || currentElementToPlay.element_type === "station_id") {
           setPhase("playing_jingle");
           const player = sweeperRef.current;
           if (player) {
              if (player.src !== currentElementToPlay.media_url) player.src = currentElementToPlay.media_url;
              applyFadeIn(player, currentElementToPlay.element_type);
              if (offsetSeconds > 0.5) try { player.currentTime = offsetSeconds; } catch(e) {}
              // HARD STOP transition audio for Master Clock Sweepers to prevent parallel clashing
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 transitionAudioRef.current.pause();
                 try { transitionAudioRef.current.currentTime = 0; } catch(e) {}
                 transitionAudioRef.current.volume = 1;
              }
              player.play().catch(e => handleMediaError("sweeper"));
           }
        } else {
           setPhase(currentElementToPlay.element_type === "jocktalk" ? "playing_jocktalk" : "playing_song");
           const targetUrl = currentElementToPlay.element_type === "song" ? currentElementToPlay.youtube_id : currentElementToPlay.media_url;
           if (primaryDeck) {
              if (primaryDeck.src !== targetUrl) primaryDeck.src = targetUrl;
              applyFadeIn(primaryDeck, currentElementToPlay.element_type);
              if (offsetSeconds > 0.5) try { primaryDeck.currentTime = offsetSeconds; } catch(e) {}
              // Fade out transition audio ONLY if it's a song, otherwise hard stop for jocktalk
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 const tAudio = transitionAudioRef.current;
                 if (currentElementToPlay.element_type === "jocktalk") {
                     tAudio.pause();
                     try { tAudio.currentTime = 0; } catch(e) {}
                     tAudio.volume = 1;
                 } else {
                     let vol = tAudio.volume;
                     const fade = setInterval(() => { vol -= 0.1; if (vol <= 0) { tAudio.pause(); tAudio.volume = 1; clearInterval(fade); } else { tAudio.volume = vol; } }, 200);
                 }
              }
              primaryDeck.play().catch(e => handleMediaError(activeDeckRef.current));
           }
        }
      } else {
        if (!hasGesture || !isPlaying) return;

        // --- HARDCODE EXCLUSIVITY RULE (MUTEX) WITH 1.5s CROSSFADE GRACE PERIOD ---
        const CROSSFADE_GRACE_PERIOD = 1.5;
        if (offsetSeconds > CROSSFADE_GRACE_PERIOD) {
           // Ensure only active deck and active element are playing, hard-pause others
           const isSweeperActive = (currentElementToPlay.element_type === "sweeper" || currentElementToPlay.element_type === "station_id");
           
           [mediaRefA, mediaRefB, mediaRefC, sweeperRef].forEach((ref, index) => {
              const deckName = ["A", "B", "C", "sweeper"][index];
              const isThisDeckSupposedToPlay = isSweeperActive 
                  ? deckName === "sweeper" 
                  : deckName === activeDeckRef.current;
                  
              if (!isThisDeckSupposedToPlay && ref.current && !ref.current.paused) {
                  ref.current.pause();
                  ref.current.volume = 1;
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
    // Only play the keepAlive to unlock AudioContext.
    // The Global Synchronizer Loop will handle playing the activeDeck/sweeper.
    keepAliveRef.current?.play().catch(() => {});
    
    // Also unlock transitionAudioRef
    if (transitionAudioRef.current && transitionAudioRef.current.paused && transitionAudioRef.current.src) {
        transitionAudioRef.current.play().catch(() => {});
    }

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
