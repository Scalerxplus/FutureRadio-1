"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/lib/store";
import { useAudioStore } from "../audio/useAudioStore";

export default function RadioBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const { setMode } = useUiStore();
  const { isPlaying, currentBlock, viewMode, setViewMode } = useAudioStore();

  const handleTap = () => {
    setViewMode("fullscreen");
    setMode("radio");
    router.push("/radio");
  };

  // Only display the bubble when minimized or in bubble mode, and NEVER on the fullscreen radio page or admin pages
  const showBubble = (viewMode === "bubble" || viewMode === "minimized") && pathname !== "/radio" && !pathname.startsWith("/admin");

  return (
    <AnimatePresence>
      {showBubble && (
        <motion.div
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 50, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={handleTap}
          className="fixed bottom-[88px] left-1/2 z-40 w-[calc(100%-40px)] max-w-[390px] rounded-full border border-brand-border bg-[#111118]/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shadow-2xl cursor-pointer hover:border-brand-red/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {/* Left: Badge Logo */}
          <div className="flex-shrink-0 mr-1 relative">
            <img 
              src="/logo-badge.png" 
              alt="FR" 
              className={`w-9 h-9 object-contain rounded-full border border-brand-border/50 shadow-[0_0_10px_rgba(229,9,20,0.3)] ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} 
            />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red"></span>
              </span>
            )}
          </div>

          {/* Center: Song Info */}
          <div className="flex-1 px-3 text-left overflow-hidden select-none">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-red">
              Future Radio
            </p>
            <h4 className="text-xs font-semibold text-gray-300 truncate leading-snug">
              {currentBlock ? `${currentBlock.songTitle} · playing now` : "Connecting to Live Broadcast..."}
            </h4>
          </div>

          {/* Right: Up-Arrow Circle Icon */}
          <div className="flex-shrink-0 text-brand-red hover:text-brand-red/80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
