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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#98FB98] border-t-4 border-black px-6 py-4 flex items-center justify-between font-khand">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <span className="text-black text-xl font-black">📡</span>
          </div>
          <div>
            <h4 className="text-lg font-black text-black leading-tight uppercase tracking-wide">
              {currentBlock ? currentBlock.songTitle : "Future Radio Stream"}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-sm text-black font-bold">
                {currentBlock ? currentBlock.songArtist : (!isPlaying ? "Ready - Press Play" : "Tuning Ambient Live Beats...")}
              </p>
              {currentBlock?.permalink && (
                <a href={currentBlock.permalink} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-black text-white px-1 font-bold hover:underline whitespace-nowrap">
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
            className="w-12 h-12 bg-[#FFB6C1] border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-black flex items-center justify-center transition-all"
            aria-label={isPlaying ? "Stop stream" : "Start stream"}
          >
            <span className="text-2xl font-black">{isPlaying ? "⏹" : "▶"}</span>
          </button>
          <button
            onClick={() => setViewMode("fullscreen")}
            className="text-sm font-black text-black border-b-2 border-black hover:bg-black hover:text-[#98FB98] px-1 uppercase"
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
