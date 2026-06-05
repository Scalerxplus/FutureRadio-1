"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUiStore, useAuthStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { toggleLikeSong, getUserLikedSongs } from "@/lib/supabase/playlist";
import TelemetryDisplay from "@/components/audio/TelemetryDisplay";
import { useCityStore } from "@/lib/store";
import VibeSelectorSheet from "@/components/ui/VibeSelectorSheet";

export default function RadioClient({ initialStation }: { initialStation?: string }) {
  const router = useRouter();
  const { cityName, cityId, setCityId } = useCityStore();
  const { setMode } = useUiStore();
  const { user } = useAuthStore();
  const {
    isPlaying,
    currentBlock,
    upcomingBlocks,
    phase,
    setIsPlaying,
    setViewMode,
    isTuning,
  } = useAudioStore();

  const [isLiked, setIsLiked] = useState(false);
  const [isVibeSheetOpen, setIsVibeSheetOpen] = useState(false);

  // Initialize store with dynamic route station if provided and different
  useEffect(() => {
    if (initialStation && initialStation !== cityId) {
      // Basic check to map simple strings to known city logic if needed
      setCityId(initialStation);
    }
  }, [initialStation, cityId, setCityId]);

  // Synchronize active song liked states from Supabase
  useEffect(() => {
    if (!user || !currentBlock) return;
    const userId = "00000000-0000-0000-0000-000000000000"; // simulation mock UUID
    const blockId = currentBlock.blockId;
    async function syncSongLike() {
      const likedSongs = await getUserLikedSongs(userId);
      setIsLiked(likedSongs.includes(blockId));
    }
    syncSongLike();
  }, [user, currentBlock]);

  const handleLikeToggle = async () => {
    if (!currentBlock) return;
    const userId = "00000000-0000-0000-0000-000000000000";
    const success = await toggleLikeSong(userId, currentBlock.blockId, isLiked);
    if (success) {
      setIsLiked(!isLiked);
    }
  };
  const [progressS, setProgressS] = useState(0);
  const [displayedTranscript, setDisplayedTranscript] = useState("");

  // Redirect if not in radio mode
  const handleBack = () => {
    setMode(null);
    setViewMode("bubble");
    router.push("/");
  };

  // Toggle Vibe Sheet
  const handleOpenVibeSheet = () => {
    setIsVibeSheetOpen(true);
  };

  // Tracks song elapsed progress every second
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgressS((prev) => {
        const limit = currentBlock?.songDurationS || 240;
        if (prev >= limit) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentBlock]);

  // Reset elapsed progress when a new block is loaded
  useEffect(() => {
    setProgressS(0);
  }, [currentBlock]);

  // Typewriter effect for RJ voiceover transcripts when active
  useEffect(() => {
    const text = currentBlock?.rjTranscript || "";
    if (phase === "playing_jocktalk" && text) {
      let index = 0;
      setDisplayedTranscript("");
      const timer = setInterval(() => {
        setDisplayedTranscript((prev) => prev + text.charAt(index));
        index++;
        if (index >= text.length) {
          clearInterval(timer);
        }
      }, 35);
      return () => clearInterval(timer);
    } else {
      setDisplayedTranscript("");
    }
  }, [phase, currentBlock]);

  // Share functionality with Web Share API
  const handleShare = async () => {
    const shareData = {
      title: "Future Radio | Radio Reborn",
      text: "The New-age radio station is here. Tune into Future Radio 📻 — India's first 100% autonomous, AI-powered virtual radio.",
      url: "https://thefutureradio.com",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard if Web Share API is not supported (e.g. desktop)
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Link copied to clipboard! You can now paste it in WhatsApp.");
    }
  };  // Format seconds to M:SS helper
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Helper values for active song details
  const duration = currentBlock?.songDurationS || 260;
  const breakCountdown = Math.max(0, 12 - progressS); // RJ break queued at 12s in our simulator

  // Disabled manual scrubber jumps for live radio broadcast
  // (Live radio cannot be rewound or skipped forward)

  const getProviderInfo = (permalink: string | undefined) => {
    if (!permalink) return { name: "Direct Source", url: "#" };
    if (permalink.includes("audius.co")) return { name: "Audius", url: permalink };
    if (permalink.includes("jamendo.com")) return { name: "Jamendo", url: permalink };
    if (permalink.includes("apple.com") || permalink.includes("itunes.apple.com")) return { name: "Apple Podcasts", url: permalink };
    if (permalink.includes("wsj.com") || permalink.includes("megaphone.fm") || permalink.includes("foxnews")) return { name: "Global News", url: permalink };
    if (permalink.includes("bbc.co")) return { name: "BBC News", url: permalink };
    if (permalink.includes("npr.org")) return { name: "NPR News", url: permalink };
    
    // Fallback
    try {
      const urlObj = new URL(permalink);
      return { name: urlObj.hostname.replace("www.", ""), url: permalink };
    } catch(e) {
      return { name: "External Source", url: permalink };
    }
  };

  const provider = getProviderInfo(currentBlock?.permalink);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="min-h-screen flex justify-center items-center bg-transparent p-0 md:p-4"
    >
      {/* Mobile Shell Container */}
      <div className="w-full max-w-[420px] mx-auto h-[100dvh] md:h-[850px] md:max-h-[92vh] bg-black/40 md:bg-[#111118] backdrop-blur-md text-white flex flex-col justify-between px-4 py-6 md:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] relative overflow-y-auto overflow-x-hidden md:border-[6px] md:border-brand-red md:rounded-none md:shadow-[16px_16px_0_0_rgba(255,255,255,1)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200px] bg-brand-red/20 blur-[120px] pointer-events-none" />
        
        {/* Top Header */}
        <header className="flex justify-between items-center h-12 relative z-10">
          <button
            onClick={handleBack}
            className="p-1 rounded-full hover:bg-brand-surface border border-transparent hover:border-brand-border transition duration-200"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2 bg-[#111118]/50 px-3 py-1.5 rounded-full border border-[#2a2a35]">
            <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${isPlaying ? 'text-brand-red' : 'text-gray-500'}`}>
              {isPlaying ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => {
                unlockAudio();
                setIsPlaying(!isPlaying);
              }}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${isPlaying ? 'bg-brand-red' : 'bg-[#2a2a35]'}`}
              aria-label={isPlaying ? "Turn Radio Off" : "Turn Radio On"}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-300 ${isPlaying ? 'left-[22px]' : 'left-[2px]'}`}
              />
            </button>
          </div>
        </header>


        {/* Now Playing Metadata */}
        <div className="space-y-1">


          <div className="mt-2 mb-1 w-full flex flex-col items-center">
            
            {/* Indie Supporter Badge */}
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-brand-red/10 border border-orange-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,51,102,0.15)] hover:scale-105 transition-transform cursor-pointer">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[9px] font-bold tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-brand-red uppercase">
                Powered By Indie Creators
              </span>
            </div>

            {/* Seamless Title Marquee */}
            <div className="w-full flex items-center overflow-hidden">
              {React.createElement(
                'marquee',
                { scrollamount: "5", className: "text-[34px] font-black font-sans uppercase text-white tracking-widest leading-none border-b-4 border-brand-red pb-2" },
                currentBlock ? currentBlock.songTitle : "Connecting to Live Broadcast..."
              )}
            </div>
            
            {/* Centered Artist Name & Attribution */}
            <div className="flex flex-col items-center mt-4">
              <p className="text-[14px] font-bold text-brand-red uppercase tracking-[0.3em] text-center">
                {currentBlock ? currentBlock.songArtist : "Future Radio Sync Engine"}
              </p>
              {currentBlock?.permalink && (
                <a href={provider.url} target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 rounded border border-brand-red/30 bg-brand-red/10 text-[10px] text-brand-red uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1">
                  <span>🔗</span> Licensed via {provider.name}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="my-1 mb-2">
          <TelemetryDisplay />
        </div>

        {/* Vibe Selector Bottom Sheet */}
        <VibeSelectorSheet 
          isOpen={isVibeSheetOpen} 
          onClose={() => setIsVibeSheetOpen(false)} 
        />

        {/* Progress Bar Scrubber */}
        <div className="space-y-2 mt-2">
          {/* Custom Track Slider */}
          <div className="relative w-full h-[3px] bg-white/10 rounded-full">
            <div
              className="absolute left-0 top-0 h-full bg-white rounded-full"
              style={{ width: `${(progressS / duration) * 100}%` }}
            />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-sm -top-[3.5px] cursor-pointer transition-transform hover:scale-125"
              style={{ left: `calc(${(progressS / duration) * 100}% - 5px)` }}
            />
          </div>
          {/* Time Codes */}
          <div className="flex justify-between items-center text-[10px] font-medium text-white/50 tracking-wider select-none">
            <span>{formatTime(progressS)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Interactive Controls Panel */}
        <div className="flex justify-between items-center px-6 mt-3 mb-1">
          
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 transition text-lg w-8 text-gray-400 hover:text-white focus:outline-none hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="Share Future Radio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              unlockAudio();
              setIsPlaying(!isPlaying);
            }}
            className={`w-[96px] h-[96px] md:w-[110px] md:h-[110px] relative flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none rounded-full ${!isPlaying ? 'shadow-[0_0_15px_rgba(255,0,50,0.5)] animate-pulse' : 'shadow-2xl'}`}
            aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
          >
            <div className={`absolute inset-1.5 rounded-full border-[3px] overflow-hidden bg-black/60 shadow-inner ${isPlaying && !isTuning ? 'animate-rgb-glow' : 'border-[#ff0032] shadow-[0_0_15px_#ff0032,inset_0_0_10px_#ff0032] animate-pulse'}`}>
              <img src="/icons/player-logo.png" alt="Future Radio" className={`w-full h-full object-cover p-2.5 ${isPlaying && !isTuning ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
            </div>
            
            {/* Play Indicator Overlay when paused */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full z-10 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pl-1">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Like Toggle */}
          <button
            onClick={handleLikeToggle}
            className={`p-2 transition text-lg w-8 focus:outline-none ${isLiked ? "text-red-500 scale-110" : "text-gray-400 hover:text-white"}`}
            aria-label="Like this song"
          >
            {isLiked ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Badges / Bottom Navigation */}
        <div className="flex justify-between items-center px-2 pt-2">
          {/* Live Broadcast Indicator */}
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 select-none">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`} />
            LIVE
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-red select-none">
              {cityName}
            </div>
            {/* Select Vibe / Genre Trigger */}
            <button
              onClick={handleOpenVibeSheet}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 select-none uppercase tracking-[0.2em]"
            >
              CHANNELS 🎧
            </button>
          </div>
        </div>

        {/* Coming Up Next Section */}
        <div className="border-t border-white/10 pt-5 mt-auto space-y-3">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-brand-red block select-none">
            AI QUEUE
          </span>

            {upcomingBlocks.map((block, i) => (
              <div
                key={block.blockId || i}
                className="flex items-center justify-between bg-brand-surface/40 p-2.5 rounded-xl border border-brand-border/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#2a2a35]/30 flex items-center justify-center border border-brand-border text-sm">
                    {block.mood === "song" ? "🎵" : "🎙️"}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[200px]">
                      {block.songTitle}
                    </h4>
                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                      {block.songArtist}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red text-[8px] font-bold uppercase tracking-wider select-none">
                  {block.mood === "song" ? "Song" : "Voiceover"}
                </span>
              </div>
            ))}
        </div>

        {/* Disclaimer & Copyright Footer */}
        <div className="mt-8 text-center pb-4 flex flex-col gap-1.5">
          <p className="text-[9px] text-gray-500/60 leading-relaxed max-w-[280px] mx-auto select-none">
            Disclaimer: Streaming via decentralized protocols, content belongs to original artists.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[8px] text-gray-500/80 font-medium tracking-widest uppercase select-none">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500/50"></span>
            <span>Future Radio & Media Mafias</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
