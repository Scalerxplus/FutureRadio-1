"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore, useUiStore, useAuthStore } from "@/lib/store";
import AuthModal from "@/components/auth/AuthModal";
import CinematicSplash from "@/components/ui/CinematicSplash";

const GENRES = [
  { id: "drive", name: "Drive & Commute 🚗" },
  { id: "chill", name: "Chill & Lofi ☕" },
  { id: "party", name: "Party & EDM 🪩" },
  { id: "romance", name: "Late Night Romance 🌙" },
  { id: "news", name: "News & Podcasts 🎙️" },
];

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
              src="/logo-horizontal.png" 
              alt="Future Radio" 
              className="h-[180px] md:h-[220px] object-contain mx-auto select-none pointer-events-none drop-shadow-2xl transition-transform duration-700 hover:scale-105" 
            />
            
            {/* The Neo-Brutalist Sticker Badge */}
            <div className="mt-4 -rotate-2 bg-yellow-300 text-black border-brutal border-black px-4 py-2 font-display font-bold uppercase tracking-widest text-sm shadow-brutal hover:-translate-y-1 hover:shadow-brutal-hover transition-all cursor-pointer">
              Powered By Indie Creators
            </div>

            <p className="text-4xl md:text-5xl font-display font-extrabold text-brand-dark tracking-wider select-none mt-6 uppercase">
              अब "फ्यूचर" सुनो!
            </p>
          </div>
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-white border-brutal border-black hover:bg-gray-100 shadow-brutal-sm transition duration-300 active:translate-y-1 active:translate-x-1 active:shadow-none"
            aria-label="Change genre context"
          >
            <span className="w-2 h-2 rounded-full bg-brand-red border border-black animate-pulse" />
            <span className="text-xs font-bold text-brand-dark uppercase font-sans">{cityName === "Raipur, CG" ? "INDIE MIX ⚡" : cityName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
              className="w-4 h-4 text-brand-dark"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </motion.div>

        {/* Experience Cards Section */}
        <div className="flex flex-col justify-end pb-2 pt-4">

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Card 1: Listen to Future */}
            <motion.div
              variants={cardVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCardClick("radio", "/radio")}
              className="h-[160px] rounded-none bg-white border-brutal border-black p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-brutal hover:-translate-y-1 hover:-translate-x-1 hover:shadow-brutal-hover active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-300"
            >
              {/* Decorative Radio Background Icon (Very Low Opacity) */}
              <div className="absolute top-4 right-4 text-black/[0.03] group-hover:text-black/[0.06] transition duration-300 select-none pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="w-24 h-24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                  />
                </svg>
              </div>

              {/* Card Meta Content */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-[0.15em] text-brand-red uppercase">
                  LIVE RADIO
                </span>
                <h2 className="text-[22px] font-black text-brand-dark tracking-tight uppercase">
                  Listen to Future
                </h2>
                <p className="text-xs text-gray-600 font-medium max-w-[280px] leading-relaxed">
                  Discover fresh tracks from independent artists, hosted by AI.
                </p>
              </div>

              {/* Card Bottom Tag Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-none bg-black border-2 border-black text-white text-[10px] font-bold uppercase tracking-wider w-fit font-sans">
                {/* Antenna Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 .334.148.65.405.864l4.061 3.385a1.125 1.125 0 0 1 .404.864v.796c0 .3-.1.593-.28.83l-2.407 3.21a1.125 1.125 0 0 1-.9.45H12.75V15h2.25a.75.75 0 0 1 0 1.5h-5.25a.75.75 0 0 1 0-1.5h2.25v-1.5a1.125 1.125 0 0 1-.9.45l-2.407-3.21a1.125 1.125 0 0 1-.28-.83v-.796c0-.334.148-.65.405-.864l4.062-3.385a1.125 1.125 0 0 1 .404-.864V3.03"
                  />
                </svg>
                <span>Live now · 2.4k listening</span>
              </div>
            </motion.div>

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
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-dark">
            <a href="#" className="hover:underline hover:text-black">Terms</a>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <a href="#" className="hover:underline hover:text-black">Privacy</a>
            <span className="w-1 h-1 rounded-full bg-black/30"></span>
            <a href="#" className="hover:underline hover:text-black">Creators</a>
          </div>
          <p className="text-[10px] text-black/70 font-sans leading-relaxed max-w-[320px] mx-auto select-none font-medium">
            Future Radio is a decentralized global audio platform empowering independent artists and creators.
          </p>
          <div className="text-[9px] text-brand-dark font-digital font-bold tracking-widest uppercase select-none mt-2">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        {/* City Selector Bottom Sheet Modal */}
        <AnimatePresence>
          {isBottomSheetOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBottomSheetOpen(false)}
                className="absolute inset-0 bg-black/60 z-40 backdrop-blur-xs"
              />

              {/* Bottom Sheet Container */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 z-50 bg-[#111118] border-t border-[#2a2a35] rounded-t-2xl px-6 pb-8 pt-4 space-y-6 shadow-2xl"
              >
                {/* Drag / Handle Indicator */}
                <div className="w-12 h-1 bg-[#2a2a35] rounded-full mx-auto" />

                {/* Header */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-white">Select Vibe / Genre</h3>
                  <p className="text-xs text-gray-500 mt-1">Updates the live radio playlist mood</p>
                </div>

                {/* Genre Options List */}
                <div className="space-y-1.5">
                  {GENRES.map((genre) => {
                    const isSelected = genre.name === cityName || (cityName === "Raipur, CG" && genre.id === "drive"); // Fallback for old default state
                    return (
                      <button
                        key={genre.id}
                        onClick={() => handleSelectCity(genre.id, genre.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${
                          isSelected
                            ? "bg-brand-red/15 text-brand-red border border-brand-red/20"
                            : "text-gray-300 hover:bg-[#1c1c28] border border-transparent"
                        }`}
                      >
                        <span>{genre.name}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-4 h-4 text-brand-red"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsBottomSheetOpen(false)}
                  className="w-full py-3 rounded-lg bg-[#2a2a35] hover:bg-[#343444] text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic AuthModal Anchor */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      </main>
    </div>
    </>
  );
}
