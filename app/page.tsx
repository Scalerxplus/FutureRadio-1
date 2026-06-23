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
import { Play, Sparkles, Radio, Heart, Users, ArrowRight, Flame } from "lucide-react";

export default function EntrySplashPage() {
  const router = useRouter();
  const { setMode, splashComplete, setSplashComplete } = useUiStore();
  const { setRadioSection } = useCityStore();
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
    unlockAudio();
    setIsPlaying(true);
    router.push("/radio");
  };

  const marqueeText = "🔴 लाइव: रेडियो महाकाल • 🔴 लाइव: रेडियो केशव • 🔴 लाइव: रेडियो राघव • 🔴 लाइव: भोजपुरी वाइब • 🔴 लाइव: बघेली वाइब • 🔴 लाइव: रेडियो आदि शक्ति • ";

  return (
    <div ref={containerRef} className="relative bg-[#0A0A0A] overflow-hidden selection:bg-brand-red selection:text-white">
      <Header />
      
      {!splashComplete && <CinematicSplash onComplete={() => {
        setSplashComplete(true);
        sessionStorage.setItem("future_radio_splash_shown", "true");
      }} />}

      <main className={`min-h-screen text-white flex flex-col pt-16 transition-opacity duration-1000 relative ${splashComplete ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Deep Mystical Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#ff3c001a] via-[#ff00000a] to-transparent pointer-events-none" />
        <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/textures/noise.png')] mix-blend-overlay" />
        
        {/* Animated Marquee - LIVE NOW */}
        <div className="w-full bg-brand-red border-y-2 border-white/20 overflow-hidden py-2 mt-4 relative z-20 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap flex font-baloo font-black text-xs md:text-sm tracking-widest uppercase text-white"
          >
            <span>{marqueeText.repeat(10)}</span>
          </motion.div>
        </div>

        {/* Hero Section */}
        <div className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring", bounce: 0.5 }}
            className="mb-8 relative"
          >
            <div className="absolute -inset-4 bg-orange-500/30 blur-2xl rounded-full" />
            <img src="/icons/logo-vertical-dark.png" alt="Future Radio" className="w-[180px] md:w-[240px] h-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] invert" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col items-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/50 bg-orange-500/10 backdrop-blur-md">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] md:text-xs font-bold text-orange-400 tracking-widest uppercase">100% Autonomous Streaming</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-8xl font-baloo font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-100 to-orange-400 leading-[1.1] tracking-tight drop-shadow-lg filter pb-2">
              भारत का पहला
              <br className="hidden md:block"/> रीज़नल और डिवोशनल
              <br className="hidden md:block"/> रेडियो नेटवर्क
            </h1>
            
            <p className="text-lg md:text-2xl font-medium text-gray-300 max-w-2xl font-sans mt-4 drop-shadow-md">
              आपकी भाषा की मिठास और आपकी भक्ति की गहराई। <br className="hidden md:block"/>ईश्वर से जुड़ें और अपनी माटी की महक महसूस करें, 24/7।
            </p>
          </motion.div>

          {/* Action Cards (Devotional & Regional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-16">
            
            {/* Devotional Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-[#FF6B00]/20 to-[#FF0000]/10 border border-orange-500/30 p-8 rounded-3xl overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(255,107,0,0.15)] hover:shadow-[0_0_50px_rgba(255,107,0,0.3)] transition-all duration-300"
              onClick={() => handlePlayCard("radio", "devotional")}
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity group-hover:rotate-12 duration-500 transform">
                <Sparkles className="w-32 h-32 text-orange-400" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">
                    अलौकिक भक्ति
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black font-baloo text-white mb-2">डिवोशनल वाइब</h2>
                  <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed">
                    महाकाल की भस्म आरती से लेकर केशव के मधुर भजनों तक। एक ऐसा दिव्य अनुभव जो सीधा आपके हृदय में उतरे।
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-[#FF6B00] ml-1" fill="currentColor" />
                    </div>
                    <span className="font-bold text-white tracking-widest uppercase">अभी सुनें</span>
                  </div>
                  <div className="flex -space-x-2">
                     <span className="text-xs font-mono text-orange-300 mt-1 mr-2">{Math.floor(listeners * 0.7).toLocaleString()} LIVE</span>
                     <span className="relative flex h-3 w-3 mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Regional Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-[#FF2E2E]/20 to-[#9B59B6]/10 border border-brand-red/30 p-8 rounded-3xl overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(255,46,46,0.15)] hover:shadow-[0_0_50px_rgba(255,46,46,0.3)] transition-all duration-300"
              onClick={() => handlePlayCard("radio", "regional")}
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity group-hover:-rotate-12 duration-500 transform">
                <Music className="w-32 h-32 text-brand-red" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4">
                    अपनी माटी
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black font-baloo text-white mb-2">रीज़नल वाइब</h2>
                  <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed">
                    भोजपुरी की मिठास, बघेली की ठाठ, और अवधी का रस। आपकी अपनी भाषा में लोकल हिट्स और शोज़।
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-brand-red ml-1" fill="currentColor" />
                    </div>
                    <span className="font-bold text-white tracking-widest uppercase">अभी सुनें</span>
                  </div>
                  <div className="flex -space-x-2">
                     <span className="text-xs font-mono text-brand-red/80 mt-1 mr-2">{Math.floor(listeners * 0.3).toLocaleString()} LIVE</span>
                     <span className="relative flex h-3 w-3 mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                     </span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Features / Value Prop Grid */}
        <div className="w-full max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-baloo font-black text-white mb-4">हम क्या लेकर आए हैं?</h2>
            <p className="text-gray-400">एक ऐसा प्लेटफॉर्म जो आपको आपकी जड़ों से जोड़े।</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:border-orange-500/50 transition-colors">
              <Radio className="w-10 h-10 text-orange-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">24/7 असीमित प्रसारण</h3>
              <p className="text-gray-400 text-sm leading-relaxed">आर्टिफिशियल इंटेलिजेंस की शक्ति से चलने वाला हमारा मास्टर क्लॉक सुनिश्चित करता है कि रेडियो कभी रुके नहीं। बिना बफरिंग के लगातार स्ट्रीमिंग।</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.1 }} className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:border-brand-red/50 transition-colors">
              <Heart className="w-10 h-10 text-brand-red mb-4" />
              <h3 className="text-xl font-bold mb-2">शुद्ध और पवित्र सामग्री</h3>
              <p className="text-gray-400 text-sm leading-relaxed">हमारा डिवोशनल नेटवर्क खास तौर पर इस तरह डिज़ाइन किया गया है कि आपको मंदिर जैसा एहसास हो। विज्ञापन मुक्त भक्ति का अनुभव।</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: 0.2 }} className="bg-[#111] border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
              <Users className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">क्रिएटर्स की आवाज़</h3>
              <p className="text-gray-400 text-sm leading-relaxed">हम केवल ब्रॉडकास्ट नहीं करते, हम टैलेंट को मंच देते हैं। भारत के इंडिपेंडेंट आर्टिस्ट्स और RJ's की आवाज़ सीधे आप तक।</p>
            </motion.div>
          </div>
        </div>

        {/* Creator CTA Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="w-full bg-gradient-to-r from-brand-dark via-black to-[#1A1E2E] border-y border-white/10 py-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/textures/dots.png')] bg-repeat opacity-10 mix-blend-screen" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black font-baloo text-white mb-6">क्या आप एक आर्टिस्ट या RJ हैं?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Future Radio आपको अपनी आवाज़ लाखों लोगों तक पहुँचाने का मौका देता है। अपनी संस्कृति, अपनी बोली और अपनी भक्ति को दुनिया के सामने लाएं।
            </p>
            <Link href="/creators" className="inline-flex items-center gap-3 bg-white text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              क्रिएटर बनें <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="w-full bg-black border-t border-white/10 text-center py-12 px-6 flex flex-col gap-6">
          <div className="flex items-center justify-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 flex-wrap">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <Link href="/creators" className="hover:text-white transition-colors">Creators</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
            <Link href="/partner" className="hover:text-white transition-colors">Partner</Link>
          </div>

          <p className="text-xs text-gray-500 font-sans max-w-2xl mx-auto mt-2">
            Future Radio is Digital India&apos;s premier creator-sourced radio network. Empowering independent creators by streaming their regional music, talk shows, and devotional content to millions.
          </p>
          <div className="text-[10px] text-gray-600 font-mono font-bold tracking-widest uppercase mt-4">
            &copy; {new Date().getFullYear()} FUTURE RADIO & MEDIA MAFIAS
          </div>
        </footer>

        <VibeSelectorSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} />

      </main>
    </div>
  );
}
