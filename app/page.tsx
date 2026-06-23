"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useUiStore, useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import CinematicSplash from "@/components/ui/CinematicSplash";
import { Header } from "@/components/layout/Header";
import { Play, Radio, Heart, Users, ArrowRight } from "lucide-react";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { setRadioSection, setCityId } = useCityStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [listeners, setListeners] = useState(10438);

  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("future_radio_splash_shown") === "true") {
      setSplashComplete(true);
    }
  }, [setSplashComplete]);

  useEffect(() => {
    const listenerInterval = setInterval(() => {
      setListeners(prev => prev + (Math.floor(Math.random() * 15) - 5));
    }, 3000);
    return () => clearInterval(listenerInterval);
  }, []);

  const handlePlayCard = (mode: "radio" | "news", section: "regional" | "devotional") => {
    setMode(mode);
    setRadioSection(section);
    
    const defaultId = section === "devotional" ? "shiva" : "bhojpuri";
    const defaultName = section === "devotional" ? "Radio Mahakaal" : "Bhojpuri Vibe";
    setCityId(defaultId, `Future Radio - ${defaultName}`);
    
    unlockAudio();
    setIsPlaying(true);
    router.push("/radio");
  };

  const stations = [
    "रेडियो महाकाल", "केशव वाइब", "राघव वाइब", 
    "भोजपुरी वाइब", "बघेली वाइब", "रेडियो आदि शक्ति", 
    "बुंदेली वाइब", "रेडियो गणपति"
  ];

  return (
    <div ref={containerRef} className="relative bg-[#C4B5FD] min-h-screen overflow-hidden selection:bg-black selection:text-[#E5FF00] font-sans">
      {/* Light Pastel Background with Flat Vector Watermarks */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Massive Flat Om */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] text-[60vw] leading-none text-black/[0.03] font-black select-none"
        >
          ॐ
        </motion.div>
        {/* Massive Flat Swastika */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] text-[50vw] leading-none text-white/[0.15] font-black select-none"
        >
          卐
        </motion.div>
        {/* Subtle noise for texture */}
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/textures/noise.png')] mix-blend-overlay" />
      </div>

      <Header />
      
      {!splashComplete && <CinematicSplash onComplete={() => {
        setSplashComplete(true);
        sessionStorage.setItem("future_radio_splash_shown", "true");
      }} />}

      <main className={`min-h-screen text-black flex flex-col pt-20 pb-24 transition-opacity duration-1000 relative z-10 ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* NEO-BRUTALIST HERO SECTION */}
        <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-16 flex flex-col items-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="inline-block bg-[#E5FF00] border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 transform -rotate-2"
          >
            <span className="font-bold text-black uppercase tracking-widest text-sm md:text-base">100% Autonomous Streaming</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="text-6xl md:text-8xl lg:text-[140px] font-khand font-black text-black leading-[1.1] md:leading-[0.9] tracking-tighter uppercase drop-shadow-sm mb-6 max-w-[95vw]">
              भारत का <br className="hidden md:block"/> पहला ऑडियो <br className="hidden md:block"/> नेटवर्क
            </h1>
            
            <p className="text-xl md:text-3xl font-bold text-black/80 max-w-3xl font-sans mt-4 leading-snug tracking-tight bg-white/40 px-6 py-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              अपनी माटी, अपनी भक्ति। <br className="md:hidden"/> सीधे आपके डिवाइस पर।
            </p>
          </motion.div>

          {/* VIBE CARDS (Neo-Brutalist) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl mt-24">
            
            {/* Devotional Card */}
            <motion.div
              whileHover={{ y: -5, x: -5, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ y: 0, x: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
              className="group bg-[#FFA500] border-4 border-black rounded-[2rem] p-8 md:p-10 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between relative overflow-hidden"
              onClick={() => handlePlayCard("radio", "devotional")}
            >
              {/* Background graphic inside card */}
              <div className="absolute -right-10 -bottom-10 text-[200px] text-black/10 font-black leading-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                ॐ
              </div>

              <div className="relative z-10 text-left">
                <div className="bg-white border-2 border-black text-black font-black uppercase tracking-widest text-xs px-4 py-1.5 rounded-full inline-block mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  अलौकिक भक्ति
                </div>
                <h2 className="text-4xl md:text-6xl font-black font-rozha text-black mb-4 leading-tight">डिवोशनल <br/> वाइब</h2>
                <p className="text-black/80 font-bold text-base md:text-lg leading-snug max-w-[90%]">
                  महाकाल की भस्म आरती से लेकर राघव के मधुर भजनों तक।
                </p>
              </div>
              
              <div className="mt-12 flex items-center justify-between pt-6 border-t-4 border-black/20 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center group-hover:bg-white border-4 border-transparent group-hover:border-black transition-colors">
                    <Play className="w-6 h-6 text-[#FFA500] group-hover:text-black ml-1" fill="currentColor" />
                  </div>
                  <span className="font-black text-black tracking-widest uppercase text-lg">अभी सुनें</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-black text-black uppercase tracking-widest mb-1">Live Now</span>
                   <div className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     {Math.floor(listeners * 0.7).toLocaleString()}
                   </div>
                </div>
              </div>
            </motion.div>

            {/* Regional Card */}
            <motion.div
              whileHover={{ y: -5, x: -5, boxShadow: "12px 12px 0px 0px rgba(0,0,0,1)" }}
              whileTap={{ y: 0, x: 0, boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)" }}
              className="group bg-[#00E5FF] border-4 border-black rounded-[2rem] p-8 md:p-10 cursor-pointer shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between relative overflow-hidden"
              onClick={() => handlePlayCard("radio", "regional")}
            >
              {/* Background graphic inside card */}
              <div className="absolute -right-10 -bottom-10 text-[240px] text-black/10 font-black font-serif leading-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                R
              </div>

              <div className="relative z-10 text-left">
                <div className="bg-white border-2 border-black text-black font-black uppercase tracking-widest text-xs px-4 py-1.5 rounded-full inline-block mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  अपनी माटी
                </div>
                <h2 className="text-4xl md:text-6xl font-black font-rozha text-black mb-4 leading-tight">रीज़नल <br/> वाइब</h2>
                <p className="text-black/80 font-bold text-base md:text-lg leading-snug max-w-[90%]">
                  भोजपुरी की मिठास, बघेली की ठाठ, और अवधी का रस। लोकल हिट्स।
                </p>
              </div>
              
              <div className="mt-12 flex items-center justify-between pt-6 border-t-4 border-black/20 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center group-hover:bg-white border-4 border-transparent group-hover:border-black transition-colors">
                    <Play className="w-6 h-6 text-[#00E5FF] group-hover:text-black ml-1" fill="currentColor" />
                  </div>
                  <span className="font-black text-black tracking-widest uppercase text-lg">अभी सुनें</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-black text-black uppercase tracking-widest mb-1">Live Now</span>
                   <div className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     {Math.floor(listeners * 0.3).toLocaleString()}
                   </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* NEO-BRUTALIST FEATURES SECTION (English) */}
        <div className="w-full max-w-7xl mx-auto px-6 py-20 mt-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black font-khand text-black mb-4 uppercase">Why We Hit Different</h2>
            <p className="text-xl font-bold text-black/70">Not just a stream, but a cultural movement.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FF69B4] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Radio className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">24/7 Autonomous Streaming</h3>
              <p className="text-black/80 font-bold leading-snug">Powered by our AI Master Clock. Endless, buffering-free streaming.</p>
            </div>

            <div className="bg-[#E5FF00] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Heart className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">Pure & Sacred Content</h3>
              <p className="text-black/80 font-bold leading-snug">Our Devotional network feels like a temple. A completely pure and serene experience.</p>
            </div>

            <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-16 h-16 bg-[#00E5FF] border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-4">Voice of Creators</h3>
              <p className="text-black/80 font-bold leading-snug">A global stage for India's independent artists and folk singers. Their voice, straight to you.</p>
            </div>
          </div>
        </div>

        {/* MASSIVE NEO-BRUTALIST SCROLLER */}
        <div className="w-full bg-black border-y-[6px] border-black mt-auto py-2 overflow-hidden relative z-20">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-10 font-khand font-black text-xl md:text-3xl uppercase text-white"
          >
            {[...stations, ...stations, ...stations, ...stations].map((station, i) => (
              <div key={i} className="flex items-center gap-12">
                <span className="hover:text-[#E5FF00] transition-colors cursor-default drop-shadow-[2px_2px_0px_rgba(255,255,255,0.3)]">
                  {station}
                </span>
                <span className="text-[#E5FF00]">✦</span>
              </div>
            ))}
          </motion.div>
        </div>

      </main>
    </div>
  );
}
