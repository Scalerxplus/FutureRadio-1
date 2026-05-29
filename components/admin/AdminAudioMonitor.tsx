"use client";

import { useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { usePathname } from "next/navigation";

export default function AdminAudioMonitor({ isCollapsed }: { isCollapsed?: boolean }) {
  const { isPlaying, setIsPlaying } = useAudioStore();
  const pathname = usePathname();

  // Force audio to pause when first entering the admin dashboard
  // This prevents the "multiple audios" overlap if they came from the frontend or opened a fresh tab
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      // Small timeout to ensure hydration has finished and stores are synced
      const timeout = setTimeout(() => {
        setIsPlaying(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [pathname, setIsPlaying]);

  const toggleAudio = () => {
    if (!isPlaying) {
      unlockAudio(); // Important for browser autoplay policies
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button 
      onClick={toggleAudio}
      title="Toggle Live Audio Feed"
      className={`flex items-center gap-3 py-3 w-full rounded-xl transition-all font-medium ${
        isCollapsed ? "justify-center px-0" : "px-4"
      } ${
        isPlaying 
          ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30" 
          : "bg-[#1a1a24] text-gray-400 hover:text-white border border-transparent hover:border-[#2a2a35]"
      }`}
    >
      {isPlaying ? <Volume2 size={18} className="animate-pulse shrink-0" /> : <VolumeX size={18} className="shrink-0" />}
      {!isCollapsed && (
        <span className="text-sm whitespace-nowrap">
          {isPlaying ? "Live Feed: ON" : "Monitor Live Feed"}
        </span>
      )}
    </button>
  );
}
