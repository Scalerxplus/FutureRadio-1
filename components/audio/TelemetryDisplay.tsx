"use client";

import React from "react";
import { useAudioStore } from "./useAudioStore";
import { motion, AnimatePresence } from "framer-motion";

export default function TelemetryDisplay() {
  const { currentBlock } = useAudioStore();

  const imageUrl = currentBlock?.coverArt || "/logo-dark-theme.png";

  return (
    <div className="w-full aspect-square max-h-[260px] flex items-center justify-center my-4 relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.02] shadow-2xl">
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
