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
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center group">
          {/* Spinning Logo Background (Unobstructed) */}
          <div className={`absolute inset-0 rounded-full overflow-hidden shadow-[0_0_50px_rgba(127,119,221,0.3)] border-4 border-[#222] ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
            <img src="/logo_app.png" alt="Future Radio" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-3 mt-8">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-brand-teal uppercase">
              {isPlaying ? "Currently Tuned" : "Radio Deck"}
            </span>
            <h2 className="text-2xl font-extrabold text-white line-clamp-2 leading-tight">
              {currentBlock ? currentBlock.songTitle : "Future Radio"}
            </h2>
            <p className="text-sm text-gray-400 truncate px-4">
              {currentBlock ? `by ${currentBlock.songArtist}` : "Local Voiceovers & Ambient Synth Beats"}
            </p>
          </div>

          <div className="flex justify-center items-center pt-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-white text-2xl flex items-center justify-center shadow-[0_0_30px_rgba(127,119,221,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
              aria-label={isPlaying ? "Stop stream" : "Start stream"}
            >
              <span className={isPlaying ? "" : "ml-1"}>{isPlaying ? "⏹" : "▶"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
