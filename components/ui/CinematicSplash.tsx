"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CinematicSplash({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // allow exit animation to complete
    }, 2800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#050505]"
        >
          {/* Carbon Fiber Background Pattern */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px,
                linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px,
                linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px,
                linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px,
                linear-gradient(90deg, #1b1b1b 10px, transparent 10px),
                linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424 100%)
              `,
              backgroundSize: "20px 20px"
            }}
          />
          
          {/* Vignette Overlay for Cinematic feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80 pointer-events-none" />

          {/* Logo Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              delay: 0.2
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Cinematic Lens Flare Glow Behind Logo */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.5, 0.2], scale: [0.5, 1.5, 1.2] }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[100px] bg-brand-red/30 blur-[40px] rounded-[100%]"
            />
            
            <img 
              src="/icons/logo-vertical-light.png" 
              alt="Future Radio" 
              className="w-64 md:w-80 h-auto object-contain select-none pointer-events-none drop-shadow-2xl" 
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
