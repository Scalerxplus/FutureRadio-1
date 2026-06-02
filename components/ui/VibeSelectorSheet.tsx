"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCityStore } from "@/lib/store";

export const GENRES = [
  { id: "hindi", name: "Future Radio - Hindi" },
  { id: "malwi", name: "Future Radio - Malwi" },
  { id: "bagheli", name: "Future Radio - Bagheli" },
  { id: "bundeli", name: "Future Radio - Bundeli" },
  { id: "chhattisgarhi", name: "Future Radio - Chhattisgarhi" },
  { id: "sarguja", name: "Future Radio - Sarguja/Ambikapur" },
  { id: "bastar", name: "Future Radio - Bastar/Jagdalpur" },
  { id: "raigarh", name: "Future Radio - Raigarh" },
  { id: "punjabi", name: "Future Radio - Punjabi" },
  { id: "news", name: "Future Radio - News" },
];

export default function VibeSelectorSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cityName, setCityId } = useCityStore();

  const handleSelectCity = (id: string, name: string) => {
    setCityId(id, name);
    onClose();
  };

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
            <div className="space-y-1.5">
              {GENRES.map((genre) => {
                const isSelected = genre.name === cityName || (["Global 📻", "Global", "Raipur, CG"].includes(cityName) && genre.id === "hindi"); // Fallback for old default states
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleSelectCity(genre.id, genre.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-none text-left font-black uppercase tracking-wider transition-all duration-200 border-2 ${
                      isSelected
                        ? "bg-brand-red text-black border-brand-red translate-x-2 shadow-[-8px_0_0_0_rgba(255,255,255,1)]"
                        : "bg-transparent text-white border-white/10 hover:border-white hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    }`}
                  >
                    <span>{genre.name}</span>
                    {isSelected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={4}
                        stroke="currentColor"
                        className="w-5 h-5 text-black"
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
