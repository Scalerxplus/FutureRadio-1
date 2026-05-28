"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore, useUiStore, useAuthStore } from "@/lib/store";
import AuthModal from "@/components/auth/AuthModal";

const CITIES = [
  { id: "raipur", name: "Raipur, CG" },
  { id: "indore", name: "Indore, MP" },
  { id: "bhopal", name: "Bhopal, MP" },
  { id: "nagpur", name: "Nagpur, MH" },
  { id: "surat", name: "Surat, GJ" },
];

export default function EntrySplashPage() {
  const router = useRouter();
  const { cityName, setCityId } = useCityStore();
  const { setMode } = useUiStore();
  const { user, isYtPremium } = useAuthStore();
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0f] flex justify-center items-center">
      {/* Centered Mobile viewport shell */}
      <main className="w-full max-w-[430px] min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between px-6 py-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#111118]">
        
        {/* Auth / Profile Sticky Header Layer */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setIsAuthOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition duration-300 ${
              user
                ? isYtPremium
                  ? "bg-[#1d9e75]/15 border-[#1d9e75]/30 text-brand-teal"
                  : "bg-brand-purple/15 border-brand-purple/30 text-brand-purple"
                : "bg-[#111118] border-brand-border text-gray-400 hover:text-white"
            }`}
          >
            <span>{user ? (isYtPremium ? "🎟️ Premium" : "📡 Connected") : "🔑 Sync Account"}</span>
          </button>
        </div>

        {/* Top Branding Section */}
        <div className="text-center pt-8 space-y-4 flex flex-col items-center">
          <div className="space-y-2">
            <img 
              src="/logo.png" 
              alt="Future Radio" 
              className="h-[70px] object-contain mx-auto select-none pointer-events-none drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" 
            />
            <p className="text-xl font-bold text-white italic underline decoration-brand-purple decoration-[3px] underline-offset-[6px] tracking-wide select-none drop-shadow-lg">
              अब फ्यूचर सुनो!
            </p>
          </div>

          {/* City Selector Pill */}
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111118] border border-[#2a2a35] hover:border-brand-purple/40 hover:bg-[#111118]/80 transition duration-300"
            aria-label="Change city context"
          >
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            <span className="text-xs font-semibold text-gray-300">{cityName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-3.5 h-3.5 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Cinematic Radio Reborn Hook */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="mt-10 mb-2 w-full flex items-center justify-center relative select-none pointer-events-none"
        >
          {/* Deep Cinematic Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-24 bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent rounded-full blur-3xl opacity-80" />
          
          <h1 className="text-[34px] font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#f0f0f0] to-[#7f77dd] drop-shadow-[0_0_35px_rgba(127,119,221,0.6)] relative z-10 text-center leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
            RADIO <br /> REBORN
          </h1>
        </motion.div>

        {/* Experience Cards Section */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 select-none">
              CHOOSE YOUR EXPERIENCE
            </span>
          </div>

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
              className="h-[160px] rounded-2xl bg-[#111118] border border-[#2a2a35] p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-brand-purple/40 hover:shadow-[0_0_20px_rgba(127,119,221,0.05)] transition-colors duration-300"
            >
              {/* Decorative Radio Background Icon (Very Low Opacity) */}
              <div className="absolute top-4 right-4 text-white/[0.02] group-hover:text-white/[0.04] transition duration-300 select-none pointer-events-none">
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
                <span className="text-[10px] font-bold tracking-[0.15em] text-brand-purple uppercase">
                  LIVE RADIO
                </span>
                <h2 className="text-[22px] font-bold text-white tracking-tight">
                  Listen to Future
                </h2>
                <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
                  AI RJ, local vibes, non-stop music curated for {cityName}
                </p>
              </div>

              {/* Card Bottom Tag Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-[10px] font-semibold uppercase tracking-wider w-fit">
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

            {/* Card 2: Whatsup News */}
            <motion.div
              variants={cardVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCardClick("news", "/news")}
              className="h-[160px] rounded-2xl bg-[#111118] border border-[#2a2a35] p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-brand-teal/40 hover:shadow-[0_0_20px_rgba(29,158,117,0.05)] transition-colors duration-300"
            >
              {/* Decorative Newspaper Background Icon (Very Low Opacity) */}
              <div className="absolute top-4 right-4 text-white/[0.02] group-hover:text-white/[0.04] transition duration-300 select-none pointer-events-none">
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
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
                  />
                </svg>
              </div>

              {/* Card Meta Content */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-[0.15em] text-brand-teal uppercase">
                  NEWS FEED
                </span>
                <h2 className="text-[22px] font-bold text-white tracking-tight">
                  Whatsup News
                </h2>
                <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
                  Hyper-local {cityName} + national stories that matter to you
                </p>
              </div>

              {/* Card Bottom Tag Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-[10px] font-semibold uppercase tracking-wider w-fit">
                {/* Sparkles Icon */}
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
                    d="M9.813 15.904 9 21l-.813-5.096L3 15l5.187-.813L9 9l.813 5.187L15 15l-5.187.813ZM18.257 5.75 17.5 9l-.757-3.25L13.5 5l3.243-.75L17.5 1l.757 3.25L21.5 5l-3.243.75Z"
                  />
                </svg>
                <span>47 new stories today</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer/Sticker Caption */}
        <footer className="text-center pt-4 pb-2 px-4">
          <p className="text-[10px] text-gray-500 leading-relaxed max-w-[280px] mx-auto select-none">
            You can use both at once. Radio keeps playing while you browse news.
          </p>
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
                  <h3 className="text-base font-bold text-white">Select City</h3>
                  <p className="text-xs text-gray-500 mt-1">Updates localized radio voiceovers and news</p>
                </div>

                {/* City Options List */}
                <div className="space-y-1.5">
                  {CITIES.map((city) => {
                    const isSelected = city.name === cityName;
                    return (
                      <button
                        key={city.id}
                        onClick={() => handleSelectCity(city.id, city.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-semibold transition ${
                          isSelected
                            ? "bg-brand-purple/15 text-brand-purple border border-brand-purple/20"
                            : "text-gray-300 hover:bg-[#1c1c28] border border-transparent"
                        }`}
                      >
                        <span>{city.name}</span>
                        {isSelected && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                            className="w-4 h-4 text-brand-purple"
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
  );
}