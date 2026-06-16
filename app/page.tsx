"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUiStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import CinematicSplash from "@/components/ui/CinematicSplash";
import VibeSelectorSheet from "@/components/ui/VibeSelectorSheet";
import { Header } from "@/components/layout/Header";
import { Play } from "lucide-react";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("future_radio_splash_shown") === "true") {
      setSplashComplete(true);
    }
  }, []);
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [listeners, setListeners] = useState(2438);

  useEffect(() => {
    const listenerInterval = setInterval(() => {
      setListeners(prev => prev + (Math.floor(Math.random() * 7) - 3));
    }, 4500);
    return () => clearInterval(listenerInterval);
  }, []);

  const handleCardClick = (mode: "radio" | "news", destination: string) => {
    setMode(mode);
    unlockAudio();
    setIsPlaying(true);
    router.push(destination);
  };

  const cardVariants = {
    hidden: { y: 24, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
  };

  return (
    <>
      <Header />
      
      {!splashComplete && <CinematicSplash onComplete={() => {
        setSplashComplete(true);
        sessionStorage.setItem("future_radio_splash_shown", "true");
      }} />}
      
      {/* Neo-Brutalist Background: Solid Yellow with stark black grid */}
      <main className={`min-h-screen bg-brand-yellow text-brand-dark flex flex-col pt-24 transition-opacity duration-1000 overflow-x-hidden relative ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* High contrast dot matrix */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #1A1E2E 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>

        {/* Main Content Grid */}
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Brand Typography (Spans 7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="col-span-7 flex flex-col items-center lg:items-start w-full text-center lg:text-left"
          >
            {/* Dark Brutalist Logo */}
            <img 
              src="/icons/logo-vertical-dark.png" 
              alt="Future Radio" 
              className="w-[200px] md:w-[280px] h-auto object-contain select-none pointer-events-none mb-8" 
            />
            
            <div className="flex flex-col items-center lg:items-start leading-none space-y-4">
              <p className="text-xl md:text-3xl font-baloo font-black text-brand-dark tracking-widest select-none uppercase border-2 border-brand-dark px-3 py-1 bg-white shadow-brutal-sm transform -rotate-1">
                डिजिटल इंडिया का
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-baloo font-black text-brand-dark tracking-tight select-none uppercase leading-[1.1] drop-shadow-[4px_4px_0_#fff]">
                नं 1 डिजिटल और वर्चुअल<br className="hidden lg:block"/> रेडियो नेटवर्क
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                <div className="bg-brand-red text-white border-4 border-brand-dark px-6 py-3 font-baloo font-black uppercase tracking-[0.2em] text-sm md:text-lg shadow-brutal transform -rotate-2 hover:rotate-0 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-default">
                  10 बोली, 1 प्लेटफॉर्म
                </div>
                <h2 className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest bg-white border-4 border-brand-dark px-4 py-3 shadow-brutal-sm">
                  100% Autonomous Streaming
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Right Column: The Brutalist "Radio Deck" (Spans 5 cols) */}
          <div className="col-span-5 w-full flex flex-col items-center lg:items-end justify-center space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full max-w-sm bg-white border-4 border-brand-dark shadow-[16px_16px_0_0_#FF2E2E] flex flex-col items-center relative overflow-hidden"
            >
              {/* Deck Top Status Bar */}
              <div className="w-full bg-brand-dark border-b-4 border-brand-dark px-4 py-3 flex justify-between items-center text-white">
                <span className="font-mono text-[10px] font-black uppercase">SYS.ONLINE</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-none h-3 w-3 bg-green-500 border border-brand-dark"></span>
                  </span>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-brand-yellow">
                    {listeners.toLocaleString()} LIVE
                  </span>
                </span>
              </div>

              {/* Deck Content */}
              <div className="p-10 flex flex-col items-center w-full relative z-10 bg-[url('/textures/dots.png')] bg-repeat">
                <div className="bg-brand-yellow border-2 border-brand-dark px-4 py-1 mb-10 shadow-brutal-sm transform rotate-2">
                  <p className="font-mono text-[10px] font-black text-brand-dark uppercase tracking-widest text-center">
                    Initiate Broadcast
                  </p>
                </div>

                {/* Flat Brutalist Play Button */}
                <div className="relative mb-10">
                  <button 
                    onClick={() => handleCardClick("radio", "/radio")}
                    aria-label="Play Future Radio"
                    className="relative bg-brand-red text-white w-[160px] h-[160px] rounded-none font-baloo font-bold uppercase flex flex-col items-center justify-center border-4 border-brand-dark shadow-[8px_8px_0_0_#1A1E2E] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_#1A1E2E] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 group"
                  >
                    <div className="w-[60px] h-[60px] rounded-none bg-brand-dark border-2 border-white flex items-center justify-center shadow-brutal-sm relative z-10 overflow-hidden mb-2 transform -rotate-3 group-hover:rotate-0 transition-transform">
                       <Play className="w-8 h-8 text-brand-yellow ml-1" fill="currentColor" />
                    </div>
                    
                    {/* The Square Indicator */}
                    <div className={`absolute top-4 w-4 h-4 rounded-none border-2 border-brand-dark transition-colors duration-200 ${mounted && isPlaying ? 'bg-green-500' : 'bg-white'}`}></div>
                    
                    <span className="z-10 mt-2 text-3xl font-black tracking-widest drop-shadow-md">PLAY</span>
                  </button>
                </div>

                {/* Deck Bottom Actions */}
                <div className="w-full grid grid-cols-2 gap-4">
                  <button onClick={() => setIsBottomSheetOpen(true)} className="bg-brand-yellow text-brand-dark font-mono font-black text-[10px] uppercase tracking-widest py-4 border-4 border-brand-dark hover:bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1A1E2E] transition-all">
                    Set Dialect
                  </button>
                  <Link href="/news" className="bg-brand-dark text-white font-mono font-black text-[10px] uppercase tracking-widest py-4 border-4 border-brand-dark hover:bg-brand-red hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_#1A1E2E] flex items-center justify-center transition-all">
                    Audio News
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Grid for Secondary Cards (Spotlight / Creator) */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("Voting & Charts feature coming soon in V1.5!")}
                className="bg-brand-red border-4 border-brand-dark p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-[6px_6px_0_0_#1A1E2E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150 min-h-[120px]"
              >
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-black tracking-widest text-white uppercase bg-brand-dark px-2 py-0.5 inline-block">Featured</span>
                  <div className="flex flex-col mt-2">
                    <span className="text-xl font-black text-brand-dark leading-none uppercase drop-shadow-[2px_2px_0_#fff]">CREATOR</span>
                    <span className="text-xl font-black text-white leading-none uppercase mt-1 drop-shadow-[2px_2px_0_#1A1E2E]">SPOTLIGHT</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-4 border-brand-dark p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-[6px_6px_0_0_#1A1E2E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150 min-h-[120px]"
              >
                <Link href="/creators" className="absolute inset-0 z-20"></Link>
                <div className="space-y-1 relative z-10 pointer-events-none">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase bg-brand-yellow border-2 border-brand-dark px-2 py-0.5 inline-block">Network</span>
                  <h2 className="text-xl font-black text-brand-dark tracking-tight uppercase leading-none mt-2">
                    Apply as<br/>Artist
                  </h2>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Brutalist Footer Area */}
        <footer className="w-full bg-brand-dark border-t-8 border-brand-red text-center pb-8 pt-6 px-6 flex flex-col gap-6 mt-auto">
          <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-yellow flex-wrap">
            <Link href="/about" className="hover:underline hover:text-white">About</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/terms" className="hover:underline hover:text-white">Terms</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/privacy" className="hover:underline hover:text-white">Privacy</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/creators" className="hover:underline hover:text-white">Creators</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/technology" className="hover:underline hover:text-white">Tech</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/business" className="hover:underline hover:text-white">Business</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/partner" className="hover:underline hover:text-white">Partner</Link>
            <span className="w-2 h-2 rounded-none bg-brand-red"></span>
            <Link href="/analysis" className="hover:underline hover:text-white">Analysis</Link>
          </div>

          <p className="text-[10px] md:text-xs text-white/80 font-sans leading-relaxed max-w-2xl mx-auto select-none font-medium mt-2">
            Future Radio is Digital India&apos;s premier creator-sourced radio network. A truly decentralized audio platform empowering independent creators by streaming their regional music, talk shows, and culturally relevant content to millions.
          </p>
          <div className="text-[10px] text-white font-mono font-black tracking-widest uppercase select-none mt-4 border-t-4 border-white/10 pt-6">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        <VibeSelectorSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />

      </main>
    </>
  );
}
