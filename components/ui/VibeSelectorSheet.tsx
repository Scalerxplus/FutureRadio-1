"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCityStore } from "@/lib/store";

export const GENRES = [
  { id: "hindi", name: "Hindi", region: "Global Indie", listeners: "2.4k" },
  { id: "malwi", name: "Malwi", region: "Madhya Pradesh", listeners: "1.9k" },
  { id: "bagheli", name: "Bagheli", region: "Vindhya Region", listeners: "2.1k" },
  { id: "bundeli", name: "Bundeli", region: "Bundelkhand", listeners: "1.8k" },
  { id: "chhattisgarhi", name: "Chhattisgarhi", region: "Chhattisgarh", listeners: "2.2k" },
  { id: "sarguja", name: "Sarguja", region: "Ambikapur", listeners: "1.1k" },
  { id: "bastar", name: "Bastar", region: "Jagdalpur", listeners: "1.3k" },
  { id: "raigarh", name: "Raigarh", region: "East CG", listeners: "1.4k" },
  { id: "punjabi", name: "Punjabi", region: "Global Hits", listeners: "3.2k" },
  { id: "news", name: "News", region: "BBC + WSJ", listeners: "5.4k" },
];

export default function VibeSelectorSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cityName, setCityId } = useCityStore();

  const handleSelectCity = (id: string, name: string) => {
    setCityId(id, name);
    onClose();
  };

  // --- MOBILE RESILIENCE & PRELOAD LOGIC (Root Cause 2) ---
  // Silently preload other channels sequentially in the background when the sheet opens.
  // Sequential fetching prevents rate-limiting the DB or external APIs (like Audius) while eliminating switch lag.
  useEffect(() => {
    if (isOpen) {
      let isCancelled = false;
      const prefetchChannels = async () => {
        for (const genre of GENRES) {
          if (isCancelled) break;
          if (genre.name !== cityName) {
            try {
              // Pre-trigger the generator API so that when the user taps, the playlist is already built
              await fetch(`/api/broadcast/generate-hour?city=${genre.id}`, { method: 'POST' });
            } catch (e) {
              console.warn(`Failed to preload ${genre.id}`);
            }
          }
        }
      };
      // Give the sheet UI animation 500ms to finish smoothly before starting background network tasks
      setTimeout(() => { if (!isCancelled) prefetchChannels(); }, 500);

      return () => { isCancelled = true; };
    }
  }, [isOpen, cityName]);

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
            className="absolute bottom-0 left-0 right-0 z-50 bg-brand-dark border-t-[6px] border-brand-red rounded-none px-6 pb-8 pt-6 space-y-6 shadow-[0_-10px_0_0_rgba(239,68,68,0.2)]"
          >
            {/* Brutalist Top Accent */}
            <div className="absolute top-0 left-0 w-1/3 h-1 bg-white" />

            {/* Header */}
            <div className="text-left border-b-2 border-white/10 pb-4">
              <h3 className="text-2xl font-black text-white uppercase tracking-widest font-sans">CHANNELS</h3>
              <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mt-1">Updates live radio playlist mood</p>
            </div>

            {/* Genre Options List */}
            <div className="space-y-2">
              {GENRES.map((genre) => {
                const isSelected = cityName.includes(genre.name) || (["Global 📻", "Global", "Raipur, CG"].includes(cityName) && genre.id === "hindi"); 
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleSelectCity(genre.id, `Future Radio - ${genre.name}`)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-left transition-all duration-200 border-2 ${
                      isSelected
                        ? "bg-brand-red text-black border-brand-red translate-x-2 shadow-[-8px_0_0_0_rgba(255,255,255,1)]"
                        : "bg-transparent text-white border-white/10 hover:border-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
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
              })}
            </div>

            {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-none bg-white text-black text-xs font-black uppercase tracking-widest border-2 border-black hover:bg-gray-200 active:translate-y-1 active:translate-x-1 transition-all duration-200"
              >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
