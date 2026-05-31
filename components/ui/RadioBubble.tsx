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
    setMode("radio");
    router.push("/radio");
  };

  // Only display the bubble when minimized or in bubble mode, and NEVER on the fullscreen radio page or admin pages
  const showBubble = (viewMode === "bubble" || viewMode === "minimized") && pathname !== "/radio" && !pathname.startsWith("/admin");

  return (
    <AnimatePresence>
      {showBubble && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={handleTap}
          className="fixed bottom-24 right-6 z-40 w-16 h-16 rounded-full bg-white backdrop-blur-md border border-white/50 shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center justify-center cursor-pointer hover:border-brand-red hover:scale-110 active:scale-95 transition-all"
        >
          <img 
            src="/red-o-icon.png" 
            alt="FR" 
            className={`w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,46,46,0.6)] ${isPlaying ? "animate-pulse" : ""}`} 
          />
          {isPlaying && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red"></span>
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
