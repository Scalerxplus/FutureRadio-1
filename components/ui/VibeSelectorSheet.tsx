"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCityStore } from "@/lib/store";

export const GENRES = [
  { id: "global", name: "Future Global 🌍" },
  { id: "drive", name: "Drive & Commute 🚗" },
  { id: "chill", name: "Chill & Lofi ☕" },
  { id: "party", name: "Party & EDM 🪩" },
  { id: "romance", name: "Late Night Romance 🌙" },
  { id: "news", name: "News & Podcasts 🎙️" },
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
              onClick={onClose}
              className="w-full py-3 rounded-lg bg-[#2a2a35] hover:bg-[#343444] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
