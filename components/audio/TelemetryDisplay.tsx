"use client";

import React from "react";
import { useAudioStore } from "./useAudioStore";
import { motion, AnimatePresence } from "framer-motion";

export default function TelemetryDisplay() {
  const { currentBlock, isTuning, isPlaying } = useAudioStore();

  const imageUrl = currentBlock?.coverArt || "/icons/player-logo.png";

  return (
    <div className={`w-full aspect-square max-h-[260px] flex items-center justify-center my-4 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.15] to-white/[0.05] shadow-2xl backdrop-blur-xl transition-all duration-300 ${isPlaying && !isTuning ? 'border-[3px] border-transparent animate-rgb-glow' : 'border border-white/[0.1]'}`}>
      {isTuning && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand-red animate-pulse mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
          </svg>
          <span className="text-white font-digital text-xl tracking-[0.3em] uppercase animate-pulse drop-shadow-[0_0_8px_rgba(255,0,50,0.8)]">
            Tuning...
          </span>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.img
          key={imageUrl}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={imageUrl}
          alt="Live Display"
          className={`w-full h-full ${currentBlock?.coverArt ? 'object-cover' : 'object-contain p-8 opacity-90'}`}
        />
      </AnimatePresence>
    </div>
  );
}
