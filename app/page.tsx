"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useUiStore, useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import CinematicSplash from "@/components/ui/CinematicSplash";
import VibeSelectorSheet from "@/components/ui/VibeSelectorSheet";
import { Header } from "@/components/layout/Header";
import { Play, Sparkles, Radio, Heart, Users, ArrowRight, Flame, Music } from "lucide-react";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { setRadioSection, setCityId } = useCityStore();
  const { isPlaying, setIsPlaying } = useAudioStore();
  const [mounted, setMounted] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [listeners, setListeners] = useState(10438);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

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
    
    // Instantly set cityId to pre-fetch schedule and buffer audio in the background before the page transition completes.
    const defaultId = section === "devotional" ? "shiva" : "bhojpuri";
    const defaultName = section === "devotional" ? "Radio Mahakaal" : "Bhojpuri Vibe";
    setCityId(defaultId, `Future Radio - ${defaultName}`);
    
    unlockAudio();
    setIsPlaying(true);
    router.push("/radio");
  };

  const marqueeText = "✨ लाइव: रेडियो महाकाल • ✨ लाइव: केशव वाइब • ✨ लाइव: राघव वाइब • ✨ लाइव: भोजपुरी वाइब • ✨ लाइव: बघेली वाइब • ✨ लाइव: रेडियो आदि शक्ति • ";

  return (
    <div ref={containerRef} className="relative bg-[#050505] overflow-hidden selection:bg-[#FFD700] selection:text-black">
      <Header />
      
      {!splashComplete && <CinematicSplash onComplete={() => {
        setSplashComplete(true);
        sessionStorage.setItem("future_radio_splash_shown", "true");
      }} />}

      <main className={`min-h-screen text-white flex flex-col pt-16 transition-opacity duration-1000 relative ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Grand Mystical Background Elements */}
        {/* Deep Golden/Saffron Glowing Orb at the top */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,140,0,0.15)_0%,rgba(255,50,0,0.05)_40%,transparent_70%)] blur-[80px] pointer-events-none" />
        
        {/* Subtle Mandala SVG Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEwMCAwaDF2MTBoLTF6bTAgMTkwSDF2MTBoLTF6bS05MC05MHYxaDEwdi0xem0xOTAgMEgxOXYxaDEwdi0xeiIvPjwvc3ZnPg==')] mix-blend-screen" />
        <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('/textures/noise.png')] mix-blend-overlay" />
        
        {/* Animated Marquee - Premium Gold */}
        <div className="w-full bg-gradient-to-r from-[#8B6508] via-[#FFD700] to-[#8B6508] border-y border-[#FFF8DC]/30 overflow-hidden py-3 mt-4 relative z-20 shadow-[0_0_20px_rgba(255,215,0,0.2)]">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap flex font-baloo font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase text-black"
          >
            <span>{marqueeText.repeat(10)}</span>
          </motion.div>
        </div>

        {/* Hero Section */}
        <div className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
            className="mb-10 relative"
          >
            <div className="absolute -inset-8 bg-gradient-to-r from-[#FF8C00]/20 to-[#FFD700]/20 blur-3xl rounded-full" />
            <img src="/icons/logo-vertical-dark.png" alt="Future Radio" className="w-[160px] md:w-[220px] h-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] invert" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-[10px] md:text-[11px] font-bold text-[#FFD700] tracking-[0.3em] uppercase">100% Autonomous Streaming</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-baloo font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8DC] via-[#FFE4B5] to-[#DAA520] leading-[1.4] tracking-tight drop-shadow-2xl pb-4 px-4">
              भारत का पहला
              <br className="hidden md:block"/> रीज़नल और डिवोशनल ऑडियो नेटवर्क
            </h1>
            
            <p className="text-base md:text-xl font-medium text-white/70 max-w-2xl font-sans mt-2 drop-shadow-md tracking-wide leading-relaxed">
              आपकी भाषा की मिठास और आपकी भक्ति की गहराई। <br className="hidden md:block"/>ईश्वर से जुड़ें और अपनी माटी की महक महसूस करें, 24/7।
            </p>
          </motion.div>

          {/* Action Cards (Premium Glassmorphism) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-20">
            
            {/* Devotional Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative bg-black/50 backdrop-blur-3xl border border-[#FFD700]/20 p-1 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(255,140,0,0.15)] transition-all duration-500"
              onClick={() => handlePlayCard("radio", "devotional")}
            >
              {/* Inner Glow & Gradient Border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00]/30 via-[#800080]/20 to-[#FF0000]/30 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="absolute inset-0 border-[2px] border-transparent bg-clip-border rounded-[2.5rem] [background:linear-gradient(to_bottom_right,rgba(255,215,0,0.5),rgba(255,255,255,0.1),rgba(128,0,128,0.3))_border-box] pointer-events-none mask-border" />
              
              <div className="relative z-10 h-full bg-[#110A00]/60 rounded-[2.2rem] p-8 md:p-10 flex flex-col justify-between backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-all group-hover:rotate-12 group-hover:scale-110 duration-700 transform">
                  <Flame className="w-40 h-40 text-[#FFD700]" />
                </div>
                
                <div>
                  <div className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block mb-6 shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                    अलौकिक भक्ति
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black font-baloo text-transparent bg-clip-text bg-gradient-to-b from-white to-[#FFE4B5] mb-4 leading-[1.4] pb-2 drop-shadow-md">डिवोशनल वाइब</h2>
                  <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed max-w-[85%]">
                    महाकाल की भस्म आरती से लेकर राघव के मधुर भजनों तक। एक ऐसा दिव्य अनुभव जो सीधा आपके हृदय में उतरे।
                  </p>
                </div>
                
                <div className="mt-12 flex items-center justify-between border-t border-[#FFD700]/20 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FFD700] to-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.4)] group-hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-shadow">
                      <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                    </div>
                    <span className="font-black text-[#FFD700] tracking-[0.2em] uppercase text-sm">अभी सुनें</span>
                  </div>
                  <div className="flex -space-x-2 items-center">
                     <span className="text-[10px] font-mono text-[#FFDAB9]/80 mt-1 mr-3 tracking-widest">{Math.floor(listeners * 0.7).toLocaleString()} LIVE</span>
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF8C00]"></span>
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Regional Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="group relative bg-black/50 backdrop-blur-3xl border border-white/20 p-1 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,229,255,0.1)] transition-all duration-500"
              onClick={() => handlePlayCard("radio", "regional")}
            >
              {/* Colorful vibrant mesh gradient inside border */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0055]/30 via-[#7000FF]/25 to-[#00E5FF]/30 opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute inset-0 border-[2px] border-transparent bg-clip-border rounded-[2.5rem] [background:linear-gradient(to_bottom_right,rgba(255,0,85,0.5),rgba(255,255,255,0.1),rgba(0,229,255,0.4))_border-box] pointer-events-none mask-border" />
              
              <div className="relative z-10 h-full bg-[#050011]/60 rounded-[2.2rem] p-8 md:p-10 flex flex-col justify-between backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-all group-hover:-rotate-12 group-hover:scale-110 duration-700 transform">
                  <Music className="w-40 h-40 text-[#00E5FF]" />
                </div>
                
                <div>
                  <div className="bg-gradient-to-r from-[#FF0055] to-[#7000FF] text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block mb-6 shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                    अपनी माटी
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black font-baloo text-transparent bg-clip-text bg-gradient-to-b from-white to-[#E0B0FF] mb-4 leading-[1.4] pb-2 drop-shadow-md">रीज़नल वाइब</h2>
                  <p className="text-white/70 font-medium text-sm md:text-base leading-relaxed max-w-[85%]">
                    भोजपुरी की मिठास, बघेली की ठाठ, और अवधी का रस। आपकी अपनी भाषा में लोकल हिट्स और शोज़।
                  </p>
                </div>
                
                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FF0055] to-[#00E5FF] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,85,0.4)] group-hover:shadow-[0_0_40px_rgba(0,229,255,0.6)] transition-shadow">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                    <span className="font-black text-[#00E5FF] tracking-[0.2em] uppercase text-sm">अभी सुनें</span>
                  </div>
                  <div className="flex -space-x-2 items-center">
                     <span className="text-[10px] font-mono text-white/60 mt-1 mr-3 tracking-widest">{Math.floor(listeners * 0.3).toLocaleString()} LIVE</span>
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF0055]"></span>
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Features / Value Prop Grid (Elevated) */}
        <div className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFD700]/5 to-transparent pointer-events-none" />
          
          <div className="text-center mb-20 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-wide uppercase">Why We Hit Different</h2>
            <p className="text-white/50 tracking-widest uppercase text-sm">Not just a stream. A cultural movement.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-black/60 backdrop-blur-2xl border border-[#FFD700]/20 p-10 rounded-[2rem] hover:border-[#FFD700]/50 transition-all duration-500 hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center mb-6 group-hover:bg-[#FFD700]/20 transition-colors">
                <Radio className="w-8 h-8 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-wide text-white">24/7 असीमित प्रसारण</h3>
              <p className="text-white/50 text-sm leading-relaxed">आर्टिफिशियल इंटेलिजेंस की शक्ति से चलने वाला हमारा मास्टर क्लॉक सुनिश्चित करता है कि रेडियो कभी रुके नहीं। बिना बफरिंग के लगातार स्ट्रीमिंग।</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.1 }} className="bg-black/60 backdrop-blur-2xl border border-[#FF4500]/20 p-10 rounded-[2rem] hover:border-[#FF4500]/50 transition-all duration-500 hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 rounded-2xl bg-[#FF4500]/10 flex items-center justify-center mb-6 group-hover:bg-[#FF4500]/20 transition-colors">
                <Heart className="w-8 h-8 text-[#FF4500]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-wide text-white">शुद्ध और पवित्र सामग्री</h3>
              <p className="text-white/50 text-sm leading-relaxed">हमारा डिवोशनल नेटवर्क खास तौर पर इस तरह डिज़ाइन किया गया है कि आपको मंदिर जैसा एहसास हो। विज्ञापन मुक्त भक्ति का अनुभव।</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.2 }} className="bg-black/60 backdrop-blur-2xl border border-[#00E5FF]/20 p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all duration-500 hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 flex items-center justify-center mb-6 group-hover:bg-[#00E5FF]/20 transition-colors">
                <Users className="w-8 h-8 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-wide text-white">क्रिएटर्स की आवाज़</h3>
              <p className="text-white/50 text-sm leading-relaxed">हम केवल ब्रॉडकास्ट नहीं करते, हम टैलेंट को मंच देते हैं। भारत के इंडिपेंडेंट आर्टिस्ट्स और लोक गायकों की आवाज़ सीधे आप तक।</p>
            </motion.div>
          </div>
        </div>

        {/* Creator CTA Section (Grand) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full bg-gradient-to-r from-[#1A0D00] via-[#331A00] to-[#1A0D00] border-y border-[#FFD700]/20 py-24 relative overflow-hidden mt-10"
        >
          <div className="absolute inset-0 bg-[url('/textures/dots.png')] bg-repeat opacity-[0.05] mix-blend-screen" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD700]/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black font-baloo text-transparent bg-clip-text bg-gradient-to-b from-white to-[#FFD700] mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">क्या आप एक इंडिपेंडेंट आर्टिस्ट हैं?</h2>
            <p className="text-lg text-[#FFF8DC]/70 mb-10 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide">
              Future Radio आपको अपनी आवाज़ लाखों लोगों तक पहुँचाने का मौका देता है। अपनी संस्कृति, अपनी बोली और अपनी भक्ति को दुनिया के सामने लाएं।
            </p>
            <Link href="/creators" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-black uppercase tracking-[0.2em] px-10 py-5 rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,140,0,0.4)]">
              क्रिएटर बनें <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

      </main>
      
      <VibeSelectorSheet 
        isOpen={isBottomSheetOpen} 
        onClose={() => setIsBottomSheetOpen(false)} 
      />
    </div>
  );
}
