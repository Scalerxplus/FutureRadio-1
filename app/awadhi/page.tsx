"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { useRouter } from "next/navigation";

export default function AwadhiHubPage() {
  const router = useRouter();
  const { setCityId } = useCityStore();
  const { setIsPlaying } = useAudioStore();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTuneIn = () => {
    unlockAudio();
    setCityId("awadhi", "Future Radio - Awadhi");
    setIsPlaying(true);
    router.push("/radio");
  };

  return (
    <div className="min-h-screen bg-[#0A0805] text-[#FDF6E3] font-sans selection:bg-[#D35400] selection:text-white relative overflow-x-hidden flex flex-col justify-center items-center">
      
      {/* Floating Header */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-[#0A0805] to-transparent pt-6 pb-12 px-6 flex justify-between items-start pointer-events-none">
        <Link href="/" className="pointer-events-auto w-48 md:w-72 lg:w-80 mt-2 md:mt-4 ml-2 md:ml-6 transition-transform hover:scale-105">
           <img src="/icons/logo-horizontal-light.png" alt="Future Radio" className="w-full h-auto object-contain drop-shadow-2xl" />
        </Link>
        <button 
          onClick={handleTuneIn}
          className="pointer-events-auto flex items-center gap-2 bg-[#D35400] hover:bg-[#E67E22] text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_20px_rgba(211,84,0,0.4)] border border-white/10"
        >
          <Radio className="w-4 h-4" />
          Listen Live
        </button>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative flex flex-col items-center justify-center p-6 text-center z-10 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="border border-[#D35400]/30 bg-[#D35400]/10 text-[#D35400] px-4 py-1.5 rounded-sm font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-8"
        >
          Future Radio · Awadhi Hub
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6"
        >
          Awadhi audio <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D35400] to-[#E67E22] drop-shadow-[0_0_30px_rgba(211,84,0,0.3)] animate-pulse">
            rooted in culture.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12"
        >
          A dedicated stream for Awadhi songs, folk tales, and regional culture spanning the Awadh region. Coming soon to Future Radio!
        </motion.p>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTuneIn}
          className="bg-[#D35400] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(211,84,0,0.4)] flex items-center gap-2"
        >
          <Radio className="w-5 h-5" />
          Preview Stream
        </motion.button>
      </section>
    </div>
  );
}
