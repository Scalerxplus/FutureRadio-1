"use client";

import { useAudioStore } from "./useAudioStore";

export default function PlayerBar() {
  const { isPlaying, currentBlock, viewMode, setIsPlaying, setViewMode } = useAudioStore();

  if (viewMode === "bubble") {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setViewMode("minimized")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-purple text-white border border-brand-purple/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(127,119,221,0.4)]"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isPlaying ? "Live Playing" : "Tune In"}
          </span>
        </button>
      </div>
    );
  }

  if (viewMode === "minimized") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-md border-t border-brand-border px-6 py-4 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
            <span className="text-brand-purple text-xl font-bold">📡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {currentBlock ? currentBlock.songTitle : "Future Radio Stream"}
            </h4>
            <p className="text-xs text-gray-400">
              {currentBlock ? currentBlock.songArtist : "Tuning Ambient Live Beats..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-white flex items-center justify-center hover:scale-105 transition-all"
            aria-label={isPlaying ? "Stop stream" : "Start stream"}
          >
            {isPlaying ? "⏹" : "▶"}
          </button>
          <button
            onClick={() => setViewMode("fullscreen")}
            className="text-xs text-gray-400 hover:text-white"
          >
            Maximize
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen deck
  return (
    <div className="fixed inset-0 z-50 bg-brand-dark flex flex-col items-center justify-center p-6 animate-fade-in">
      <button
        onClick={() => setViewMode("minimized")}
        className="absolute top-6 right-6 text-gray-400 hover:text-white text-sm border border-brand-border px-3 py-1 rounded"
      >
        Minimize
      </button>

      <div className="max-w-md w-full text-center space-y-8">
        <div 
          className={`w-64 h-64 rounded-full mx-auto relative shadow-[0_0_50px_rgba(127,119,221,0.2)] border-[6px] border-[#0a0a0a] flex items-center justify-center bg-gradient-to-tr from-[#111] via-[#2a2a2a] to-[#111] ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}
        >
          {/* Record Grooves */}
          <div className="absolute inset-3 rounded-full border border-[#333]/40 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-[#333]/40 pointer-events-none" />
          <div className="absolute inset-14 rounded-full border border-[#333]/40 pointer-events-none" />
          <div className="absolute inset-20 rounded-full border border-[#333]/40 pointer-events-none" />
          
          {/* Center Label */}
          <div className="w-24 h-24 rounded-full bg-brand-purple flex items-center justify-center flex-col shadow-inner z-10 border-4 border-brand-purple/30 relative">
             <span className="text-[10px] font-bold text-white tracking-widest text-center leading-tight">FUTURE<br/>RADIO</span>
             {/* Spindle Hole */}
             <div className="w-4 h-4 bg-[#0a0a0a] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest text-brand-teal uppercase">
            {isPlaying ? "Currently Tuned" : "Radio Deck"}
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            {currentBlock ? currentBlock.songTitle : "Future Radio"}
          </h2>
          <p className="text-sm text-gray-400">
            {currentBlock ? `by ${currentBlock.songArtist}` : "Local Voiceovers & Ambient Synth Beats"}
          </p>
        </div>

        <div className="flex justify-center items-center gap-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-white text-2xl flex items-center justify-center shadow-xl hover:scale-105 transition duration-300"
            aria-label={isPlaying ? "Stop stream" : "Start stream"}
          >
            {isPlaying ? "⏹" : "▶"}
          </button>
        </div>
      </div>
    </div>
  );
}
