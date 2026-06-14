"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore, useUiStore, useAuthStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import AuthModal from "@/components/auth/AuthModal";
import CinematicSplash from "@/components/ui/CinematicSplash";
import VibeSelectorSheet from "@/components/ui/VibeSelectorSheet";
import { Header } from "@/components/layout/Header";

export default function EntrySplashPage() {
  const router = useRouter();
  const { cityName, setCityId } = useCityStore();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { user, isYtPremium } = useAuthStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("future_radio_splash_shown") === "true") {
      setSplashComplete(true);
    }
  }, []);
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
      
      <main className={`min-h-screen bg-brand-red flex flex-col pt-24 transition-opacity duration-1000 overflow-x-hidden ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Main Content Grid */}
        <div className="w-full max-w-7xl mx-auto px-6 py-8 flex-grow flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-center">
          
          {/* Left Column: Branding Identity */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center lg:text-left space-y-8 flex flex-col items-center lg:items-start w-full"
          >
            <img 
              src="/icons/logo-homepage.png" 
              alt="Future Radio" 
              className="w-[280px] md:w-[380px] lg:w-[450px] h-auto object-contain select-none pointer-events-none drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
            />
            
            <div className="flex flex-col items-center lg:items-start leading-tight">
              <p className="text-xl md:text-3xl lg:text-4xl font-baloo font-bold text-brand-dark tracking-wide select-none uppercase">
                डिजिटल इंडिया का
              </p>
              <h1 className="text-[22px] md:text-4xl lg:text-5xl font-baloo font-bold text-white tracking-wide select-none uppercase drop-shadow-md mt-2 mb-4">
                नं 1 डिजिटल और वर्चुअल<br className="hidden lg:block"/> रेडियो नेटवर्क
              </h1>
              <h2 className="text-[10px] md:text-xs lg:text-sm font-sans font-bold text-brand-dark/80 uppercase tracking-[0.2em] mb-6">
                Digital India&apos;s #1 Digital & Virtual Radio Network
              </h2>
              <div className="bg-brand-yellow text-brand-dark border-4 border-brand-dark px-6 py-2 font-baloo font-black uppercase tracking-[0.2em] text-sm md:text-base shadow-brutal transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
                10 बोली, 1 प्लेटफॉर्म
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Action Center */}
          <div className="w-full max-w-md mx-auto lg:mx-0 flex flex-col items-center lg:items-end justify-center space-y-8 relative z-10">
            
            {/* Top Right Auth Sync (Desktop aligns right, Mobile centers) */}
            <div className="w-full flex justify-center lg:justify-end">
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-xs font-bold uppercase tracking-wider transition duration-300 shadow-sm hover:-translate-y-1 ${
                  user
                    ? isYtPremium
                      ? "bg-black text-white border-white/30"
                      : "bg-white text-brand-red border-brand-red"
                    : "bg-brand-dark text-white border-brand-dark hover:bg-white hover:text-brand-dark"
                }`}
              >
                <span>{user ? (isYtPremium ? "🎟️ Premium" : "📡 Connected") : "🔑 Sync Account"}</span>
              </button>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="w-full space-y-6"
            >
              {/* How it Works Banner */}
              <div className="bg-brand-dark text-white border-4 border-brand-dark shadow-brutal px-4 py-3 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center transform rotate-1 hover:rotate-0 transition-transform">
                 <div className="flex items-center gap-2 md:gap-3 opacity-95 text-center flex-wrap justify-center">
                   <span className="text-brand-yellow">CLICK PLAY</span>
                   <img src="/icons/player-logo.png" alt="Play" className="w-5 h-5 object-contain" />
                   <span>CHOOSE FROM 8 DIALECTS & 2 LANGUAGES</span>
                 </div>
              </div>

              {/* Play Button & Listeners */}
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="relative p-2.5 rounded-full bg-[#dc0029] shadow-[inset_0_15px_25px_rgba(0,0,0,0.7),inset_0_-2px_5px_rgba(255,255,255,0.3),0_1px_2px_rgba(255,255,255,0.2)] border border-black/10">
                  <button 
                    onClick={() => handleCardClick("radio", "/radio")}
                    aria-label="Play Future Radio"
                    className="relative bg-gradient-to-b from-zinc-800 to-zinc-950 text-white w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full font-baloo font-bold uppercase flex flex-col items-center justify-center border-t border-zinc-700/50 border-b-2 border-zinc-950 shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.1)] hover:-rotate-12 hover:shadow-[0_4px_10px_rgba(0,0,0,0.9),inset_0_2px_5px_rgba(255,255,255,0.1)] active:rotate-0 active:scale-[0.97] active:shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] transition-all duration-300 group"
                  >
                    <div className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-full bg-[#111118] border-2 border-[#1c1c24] flex items-center justify-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] relative z-10 overflow-hidden mb-1">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
                      <div className="w-[15px] h-[15px] md:w-[20px] md:h-[20px] rounded-full bg-[#0a0a0d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"></div>
                    </div>
                    
                    <div className={`absolute top-4 w-4 h-4 rounded-full transition-colors duration-500 ${mounted && isPlaying ? 'bg-green-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_#22c55e]' : 'bg-brand-red shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_#ff0032]'}`}></div>
                    
                    <div className="absolute inset-4 rounded-full border border-zinc-700/30 pointer-events-none group-hover:border-brand-red/20 transition-colors"></div>
                    <div className="absolute inset-6 rounded-full border border-zinc-700/10 pointer-events-none"></div>
                    
                    <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)] z-10 mt-4 text-2xl md:text-3xl tracking-widest text-[#f5f5f5]">PLAY</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3 bg-brand-dark backdrop-blur-xl px-6 py-3 border-4 border-brand-dark shadow-brutal-sm transform -rotate-1 hover:rotate-0 transition-transform">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
                  </span>
                  <span className="text-xs md:text-sm font-black text-brand-yellow uppercase tracking-widest drop-shadow-lg">
                    Live: {listeners.toLocaleString()} listeners
                  </span>
                </div>
              </div>

              {/* Grid for Secondary Cards */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <motion.div
                  variants={cardVariants}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("Voting & Charts feature coming soon in V1.5!")}
                  className="aspect-square bg-brand-yellow border-4 border-brand-dark p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-300"
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] md:text-xs font-black tracking-widest text-brand-dark uppercase">Spotlight</span>
                    <div className="flex flex-col mt-1">
                      <span className="text-xl md:text-2xl font-black text-brand-dark leading-none uppercase">CREATOR</span>
                      <span className="text-xl md:text-2xl font-black text-brand-red leading-none uppercase mt-1">SPOTLIGHT</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none text-brand-dark opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
                </motion.div>

                <motion.div
                  variants={cardVariants}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("Artist submission portal coming soon in V1.5!")}
                  className="aspect-square bg-white border-4 border-brand-dark p-4 md:p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-300"
                >
                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] md:text-xs font-black tracking-widest text-brand-red uppercase">CREATORS</span>
                    <h2 className="text-xl md:text-2xl font-black text-brand-dark tracking-tight uppercase leading-none mt-2">
                      Apply as<br/>Artist
                    </h2>
                  </div>
                  <div className="absolute inset-0 pointer-events-none text-brand-red opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '12px 12px' }} />
                </motion.div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* Footer Area */}
        <footer className="w-full bg-brand-yellow/90 border-t-4 border-brand-dark text-center pb-8 pt-6 px-6 flex flex-col gap-4 mt-auto shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
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
            <span className="w-1.5 h-1.5 rounded-full bg-brand-dark"></span>
            <a href="/media-kit.html" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-brand-red">Advertise</a>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-brand-dark/80">
            <Link href="/radio/hindi" className="hover:text-brand-red hover:underline transition-colors">Hindi Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/bagheli" className="hover:text-brand-red hover:underline transition-colors">Bagheli Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/bundeli" className="hover:text-brand-red hover:underline transition-colors">Bundeli Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/chhattisgarhi" className="hover:text-brand-red hover:underline transition-colors">Chhattisgarhi Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/malwi" className="hover:text-brand-red hover:underline transition-colors">Malwi Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/sarguja" className="hover:text-brand-red hover:underline transition-colors">Sarguja Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/bastar" className="hover:text-brand-red hover:underline transition-colors">Bastar Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/raigarh" className="hover:text-brand-red hover:underline transition-colors">Raigarh Radio</Link>
            <span className="text-brand-dark/30">•</span>
            <Link href="/radio/punjabi" className="hover:text-brand-red hover:underline transition-colors">Punjabi Radio</Link>
          </div>

          <p className="text-[10px] md:text-xs text-brand-dark/90 font-sans leading-relaxed max-w-2xl mx-auto select-none font-medium mt-4">
            Future Radio is Digital India&apos;s premier creator-sourced radio network. A truly decentralized audio platform empowering independent creators by streaming their regional music, talk shows, and culturally relevant content to millions.
          </p>
          <div className="text-[10px] text-brand-dark font-digital font-bold tracking-widest uppercase select-none mt-4 border-t-2 border-brand-dark/10 pt-4">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        <VibeSelectorSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      </main>
    </>
  );
}
