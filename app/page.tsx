"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useUiStore, useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import CinematicSplash from "@/components/ui/CinematicSplash";
import { Header } from "@/components/layout/Header";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { setRadioSection, setCityId } = useCityStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<"devotional" | "regional" | null>(null);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("future_radio_splash_shown") === "true") {
      setSplashComplete(true);
    }
  }, [setSplashComplete]);

  const handlePlayCard = (mode: "radio" | "news", section: "regional" | "devotional") => {
    setMode(mode);
    setRadioSection(section);
    
    const defaultId = section === "devotional" ? "shiva" : "bhojpuri";
    const defaultName = section === "devotional" ? "Radio Mahakaal" : "Bhojpuri Vibe";
    setCityId(defaultId, `Future Radio - ${defaultName}`);
    
    unlockAudio();
    setIsPlaying(true);
    router.push("/radio");
  };

  const stations = [
    "RADIO MAHAKAAL", "KESHAV VIBE", "RAGHAV VIBE", 
    "BHOJPURI VIBE", "BAGHELI VIBE", "RADIO AADI SHAKTI", 
    "BUNDELI VIBE", "RADIO GANPATI"
  ];

  return (
    <div ref={containerRef} className="relative bg-[#050505] min-h-screen overflow-hidden selection:bg-[#E5FF00] selection:text-black font-sans">
      <Header />
      
      {!splashComplete && <CinematicSplash onComplete={() => {
        setSplashComplete(true);
        sessionStorage.setItem("future_radio_splash_shown", "true");
      }} />}

      <main className={`min-h-screen text-white flex flex-col pt-16 transition-opacity duration-1000 relative ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* LIQUID / ABSTRACT BACKGROUND SYSTEM */}
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          {/* Base intense noise */}
          <div className="absolute inset-0 opacity-[0.15] bg-[url('/textures/noise.png')] mix-blend-overlay z-10" />
          
          <AnimatePresence>
            {/* Default Mix / Devotional View (OM & TRISHUL Liquid) */}
            {(hoveredSection === null || hoveredSection === "devotional") && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                {/* Massive OM Symbol Blurred to Liquid */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                    x: [0, 50, -50, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[20%] left-[20%] text-[40vw] leading-none text-[#FF3300] blur-[80px] md:blur-[120px] opacity-80 mix-blend-screen font-black select-none"
                >
                  ॐ
                </motion.div>
                
                {/* Damru / Swastik Shape Blurred */}
                <motion.div 
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [-10, 10, -10],
                    y: [0, -50, 50, 0]
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[10%] right-[10%] text-[40vw] leading-none text-[#E5FF00] blur-[90px] md:blur-[140px] opacity-70 mix-blend-screen font-black select-none"
                >
                  卐
                </motion.div>

                {/* Intense Purple/Pink accent */}
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[50vw] h-[50vw] bg-[#FF00FF] rounded-full blur-[100px] md:blur-[150px] opacity-40 mix-blend-screen" />
              </motion.div>
            )}

            {/* Regional View (Vibrant Cyan, Pink, Yellow Liquid) */}
            {hoveredSection === "regional" && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], x: [0, -100, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[10%] left-[10%] text-[50vw] leading-none text-[#00E5FF] blur-[100px] md:blur-[140px] opacity-80 mix-blend-screen font-black select-none"
                >
                  R
                </motion.div>
                
                <motion.div 
                  animate={{ scale: [1.2, 1, 1.2], y: [0, 100, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[20%] right-[20%] text-[50vw] leading-none text-[#FF0055] blur-[100px] md:blur-[140px] opacity-80 mix-blend-screen font-black select-none"
                >
                  V
                </motion.div>

                <div className="absolute top-[30%] left-[40%] w-[60vw] h-[40vw] bg-[#E5FF00] rounded-full blur-[120px] md:blur-[160px] opacity-50 mix-blend-screen" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BRUTALIST FOREGROUND */}
        <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full px-6">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-8 mix-blend-difference"
          >
            <img src="/icons/logo-vertical-dark.png" alt="Future Radio" className="w-[120px] md:w-[180px] h-auto object-contain invert brightness-200" />
          </motion.div>

          <div className="text-center w-full max-w-[90vw]">
            <h1 className="font-[Impact,Arial_Black,sans-serif] text-[12vw] md:text-[8vw] leading-[0.8] tracking-tighter uppercase text-white mix-blend-difference">
              FUTURE <br/> AUDIO NET
            </h1>
          </div>

          {/* MASSIVE NAVIGATION BLOCKS */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-7xl mx-auto mt-16 px-4">
            {/* Devotional Block */}
            <motion.div 
              onHoverStart={() => setHoveredSection("devotional")}
              onHoverEnd={() => setHoveredSection(null)}
              onClick={() => handlePlayCard("radio", "devotional")}
              className="flex-1 group cursor-pointer border-y md:border-y-0 md:border-x border-white/20 py-8 md:px-8 hover:bg-white transition-colors duration-300"
            >
              <div className="font-[Impact,Arial_Black,sans-serif] text-[10vw] md:text-[5vw] leading-[0.8] tracking-tighter uppercase text-white group-hover:text-black transition-colors duration-300 break-words">
                DEVOTIONAL<br/>VIBE
              </div>
              <p className="font-bold text-white/50 group-hover:text-black/60 uppercase tracking-widest mt-4 text-xs md:text-sm">
                Pure / Unfiltered / Divine
              </p>
            </motion.div>

            {/* Regional Block */}
            <motion.div 
              onHoverStart={() => setHoveredSection("regional")}
              onHoverEnd={() => setHoveredSection(null)}
              onClick={() => handlePlayCard("radio", "regional")}
              className="flex-1 group cursor-pointer border-b md:border-b-0 md:border-r border-white/20 py-8 md:px-8 hover:bg-white transition-colors duration-300"
            >
              <div className="font-[Impact,Arial_Black,sans-serif] text-[10vw] md:text-[5vw] leading-[0.8] tracking-tighter uppercase text-white group-hover:text-black transition-colors duration-300 break-words">
                REGIONAL<br/>VIBE
              </div>
              <p className="font-bold text-white/50 group-hover:text-black/60 uppercase tracking-widest mt-4 text-xs md:text-sm">
                Raw / Desi / Uncut
              </p>
            </motion.div>
          </div>

        </div>

        {/* VICE-STYLE SCROLLER (Massive Bottom Brands) */}
        <div className="w-full relative z-20 py-6 md:py-8 border-t border-white/10 bg-black/40 backdrop-blur-md overflow-hidden mt-auto">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-16 md:gap-32 font-[Impact,Arial_Black,sans-serif] text-3xl md:text-5xl tracking-tighter uppercase text-white/80"
          >
            {/* Repeat stations multiple times for continuous scroll */}
            {[...stations, ...stations, ...stations, ...stations].map((station, i) => (
              <span key={i} className="hover:text-[#E5FF00] transition-colors cursor-default mix-blend-difference">
                {station}
              </span>
            ))}
          </motion.div>
        </div>

      </main>
    </div>
  );
}
