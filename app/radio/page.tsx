"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUiStore, useAuthStore } from "@/lib/store";
import { useAudioStore } from "@/components/audio/useAudioStore";
import { toggleLikeSong, getUserLikedSongs } from "@/lib/supabase/playlist";

// Removed mock UPCOMING_ITEMS

export default function RadioPlayerPage() {
  const router = useRouter();
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

  // Format seconds to M:SS helper
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
      className="min-h-screen bg-transparent flex justify-center items-center"
    >
      {/* Mobile Shell Container */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#0a0a0f]/80 backdrop-blur-xl text-white flex flex-col justify-between p-5 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#111118]">
        
        {/* Top Header */}
        <header className="flex justify-between items-center h-12">
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
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Future Radio" 
              className="h-[58px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]" 
            />
          </div>

          <div className="flex items-center gap-2 bg-[#111118]/50 px-3 py-1.5 rounded-full border border-[#2a2a35]">
            <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${isPlaying ? 'text-brand-purple' : 'text-gray-500'}`}>
              {isPlaying ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${isPlaying ? 'bg-brand-purple' : 'bg-[#2a2a35]'}`}
              aria-label={isPlaying ? "Turn Radio Off" : "Turn Radio On"}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-300 ${isPlaying ? 'left-[22px]' : 'left-[2px]'}`}
              />
            </button>
          </div>
        </header>

        {/* Persisted YouTube Player Space Placeholder */}
        <div className="my-2 space-y-2">
          {/* Card Wrapper matching exactly the fixed iframe size coordinates */}
          <div className="w-full aspect-[16/9] rounded-2xl border border-[#2a2a35] bg-[#111118]/25 flex items-center justify-center select-none">
            <div className="text-center space-y-2 z-10 pointer-events-none opacity-20">
              <span className="text-2xl">📺</span>
              <p className="text-[10px] uppercase font-bold tracking-wider">Syncing Visual Stream</p>
            </div>
          </div>
          <p className="text-[10px] text-center text-gray-600 font-semibold select-none">
            music licensed via YouTube API • compliant
          </p>
        </div>

        {/* Now Playing Metadata */}
        <div className="space-y-2">
          {/* Active Player State Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[10px] font-bold uppercase tracking-wider w-fit">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
              />
            </svg>
            <span>
              {phase === "playing_jocktalk" ? `AI RJ ${currentBlock?.metadata?.rjName || "AIRA"} · speaking live` : `AI RJ ${currentBlock?.metadata?.rjName || "AIRA"} · speaking next`}
            </span>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight line-clamp-1">
              {currentBlock ? currentBlock.songTitle : "Connecting to Live Broadcast..."}
            </h2>
            <p className="text-xs text-gray-400 line-clamp-1">
              {currentBlock ? currentBlock.songArtist : "Future Radio Sync Engine"}
            </p>
          </div>
        </div>

        {/* Voiceover Typewriter Transcription Balloon */}
        <div className="h-[92px] border border-[#2a2a35] bg-[#111118]/70 backdrop-blur rounded-2xl p-4 flex gap-3.5 relative overflow-hidden transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/35 flex items-center justify-center flex-shrink-0 text-brand-purple">
            🎙️
          </div>
          <div className="space-y-1 overflow-hidden flex-1">
            <span className="text-[9px] font-extrabold text-brand-purple uppercase tracking-widest block">
              AI RJ {currentBlock?.metadata?.rjName || "AIRA"} · Raipur
            </span>
            <div className="text-xs text-gray-300 leading-relaxed overflow-y-auto max-h-[46px] pr-1">
              {phase === "playing_jocktalk" ? (
                <span className="after:content-['|'] after:animate-pulse after:text-brand-purple">
                  {displayedTranscript}
                </span>
              ) : (
                <span className="text-gray-500 italic">
                  RJ is listening to beats... Microphone auto-activates during scheduled breaks.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar Scrubber */}
        <div className="space-y-2">
          {/* Custom Track Slider */}
          <div className="relative w-full h-[3px] bg-brand-border rounded-full overflow-visible">
            <div
              className="absolute left-0 top-0 h-full bg-brand-purple rounded-full"
              style={{ width: `${(progressS / duration) * 100}%` }}
            />
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-white border border-brand-purple -top-1 shadow cursor-pointer transition-transform active:scale-125"
              style={{ left: `calc(${(progressS / duration) * 100}% - 5px)` }}
            />
          </div>
          {/* Time Codes */}
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 tracking-wider select-none">
            <span>{formatTime(progressS)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Interactive Controls Panel */}
        <div className="flex justify-between items-center px-4">
          
          <div className="w-8" />
          
          {/* Primary Play / Pause Toggle (Now just the logo) */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-[84px] h-[84px] relative flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
            aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
          >
            {/* Spinning Logo Background */}
            <div className={`absolute inset-0 rounded-full overflow-hidden shadow-[0_0_25px_rgba(127,119,221,0.25)] border-[3px] border-[#222] transition-all duration-500 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
              <img src="/logo_app.png" alt="Future Radio" className="w-full h-full object-cover" />
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
        <div className="flex justify-between items-center pt-2">
          {/* Mood Badge */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/25 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none">
            ✨ {currentBlock?.mood || "romantic"}
          </div>

          {/* Quick News Trigger */}
          <button
            onClick={handleNavigateNews}
            className="flex items-center gap-1 bg-brand-teal/15 hover:bg-brand-teal/25 border border-brand-teal/30 text-brand-teal px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200"
          >
            Whatsup News ↗
          </button>
        </div>

        {/* Coming Up Next Section */}
        <div className="border-t border-[#2a2a35] pt-4 space-y-3">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-500 block select-none">
            COMING UP NEXT
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

                <span className="px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[8px] font-bold uppercase tracking-wider select-none">
                  {block.mood === "song" ? "Song" : "Voiceover"}
                </span>
              </div>
            ))}
        </div>

      </div>
    </motion.div>
  );
}
