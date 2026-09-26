"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useUiStore, useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import CinematicSplash from "@/components/ui/CinematicSplash";
import { Header } from "@/components/layout/Header";
import { Play, Radio, Heart, Users, ArrowRight, Activity, Globe, Speaker } from "lucide-react";
import { ROOTS_STATION } from "@/lib/data";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { setRadioSection, setCityId } = useCityStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("future_radio_splash_shown") === "true") {
      setSplashComplete(true);
    }
  }, [setSplashComplete]);

  const handlePlayRoots = () => {
    setMode("radio");
    setRadioSection("regional");
    setCityId("roots", "FUTURE RADIO Roots");
    unlockAudio();
    setIsPlaying(true);
    router.push("/radio");
  };

  return (
    <div ref={containerRef} className="relative bg-[#C4B5FD] min-h-screen overflow-hidden selection:bg-black selection:text-[#E5FF00] font-sans">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/textures/noise.png')] mix-blend-overlay" />
      </div>

      <Header />

      <main className="min-h-screen text-black flex flex-col pt-20 pb-24 relative z-10 opacity-100">
        
        {/* NEO-BRUTALIST HERO SECTION */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="inline-block bg-[#E5FF00] border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 transform -rotate-2"
          >
            <span className="font-bold text-black uppercase tracking-widest text-sm md:text-base">THE FUTURE RADIO NETWORK</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="sr-only">
              FUTURE RADIO Roots. The sound of the Indo-Gangetic Belt.
            </h1>

            <div aria-hidden="true" className="relative flex items-center justify-center w-full max-w-[95vw] mx-auto mb-6 mt-4">
              <Speaker className="hidden md:block absolute left-0 lg:left-4 top-1/4 w-12 h-12 md:w-24 md:h-24 text-black fill-[#FF69B4] transform -rotate-12 drop-shadow-[6px_6px_0_rgba(0,0,0,1)] z-0" strokeWidth={1.5} />

              <div className="text-6xl md:text-8xl lg:text-[130px] font-khand font-black leading-[1.1] md:leading-[1.0] tracking-tighter uppercase text-center relative z-10">
                <span className="block text-[#FF69B4] [-webkit-text-stroke:2px_black] md:[-webkit-text-stroke:4px_black] [text-shadow:6px_6px_0px_#000] md:[text-shadow:12px_12px_0px_#000] mb-2 md:mb-4">FUTURE RADIO</span>
                <span className="block text-[#00E5FF] [-webkit-text-stroke:2px_black] md:[-webkit-text-stroke:4px_black] [text-shadow:6px_6px_0px_#000] md:[text-shadow:12px_12px_0px_#000]">ROOTS</span>
              </div>

              <Speaker className="hidden md:block absolute right-0 lg:right-4 bottom-1/4 w-12 h-12 md:w-24 md:h-24 text-black fill-[#00E5FF] transform rotate-12 drop-shadow-[6px_6px_0_rgba(0,0,0,1)] z-0" strokeWidth={1.5} />
            </div>
            
            <div aria-hidden="true" className="text-xl md:text-3xl font-bold text-black/90 max-w-3xl font-sans leading-snug tracking-tight bg-white px-8 py-4 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative z-10 mx-auto mt-4">
              India's First AI-Powered Vernacular Radio Network
            </div>
            
            <motion.button
              whileHover={{ y: -4, x: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ y: 0, x: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
              onClick={handlePlayRoots}
              className="mt-8 bg-[#FF69B4] border-4 border-black text-black font-black uppercase text-2xl md:text-4xl px-12 py-6 rounded-full flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer z-20 hover:bg-[#E5FF00]"
            >
              <Play className="w-8 h-8 md:w-10 md:h-10 fill-current" />
              <span>LISTEN LIVE</span>
            </motion.button>
          </motion.div>
        </div>

        {/* NEO-BRUTALIST FEATURES SECTION */}
        <div className="w-full max-w-7xl mx-auto px-6 py-8 mt-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-6xl font-black font-khand text-black mb-4 uppercase">Why We Hit Different</h2>
            <p className="text-xl font-bold text-black/70">Not just a stream, but a cultural movement.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FF69B4] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Radio className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">24/7 Autonomous Streaming</h3>
              <p className="text-black/80 font-bold leading-snug">Powered by our AI Master Clock. Endless, buffering-free streaming.</p>
            </div>

            <div className="bg-[#E5FF00] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">Independent World-Class Content</h3>
              <p className="text-black/80 font-bold leading-snug">Independent World-Class Regional and Devotional Content straight to you.</p>
            </div>

            <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-[#00E5FF] border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">Voice of Creators</h3>
              <p className="text-black/80 font-bold leading-snug">A global stage for India's independent artists and folk singers. Their voice, straight to you.</p>
            </div>
          </div>
        </div>

        {/* NEO-BRUTALIST FOOTER */}
        <footer className="w-full bg-black text-white border-t-8 border-black mt-auto py-16 px-6 relative z-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Network Info */}
            <div className="flex flex-col items-start">
              <h2 className="text-4xl md:text-5xl font-black font-khand uppercase tracking-tight mb-4 text-[#c4913c] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">FUTURE RADIO Roots</h2>
              <p className="text-white/80 font-bold mb-6 max-w-sm">
                India's premier autonomous AI-powered vernacular radio network. Broadcasting raw culture 24/7.
              </p>
            </div>
            
            {/* ScalerX Lab */}
            <div className="flex flex-col items-start">
              <a href="https://scalerxlab.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <h3 className="text-2xl font-black font-khand uppercase mb-4 text-[#00E5FF]">A ScalerX Lab Platform</h3>
              </a>
              <p className="text-white/80 font-bold mb-6">
                Incubated, engineered, and powered by <a href="https://scalerxlab.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">ScalerX Lab</a>. We push the boundaries of generative AI and autonomous media distribution to redefine how India consumes local audio.
              </p>
              <div className="bg-white text-black font-black text-xs px-3 py-1 uppercase border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] transform -rotate-1 hover:rotate-0 transition-transform">
                UDYAM-MP-38-0052942
              </div>
            </div>

            {/* FUTURE RADIO */}
            <div className="flex flex-col items-start">
              <a href="https://mediamafias.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <h3 className="text-2xl font-black font-khand uppercase mb-4 text-[#FF69B4]">Curated by FUTURE RADIO</h3>
              </a>
              <p className="text-white/80 font-bold">
                Handpicked underground talent, raw regional stories, and pure spiritual streams curated by the <a href="https://mediamafias.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">FUTURE RADIO</a> collective. Where the underground becomes mainstream.
              </p>
            </div>

          </div>
          
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t-4 border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-black text-white/50 text-sm uppercase tracking-wide">
              &copy; {new Date().getFullYear()} FUTURE RADIO Roots. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-white/50 font-bold text-sm uppercase">
              <Link href="/privacy" className="hover:text-[#E5FF00] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#FF69B4] transition-colors">Terms</Link>
              
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}





