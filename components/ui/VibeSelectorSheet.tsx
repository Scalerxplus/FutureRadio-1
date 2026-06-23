"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore } from "@/lib/store";
import { resetAndUnlockAudioForTransition } from "@/components/audio/useAudioStore";

export const REGIONAL_STATIONS = [
  { id: "bagheli", name: "Bagheli Vibe", region: "Vindhya Region", listeners: "2.1k" },
  { id: "bhojpuri", name: "Bhojpuri Vibe", region: "Bihar & UP", listeners: "5.4k" },
  { id: "awadhi", name: "Awadhi Vibe", region: "Awadh Region", listeners: "3.2k" },
  { id: "maithili", name: "Maithili Vibe", region: "Mithila", listeners: "1.8k" },
  { id: "bundeli", name: "Bundeli Vibe", region: "Bundelkhand", listeners: "1.9k" },
];

export const DEVOTIONAL_STATIONS = [
  { id: "shiva", name: "Radio Mahakaal", region: "Devotional", listeners: "10k+" },
  { id: "hanuman", name: "Radio Mahabali", region: "Devotional", listeners: "8k+" },
  { id: "ram", name: "Radio Raghav", region: "Devotional", listeners: "9k+" },
  { id: "krishna", name: "Radio Keshav", region: "Devotional", listeners: "11k+" },
  { id: "jagannath", name: "Radio Jagannath", region: "Devotional", listeners: "5k+" },
  { id: "ganesha", name: "Radio EkDant", region: "Devotional", listeners: "7k+" },
  { id: "vishnu", name: "Radio Vishnu", region: "Devotional", listeners: "4k+" },
  { id: "laxmi", name: "Radio Mahalakshmi", region: "Devotional", listeners: "6k+" },
  { id: "saraswati", name: "Radio Saraswati", region: "Devotional", listeners: "3k+" },
  { id: "durga", name: "Radio Aadi Shakti", region: "Devotional", listeners: "9k+" },
];

export default function VibeSelectorSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cityName, setCityId, radioSection } = useCityStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectCity = (id: string, name: string) => {
    resetAndUnlockAudioForTransition();
    setCityId(id, name);
    onClose();
  };

  // --- MOBILE RESILIENCE & PRELOAD LOGIC (Root Cause 2) ---
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(""); // Reset search when opened
      let isCancelled = false;
      const prefetchChannels = async () => {
        const currentList = radioSection === "regional" ? REGIONAL_STATIONS : DEVOTIONAL_STATIONS;
        for (const genre of currentList) {
          if (isCancelled) break;
          if (genre.name !== cityName) {
            try {
              await fetch(`/api/broadcast/generate-hour?city=${genre.id}`, { method: 'POST' });
            } catch (e) {
              console.warn(`Failed to preload ${genre.id}`);
            }
          }
        }
      };
      setTimeout(() => { if (!isCancelled) prefetchChannels(); }, 500);
      return () => { isCancelled = true; };
    }
  }, [isOpen, cityName]);

  const currentList = radioSection === "regional" ? REGIONAL_STATIONS : DEVOTIONAL_STATIONS;
  const filteredGenres = currentList.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    genre.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-xs"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#111118] border-t-[6px] border-brand-red rounded-none shadow-[0_-10px_0_0_rgba(239,68,68,0.2)] max-h-[85dvh] flex flex-col md:max-w-[420px] md:mx-auto"
          >
            {/* Brutalist Top Accent */}
            <div className="absolute top-0 left-0 w-1/3 h-1 bg-white" />

            <div className="px-6 pt-6 pb-4 border-b-2 border-white/10 shrink-0">
              {/* Header */}
              <div className="text-left mb-4">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest font-sans">CHANNELS</h3>
                <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mt-1">Updates live radio playlist mood</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="SEARCH STATIONS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/10 focus:border-brand-red text-white text-xs font-bold tracking-widest uppercase rounded-none py-3 pl-10 pr-4 placeholder-gray-500 transition-colors focus:outline-none"
                />
              </div>
            </div>

            {/* Scrollable Genre Options List */}
            <div className="px-6 overflow-y-auto flex-1 space-y-2 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand-red/60 transition-colors">
              {filteredGenres.length > 0 ? (
                filteredGenres.map((genre) => {
                  const safeCityName = cityName || "";
                  const isSelected = safeCityName.includes(genre.name) || (["Global 📻", "Global", "Raipur, CG"].includes(safeCityName) && genre.id === "hindi"); 
                  return (
                    <button
                      key={genre.id}
                      onClick={() => handleSelectCity(genre.id, `Future Radio - ${genre.name}`)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-left transition-all duration-200 border-2 ${
                        isSelected
                          ? "bg-brand-red text-black border-brand-red translate-x-2 shadow-[-8px_0_0_0_rgba(255,255,255,1)]"
                          : "bg-black/30 text-white border-white/10 hover:border-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-black uppercase tracking-wider">{genre.name}</span>
                          {genre.id === 'news' ? (
                            <span className="text-[10px] bg-white text-black px-1.5 font-bold uppercase tracking-widest border border-black">LIVE</span>
                          ) : (
                            <span className="text-[12px]">🎵</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isSelected ? 'text-black/70' : 'text-gray-400'}`}>
                          {genre.region}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 bg-black/10 px-2 py-1 rounded-sm border border-black/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Playing</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                            {genre.listeners} listeners
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="block text-2xl mb-2">📡</span>
                  <p className="text-xs font-bold uppercase tracking-widest">No stations found</p>
                </div>
              )}
            </div>

            {/* Close Button Pinned at Bottom */}
            <div className="px-6 pb-8 pt-2 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-none bg-white text-black text-xs font-black uppercase tracking-widest border-2 border-black hover:bg-gray-200 active:translate-y-1 active:translate-x-1 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
