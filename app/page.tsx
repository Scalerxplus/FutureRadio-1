"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore, useUiStore, useAuthStore } from "@/lib/store";
import AuthModal from "@/components/auth/AuthModal";
import CinematicSplash from "@/components/ui/CinematicSplash";

import VibeSelectorSheet from "@/components/ui/VibeSelectorSheet";

export default function EntrySplashPage() {
  const router = useRouter();
  const { cityName, setCityId } = useCityStore();
  const { setMode } = useUiStore();
  const { user, isYtPremium } = useAuthStore();
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  const handleCardClick = (mode: "radio" | "news", destination: string) => {
    setMode(mode);
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
              src="/icons/logo-vertical-light.png" 
              alt="Future Radio" 
              className="w-[260px] md:w-[320px] h-auto object-contain mx-auto select-none pointer-events-none drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
            />
            
            {/* Regional Subtitle */}
            <div className="text-center flex flex-col items-center leading-tight mt-6 mb-2">
              <p className="text-sm md:text-base font-display font-black text-brand-dark tracking-widest select-none uppercase mb-2">
                MP-CG ka pehla AI Radio
              </p>
              <div className="bg-yellow-300 text-black border-brutal border-black px-4 py-1.5 font-display font-black uppercase tracking-[0.2em] text-[11px] shadow-brutal transform -rotate-1">
                10 Boli, Ek Platform
              </div>
            </div>
          </div>
        </motion.div>

        {/* Experience Cards Section */}
        <div className="flex flex-col justify-end pb-2 pt-4">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Abhi Suno Button & Live Proof (Above the Fold) */}
            <div className="flex flex-col items-center space-y-4 mb-8 relative z-10 w-full">
              <button 
                onClick={() => handleCardClick("radio", "/radio")}
                className="bg-black text-white w-full py-4 rounded-full font-black text-xl tracking-widest uppercase flex items-center justify-center gap-3 border-[3px] border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-[0_0px_0_0_rgba(0,0,0,1)] transition-all"
              >
                Abhi Suno 
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-black/10">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)] border border-black" />
                <span className="text-[11px] font-black text-brand-dark uppercase tracking-widest">
                  Live: 2,400+ listeners
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
                  <span className="text-[10px] font-bold tracking-[0.1em] text-black uppercase">CHARTS</span>
                  <h2 className="text-xl font-black text-black tracking-tight uppercase leading-tight">
                    Top 50<br/>Indie
                  </h2>
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
                    Artist<br/>Portal
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
            <Link href="/terms" className="hover:underline hover:text-black">Terms</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/privacy" className="hover:underline hover:text-black">Privacy</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/creators" className="hover:underline hover:text-black">Creators</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/business" className="hover:underline hover:text-black">Business</Link>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <Link href="/takedown" className="hover:underline hover:text-brand-red">Takedowns</Link>
          </div>
          <p className="text-[10px] text-black/70 font-sans leading-relaxed max-w-[320px] mx-auto select-none font-medium">
            Future Radio is a decentralized global audio platform empowering independent artists and creators.
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
