"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCityStore, useUiStore } from "@/lib/store";
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
      
      {/* Background is a subtle grid pattern over a light gray to make the cards pop, shifting away from aggressive solid red */}
      <main className={`min-h-screen bg-gray-50 flex flex-col pt-24 transition-opacity duration-1000 overflow-x-hidden relative ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>

        {/* Main Content Grid */}
        <div className="w-full max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Brand Typography (Spans 7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="col-span-7 flex flex-col items-center lg:items-start w-full text-center lg:text-left"
          >
            {/* Reduced logo size for premium hierarchy */}
            <img 
              src="/icons/logo-vertical-dark.png" 
              alt="Future Radio" 
              className="w-[200px] md:w-[280px] h-auto object-contain select-none pointer-events-none transition-transform duration-700 hover:scale-105 mb-8 filter drop-shadow-xl" 
            />
            
            <div className="flex flex-col items-center lg:items-start leading-none space-y-4">
              <p className="text-xl md:text-3xl font-baloo font-bold text-gray-500 tracking-wide select-none uppercase">
                डिजिटल इंडिया का
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-baloo font-black text-brand-dark tracking-tight select-none uppercase leading-[1.1]">
                नं 1 डिजिटल और वर्चुअल<br className="hidden lg:block"/> रेडियो नेटवर्क
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                <div className="bg-brand-red text-white border-4 border-brand-dark px-6 py-2 font-baloo font-black uppercase tracking-[0.2em] text-sm md:text-base shadow-brutal transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                  10 बोली, 1 प्लेटफॉर्म
                </div>
                <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest bg-white border-2 border-gray-200 px-4 py-2">
                  100% Autonomous Streaming
                </h2>
              </div>
            </div>
          </motion.div>

          {/* Right Column: The "Radio Deck" (Spans 5 cols) */}
          <div className="col-span-5 w-full flex flex-col items-center lg:items-end justify-center space-y-6">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full max-w-sm bg-brand-dark border-4 border-brand-dark shadow-[16px_16px_0_0_#FF2E2E] flex flex-col items-center relative overflow-hidden"
            >
              {/* Deck Top Status Bar */}
              <div className="w-full bg-brand-yellow border-b-4 border-brand-dark px-4 py-3 flex justify-between items-center">
                <span className="font-mono text-[10px] font-black uppercase text-brand-dark">SYS.ONLINE</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="font-mono text-[10px] font-black uppercase text-brand-dark tracking-widest">
                    {listeners.toLocaleString()} LIVE
                  </span>
                </span>
              </div>

              {/* Deck Content */}
              <div className="p-10 flex flex-col items-center w-full relative z-10">
                <p className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">
                  Initiate Broadcast Sequence
                </p>

                {/* Massive Play Button Dial */}
                <div className="relative p-2.5 rounded-full bg-[#111] shadow-[inset_0_15px_25px_rgba(0,0,0,0.7),inset_0_-2px_5px_rgba(255,255,255,0.3),0_1px_2px_rgba(255,255,255,0.2)] border border-black/50 mb-8">
                  <button 
                    onClick={() => handleCardClick("radio", "/radio")}
                    aria-label="Play Future Radio"
                    className="relative bg-gradient-to-b from-zinc-800 to-zinc-950 text-white w-[160px] h-[160px] rounded-full font-baloo font-bold uppercase flex flex-col items-center justify-center border-t border-zinc-700/50 border-b-2 border-zinc-950 shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.1)] hover:-rotate-12 hover:shadow-[0_4px_10px_rgba(0,0,0,0.9),inset_0_2px_5px_rgba(255,255,255,0.1)] active:rotate-0 active:scale-[0.97] active:shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] transition-all duration-300 group"
                  >
                    {/* Inner glowing accent */}
                    <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${mounted && isPlaying ? 'shadow-[inset_0_0_20px_#22c55e]' : 'shadow-[inset_0_0_20px_rgba(255,46,46,0.3)]'}`}></div>
                    
                    {/* Center Core */}
                    <div className="w-[60px] h-[60px] rounded-full bg-[#111118] border-2 border-[#1c1c24] flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden mb-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                      <div className="w-[20px] h-[20px] rounded-full bg-[#0a0a0d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"></div>
                    </div>
                    
                    {/* The Dimple Indicator */}
                    <div className={`absolute top-3 w-4 h-4 rounded-full transition-colors duration-500 ${mounted && isPlaying ? 'bg-green-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_#22c55e]' : 'bg-brand-red shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_#ff0032]'}`}></div>
                    
                    {/* Concentric Dial Ridges */}
                    <div className="absolute inset-3 rounded-full border border-zinc-700/30 pointer-events-none group-hover:border-brand-red/20 transition-colors"></div>
                    <div className="absolute inset-5 rounded-full border border-zinc-700/10 pointer-events-none"></div>
                    
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)] z-10 mt-3 text-2xl tracking-widest text-[#f5f5f5]">PLAY</span>
                  </button>
                </div>

                {/* Deck Bottom Actions */}
                <div className="w-full grid grid-cols-2 gap-4">
                  <button onClick={() => setIsBottomSheetOpen(true)} className="bg-white text-brand-dark font-mono font-bold text-[10px] uppercase tracking-widest py-3 border-2 border-brand-dark hover:bg-gray-100 transition-colors">
                    Change Dialect
                  </button>
                  <Link href="/news" className="bg-[#111] text-white border-2 border-[#333] hover:border-brand-yellow font-mono font-bold text-[10px] uppercase tracking-widest py-3 flex items-center justify-center transition-colors">
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
                className="bg-brand-yellow border-4 border-brand-dark p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 min-h-[120px]"
              >
                <div className="space-y-1 relative z-10">
                  <span className="text-[10px] font-black tracking-widest text-brand-dark uppercase">Featured</span>
                  <div className="flex flex-col mt-1">
                    <span className="text-xl font-black text-brand-dark leading-none uppercase">CREATOR</span>
                    <span className="text-xl font-black text-brand-red leading-none uppercase mt-1">SPOTLIGHT</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-4 border-brand-dark p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 min-h-[120px]"
              >
                <Link href="/creators" className="absolute inset-0 z-20"></Link>
                <div className="space-y-1 relative z-10 pointer-events-none">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase">Network</span>
                  <h2 className="text-xl font-black text-brand-dark tracking-tight uppercase leading-none mt-2">
                    Apply as<br/>Artist
                  </h2>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Footer Area */}
        <footer className="w-full bg-white border-t-4 border-brand-dark text-center pb-8 pt-6 px-6 flex flex-col gap-4 mt-auto">
          <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-dark flex-wrap">
            <Link href="/about" className="hover:underline hover:text-brand-red">About</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/terms" className="hover:underline hover:text-brand-red">Terms</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/privacy" className="hover:underline hover:text-brand-red">Privacy</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/creators" className="hover:underline hover:text-brand-red">Creators</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/technology" className="hover:underline hover:text-brand-red">Tech</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/business" className="hover:underline hover:text-brand-red">Business</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/partner" className="hover:underline hover:text-brand-red">Partner</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <Link href="/analysis" className="hover:underline hover:text-brand-red">Analysis</Link>
          </div>

          <p className="text-[10px] md:text-xs text-gray-600 font-sans leading-relaxed max-w-2xl mx-auto select-none font-medium mt-4">
            Future Radio is Digital India&apos;s premier creator-sourced radio network. A truly decentralized audio platform empowering independent creators by streaming their regional music, talk shows, and culturally relevant content to millions.
          </p>
          <div className="text-[10px] text-brand-dark font-digital font-bold tracking-widest uppercase select-none mt-4 border-t-2 border-gray-200 pt-4">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        <VibeSelectorSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />

      </main>
    </>
  );
}
