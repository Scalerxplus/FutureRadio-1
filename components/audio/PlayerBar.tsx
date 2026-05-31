"use client";

import { usePathname } from "next/navigation";
import { useAudioStore, unlockAudio } from "./useAudioStore";

export default function PlayerBar() {
  const { isPlaying, currentBlock, viewMode, setIsPlaying, setViewMode } = useAudioStore();
  const pathname = usePathname();

  if (pathname === "/radio" || pathname.startsWith("/admin")) {
    return null;
  }

  const handleShare = async () => {
    const shareData = {
      title: "Future Radio",
      text: "Vibe with GenZ on Future Radio 📻 - 100% Autonomous AI Radio Station. Tune in live!",
      url: "https://radio.factoricai.com/radio",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      alert("Link copied to clipboard! You can now paste it in WhatsApp.");
    }
  };

  if (viewMode === "bubble") {
    // Redundant floating LIVE PLAYING button removed to fix overlap and UI clutter
    return null;
  }

  if (viewMode === "minimized") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-md border-t border-brand-border px-6 py-4 flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-brand-red/20 flex items-center justify-center border border-brand-red/30">
            <span className="text-brand-red text-xl font-bold">📡</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {currentBlock ? currentBlock.songTitle : "Future Radio Stream"}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">
                {currentBlock ? currentBlock.songArtist : "Tuning Ambient Live Beats..."}
              </p>
              {currentBlock?.permalink && (
                <a href={currentBlock.permalink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-brand-red hover:underline whitespace-nowrap">
                  🔗 Licensed via Audius
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              unlockAudio();
              setIsPlaying(!isPlaying);
            }}
            className="w-10 h-10 rounded-full bg-brand-red hover:bg-brand-red/90 text-white flex items-center justify-center hover:scale-105 transition-all"
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

  // The fullscreen player is now handled by the /radio page route.
  return null;
}
