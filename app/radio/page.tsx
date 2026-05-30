"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUiStore, useAuthStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { toggleLikeSong, getUserLikedSongs } from "@/lib/supabase/playlist";
import TelemetryDisplay from "@/components/audio/TelemetryDisplay";
import { useCityStore } from "@/lib/store";

export default function RadioPlayerPage() {
  const router = useRouter();
  const { cityName } = useCityStore();
  const { setMode } = useUiStore();
  const { user } = useAuthStore();
  const {
    isPlaying,
    currentBlock,
    upcomingBlocks,
    phase,
    setIsPlaying,
    setViewMode,
  } = useAudioStore();

  const [isLiked, setIsLiked] = useState(false);

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

  // Navigate to News and toggle bubble player mode
  const handleNavigateNews = () => {
    setViewMode("bubble");
    setMode("news");
    router.push("/news");
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

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 120 }}
      className="min-h-screen flex justify-center items-center bg-transparent p-0 md:p-4"
    >
      {/* Mobile Shell Container */}
      <div className="w-full max-w-full md:max-w-[400px] h-[100dvh] md:h-[850px] md:max-h-[92vh] bg-black/40 md:bg-black/60 backdrop-blur-md text-white flex flex-col justify-between p-6 relative overflow-y-auto overflow-x-hidden md:shadow-[0_0_80px_rgba(230,0,0,0.15)] border-none md:border md:border-white/10 md:rounded-[40px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                { scrollamount: "5", className: "text-[26px] font-display font-medium text-white tracking-tight leading-none" },
                currentBlock ? currentBlock.songTitle : "Connecting to Live Broadcast..."
              )}
            </div>
            
            {/* Centered Artist Name */}
            <p className="text-[13px] font-sans font-normal text-white/60 uppercase tracking-[0.2em] text-center mt-2">
              {currentBlock ? currentBlock.songArtist : "Future Radio Sync Engine"}
            </p>
          </div>
        </div>

        {/* Telemetry Display */}
        <div className="my-1 mb-2">
          <TelemetryDisplay />
        </div>

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
          
          {/* Primary Play / Pause Toggle (Now just the logo) */}
          <button
            onClick={() => {
              unlockAudio();
              setIsPlaying(!isPlaying);
            }}
            className="w-[72px] h-[72px] relative flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-300 focus:outline-none"
            aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
          >
            {/* Spinning Logo Background */}
            <div className={`absolute inset-0 rounded-full overflow-hidden border border-white/10 transition-all duration-700 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
              <img src="/vinyl-icon.png" alt="Future Radio" className="w-full h-full object-cover mix-blend-multiply filter contrast-[1.2]" />
            </div>
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

          {/* Quick News Trigger */}
          <button
            onClick={handleNavigateNews}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 select-none uppercase tracking-[0.2em]"
          >
            UPDATES ⚡
          </button>
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
