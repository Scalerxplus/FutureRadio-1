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

export default function EntrySplashPage() {
  const router = useRouter();
  const { cityName, setCityId } = useCityStore();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { user, isYtPremium } = useAuthStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [listeners, setListeners] = useState(2438);

  useEffect(() => {
    const listenerInterval = setInterval(() => {
      setListeners(prev => prev + (Math.floor(Math.random() * 7) - 3));
    }, 4500);
    return () => {
      clearInterval(listenerInterval);
    };
  }, []);

  const handleCardClick = (mode: "radio" | "news", destination: string) => {
    setMode(mode);
    unlockAudio(); // Unlock audio context on user interaction for iOS
    setIsPlaying(true); // Start playback only when user explicitly clicks PLAY
    router.push(destination);
  };

  const handleSelectCity = (id: string, name: string) => {
    setCityId(id, name);
    setIsBottomSheetOpen(false);
  };

  // Staggered child animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 24, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } },
  };

  return (
    <>
      {!splashComplete && <CinematicSplash onComplete={() => setSplashComplete(true)} />}
      
      <div className={`min-h-screen bg-brand-red flex justify-center items-center transition-opacity duration-1000 ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        {/* Centered Mobile viewport shell */}
      <main className="w-full max-w-[430px] min-h-screen bg-brand-red text-brand-dark flex flex-col justify-between px-6 py-10 relative overflow-hidden shadow-none border-x-brutal border-black">
        
        {/* Auth / Profile Sticky Header Layer */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setIsAuthOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition duration-300 ${
              user
                ? isYtPremium
                  ? "bg-[#ffffff]/15 border-[#ffffff]/30 text-white"
                  : "bg-brand-red/15 border-brand-red/30 text-brand-red"
                : "bg-[#111118] border-brand-border text-gray-400 hover:text-white"
            }`}
          >
            <span>{user ? (isYtPremium ? "🎟️ Premium" : "📡 Connected") : "🔑 Sync Account"}</span>
          </button>
        </div>

        {/* Main Branding Section (Aggressive & Cool) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center space-y-6 flex flex-col items-center relative z-10 my-auto py-8"
        >

          <div className="space-y-4 relative z-10 flex flex-col items-center">
            <img 
              src="/icons/logo-homepage.png" 
              alt="Future Radio" 
              className="w-[260px] md:w-[320px] h-auto object-contain mx-auto select-none pointer-events-none drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
            />
            
            {/* Regional Subtitle */}
            <div className="text-center flex flex-col items-center leading-tight mt-6 mb-2">
              <p className="text-xl md:text-2xl font-baloo font-bold text-brand-dark tracking-wide select-none uppercase">
                डिजिटल इंडिया का
              </p>
              <p className="text-[22px] md:text-3xl font-baloo font-bold text-white tracking-wide select-none uppercase drop-shadow-md mb-2 mt-1">
                नं 1 डिजिटल रेडियो नेटवर्क
              </p>
              <p className="text-[10px] md:text-xs font-sans font-bold text-brand-dark/80 uppercase tracking-[0.2em] mb-4">
                Digital India&apos;s #1 Digital Radio Network
              </p>
              <div className="bg-yellow-300 text-black border-brutal border-black px-4 py-1.5 font-baloo font-bold uppercase tracking-[0.2em] text-[12px] shadow-brutal transform -rotate-1">
                10 बोली, 1 प्लेटफॉर्म
              </div>
            </div>
          </div>
        </motion.div>

        {/* How it Works Micro-Explainer */}
        <div className="flex justify-center mb-4 px-4 relative z-10 w-full mt-2">
          <div className="bg-black text-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] px-4 py-2.5 font-mono text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transform rotate-1">
             <div className="flex items-center gap-2 md:gap-3 opacity-95 text-center flex-wrap justify-center">
               <span>CLICK PLAY</span>
               <img src="/icons/player-logo.png" alt="Play" className="w-5 h-5 object-contain" />
               <span>CHOOSE FROM 8 DIALECTS & 2 LANGUAGES (HINDI & PUNJABI)</span>
             </div>
          </div>
        </div>

        {/* Experience Cards Section */}
        <div className="flex flex-col justify-end pb-2 pt-2">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Abhi Suno Button & Live Proof (Above the Fold) */}
            <div className="flex flex-col items-center space-y-4 mb-8 relative z-10 w-full">
              {/* Recessed Frame Wrapper */}
              <div className="relative p-2 md:p-2.5 rounded-full bg-[#dc0029] shadow-[inset_0_15px_25px_rgba(0,0,0,0.7),inset_0_-2px_5px_rgba(255,255,255,0.3),0_1px_2px_rgba(255,255,255,0.2)] border border-black/10">
                <button 
                  onClick={() => handleCardClick("radio", "/radio")}
                  className="relative bg-gradient-to-b from-zinc-800 to-zinc-950 text-white w-[130px] h-[130px] md:w-[150px] md:h-[150px] rounded-full font-baloo font-bold uppercase flex flex-col items-center justify-center border-t border-zinc-700/50 border-b-2 border-zinc-950 shadow-[0_8px_15px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.1)] hover:-rotate-12 hover:shadow-[0_4px_10px_rgba(0,0,0,0.9),inset_0_2px_5px_rgba(255,255,255,0.1)] active:rotate-0 active:scale-[0.97] active:shadow-[inset_0_10px_20px_rgba(0,0,0,0.9)] transition-all duration-300 group"
                >
                  {/* The Dimple */}
                  <div className={`absolute top-3 w-4 h-4 rounded-full transition-colors duration-500 ${mounted && isPlaying ? 'bg-green-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_#22c55e]' : 'bg-brand-red shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_8px_#ff0032]'}`}></div>
                  
                  {/* Concentric Dial Ridges */}
                  <div className="absolute inset-3 rounded-full border border-zinc-700/30 pointer-events-none group-hover:border-brand-red/20 transition-colors"></div>
                  <div className="absolute inset-5 rounded-full border border-zinc-700/10 pointer-events-none"></div>
                  
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)] z-10 mt-3 text-[22px] md:text-2xl tracking-widest text-[#f5f5f5]">PLAY</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(74,222,128,1)]"></span>
                </span>
                <span className="text-[12px] font-black text-white uppercase tracking-widest drop-shadow-lg">
                  Live: {listeners.toLocaleString()} listeners
                </span>
              </div>
            </div>

            {/* Grid for Cards 2 & 3 */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 2: Global Charts & Voting */}
              <motion.div
                variants={cardVariants}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("Voting & Charts feature coming soon in V1.5!")}
                className="aspect-square rounded-none bg-[#FFDB58] border-brutal border-black p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-300"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-[0.1em] text-black uppercase">Spotlight</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-black leading-[1.1] tracking-tighter">CREATOR</span>
                    <span className="text-2xl font-black text-black leading-[1.1] tracking-tighter">SPOTLIGHT</span>
                  </div>
                </div>
                
                {/* Decorative Dot Matrix Background */}
                <div 
                  className="absolute inset-0 pointer-events-none text-black opacity-15 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ 
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
                    backgroundSize: '8px 8px' 
                  }} 
                />
                <div className="flex items-center justify-center w-8 h-8 bg-black rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>

              {/* Card 3: Artist Portal */}
              <motion.div
                variants={cardVariants}
                whileTap={{ scale: 0.95 }}
                onClick={() => alert("Artist submission portal coming soon in V1.5!")}
                className="aspect-square rounded-none bg-brand-dark border-brutal border-black p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-300"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-[0.1em] text-brand-red uppercase">CREATORS</span>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase leading-tight">
                    Apply as<br/>Artist
                  </h2>
                </div>

                {/* Decorative Dot Matrix Background */}
                <div 
                  className="absolute inset-0 pointer-events-none text-[#FFDB58] opacity-15 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ 
                    backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
                    backgroundSize: '8px 8px' 
                  }} 
                />
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black">
                    <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Top-Tier Corporate Footer */}
        <footer className="w-full text-center pb-8 pt-6 px-6 flex flex-col gap-4 mt-auto">
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark flex-wrap">
            <Link href="/about" className="hover:underline hover:text-black">About</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/terms" className="hover:underline hover:text-black">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/privacy" className="hover:underline hover:text-black">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/creators" className="hover:underline hover:text-black">Creators</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/business" className="hover:underline hover:text-black">Business</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <a href="/media-kit.html" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-brand-red font-black">Advertise</a>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/takedown" className="hover:underline hover:text-brand-red">Takedowns</Link>
          </div>
          <p className="text-[10px] text-black/70 font-sans leading-relaxed max-w-[340px] md:max-w-md mx-auto select-none font-medium text-balance">
            Future Radio is Digital India&apos;s premier creator-sourced radio network. A truly decentralized audio platform empowering independent creators by streaming their regional music, talk shows, and culturally relevant content to millions.
          </p>
          <div className="text-[9px] text-brand-dark font-digital font-bold tracking-widest uppercase select-none mt-2">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        {/* City Selector Bottom Sheet Modal */}
        <VibeSelectorSheet 
          isOpen={isBottomSheetOpen} 
          onClose={() => setIsBottomSheetOpen(false)} 
        />

        {/* Dynamic AuthModal Anchor */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      </main>
    </div>
    </>
  );
}
