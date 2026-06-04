"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Radio, Mic, Play, Pause, Activity, Users, ShieldAlert, BadgeCheck, Copy } from "lucide-react";
import { useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { useRouter } from "next/navigation";

export default function BagheliCampaignPage() {
  const router = useRouter();
  const { setCityId } = useCityStore();
  const { setIsPlaying } = useAudioStore();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const handleTuneIn = () => {
    unlockAudio();
    setCityId("bagheli", "Future Radio - Bagheli");
    setIsPlaying(true);
    router.push("/radio");
  };

  const toggleAnthem = () => {
    if (audioRef.current) {
      if (isPlayingAnthem) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAnthem(!isPlayingAnthem);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
      setProgress(percent * 100);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://thefutureradio.com/bagheli");
    alert("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#0A0805] text-[#FDF6E3] font-sans selection:bg-[#FF6B1A] selection:text-white relative overflow-x-hidden">
      
      {/* Dynamic Noise Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
      ></div>

      {/* Floating Header */}
      <header className="fixed top-0 w-full z-40 bg-gradient-to-b from-[#0A0805] to-transparent pt-6 pb-12 px-6 flex justify-between items-start pointer-events-none">
        <div className="h-8 md:h-10">
           <img src="/icons/logo-horizontal-light.png" alt="Future Radio" className="h-full w-auto object-contain" />
        </div>
        <button 
          onClick={handleTuneIn}
          className="pointer-events-auto flex items-center gap-2 bg-[#C0392B] hover:bg-[#FF6B1A] text-white px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_20px_rgba(192,57,43,0.4)] border border-white/10"
        >
          <Radio className="w-4 h-4" />
          Listen Live
        </button>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center p-6 text-center pt-24 overflow-hidden">
        {/* Animated Cinematic Background Gradients */}
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{ y }}
        >
          <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] bg-[radial-gradient(ellipse_at_center,rgba(192,57,43,0.5)_0%,transparent_60%)] blur-3xl"></div>
          <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vh] bg-[radial-gradient(ellipse_at_center,rgba(240,165,0,0.15)_0%,transparent_60%)] blur-3xl"></div>
        </motion.div>

        {/* Floating Embers */}
        {isMounted && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#FF6B1A]"
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 100,
                  opacity: 0
                }}
                animate={{ 
                  y: -100,
                  x: `calc(${Math.random() * 100}vw - 50vw)`,
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.5, 0.5]
                }}
                transition={{ 
                  duration: 5 + Math.random() * 5, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative z-10 border border-[#F0A500]/30 bg-[#F0A500]/10 text-[#F0A500] px-4 py-1.5 rounded-sm font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-10"
        >
          Future Radio · Rewa Launch · Vindhya Movement
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative z-10 font-black text-6xl md:text-8xl lg:text-[10rem] leading-[0.95] tracking-tight mb-4"
        >
          विंध्य<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B1A] via-[#F0A500] to-[#FF6B1A] drop-shadow-[0_0_30px_rgba(255,107,26,0.3)] animate-pulse">
            जागेगा।
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 text-xl md:text-3xl text-white/70 mt-6 leading-relaxed max-w-2xl font-medium"
        >
          ज़हर से नहीं, आवाज़ से लड़ेंगे।<br />
          रीवा से शुरुआत, विंध्य की आवाज़।
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8B7355] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#FF6B1A] to-transparent animate-pulse"></div>
        </motion.div>
      </section>

      {/* ── NUMBERS STRIP ── */}
      <section className="bg-[#FF6B1A] text-[#0A0805] py-8 px-6 border-y-4 border-[#0A0805]">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-between gap-8 md:gap-4 text-center">
          {[
            { val: "29 Cr+", label: "Vernacular Listeners" },
            { val: "10+", label: "Live Dialects" },
            { val: "₹0", label: "License Cost" },
            { val: "24/7", label: "Autonomous Engine" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 min-w-[140px]"
            >
              <div className="font-baloo font-black text-4xl md:text-5xl">{stat.val}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest mt-1 opacity-80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="font-mono text-xs tracking-[0.3em] text-[#FF6B1A] uppercase mb-4">The Problem · रीवा की सच्चाई</div>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
            एक ज़हर जो<br />खामोशी से मारता है।
          </h2>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed mb-16">
            रीवा, सतना, सीधी और विंध्य के हर जिले में Corex और नशे की लत एक चुप्पी में फैल रही है। युवा बर्बाद हो रहे हैं — परिवार टूट रहे हैं — और कोई आवाज़ नहीं उठा रहा। Future Radio ने यह ठान लिया है — यह चुप्पी तोड़नी है।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white/5 p-px rounded-2xl overflow-hidden">
            {[
              { num: "30%+", desc: "विंध्य के युवाओं में नशे की लत — सरकारी सर्वेक्षण", icon: Activity },
              { num: "Zero", desc: "बाघेली में कोई dedicated digital radio channel नहीं था — अब तक", icon: ShieldAlert },
              { num: "1 Cr+", desc: "सिर्फ रीवा division में potential listeners जिनकी आवाज़ कोई नहीं सुनता", icon: Users }
            ].map((card, i) => (
              <div key={i} className="bg-[#0A0805] p-8 hover:bg-white/[0.02] transition-colors relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B1A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <card.icon className="w-8 h-8 text-[#C0392B] mb-6" />
                <div className="font-baloo text-5xl font-black text-white mb-3">{card.num}</div>
                <div className="text-sm text-white/50 leading-relaxed font-medium">{card.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── THE ANTHEM ── */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,57,43,0.15)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] border border-[#FF6B1A]/20 p-8 md:p-12 rounded-3xl backdrop-blur-md relative overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B1A] via-[#F0A500] to-[#C0392B]"></div>

            <div className="font-mono text-[10px] tracking-[0.3em] text-[#FF6B1A] uppercase mb-6 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B1A] animate-pulse"></span>
              Official Anti-Corex Anthem
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-white mb-4">तैं सुन नौजवान!</h3>
            <div className="pl-6 border-l-4 border-[#F0A500] text-[#F0A500] text-lg italic mb-10 leading-relaxed">
              &quot;तैं सुन नौजवान!<br />
              छोड़ दे य जहर, बचाइले आपन जान।&quot;
            </div>

            {/* Custom Player UI */}
            <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
              <audio 
                ref={audioRef} 
                src="/audio/originals/tain_sun_1.mp3"
                onTimeUpdate={handleTimeUpdate} 
                onEnded={() => { setIsPlayingAnthem(false); setProgress(0); }}
              />
              <div className="flex items-center gap-6 mb-6">
                <button 
                  onClick={toggleAnthem}
                  className="w-16 h-16 rounded-full bg-[#FF6B1A] hover:bg-[#F0A500] text-[#0A0805] flex items-center justify-center transition-all hover:scale-105 shrink-0 shadow-[0_0_20px_rgba(255,107,26,0.3)]"
                >
                  {isPlayingAnthem ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                </button>
                <div>
                  <div className="font-bold text-lg text-white">Bagheli Rap Anthem</div>
                  <div className="text-sm text-white/50">Future Radio · Vindhya Movement · 2025</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div 
                  className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={handleSeek}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF6B1A] to-[#F0A500] transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={handleTuneIn} className="flex-1 min-w-[200px] bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Radio className="w-4 h-4" /> Listen on Future Radio
              </button>
              <button onClick={copyLink} className="bg-white/10 text-white hover:bg-white/20 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="font-mono text-xs tracking-[0.3em] text-[#8B7355] uppercase text-center mb-4">Real Stories · असली आवाज़ें</div>
        <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16">जिन्होंने जीत हासिल की।</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "दो साल तक Corex पीता रहा। घर बर्बाद हो गया था। आज साफ हूँ — और अपनी कहानी सबको बताना चाहता हूँ।", author: "राहुल", location: "रीवा शहर · 23 वर्ष" },
            { quote: "मेरे बेटे को नशे से निकाला। कोई सुनने वाला नहीं था। Future Radio जैसा platform होता तो शायद पहले ही रुक जाते।", author: "सुनीता देवी", location: "सतना · 46 वर्ष" },
            { quote: "गाँव में बच्चे बर्बाद हो रहे हैं। बाघेली में कोई नहीं बोलता था इस बारे में। अब Future Radio बोलेगा।", author: "कमलेश पटेल", location: "सीधी · 35 वर्ष" }
          ].map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl hover:border-[#FF6B1A]/30 transition-colors relative"
            >
              <div className="absolute -top-4 right-6 text-6xl text-white/5 font-serif leading-none">&quot;</div>
              <p className="text-lg text-white/80 leading-relaxed mb-8 relative z-10">{t.quote}</p>
              <div>
                <div className="font-bold text-[#FF6B1A] uppercase tracking-wider text-sm">{t.author}</div>
                <div className="text-xs text-white/40 mt-1">{t.location}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CREATOR CTA ── */}
      <section className="py-32 px-6 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1C1208] to-black border border-white/10 rounded-3xl p-10 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B1A]/10 blur-[100px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 md:w-2/3">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              तुम्हारी आवाज़ को<br />विंध्य सुनेगा।
            </h2>
            <p className="text-xl text-white/60 mb-10 leading-relaxed">
              Future Radio पर अपनी कहानी, अपना संगीत, अपनी आवाज़ दो। हम उसे 29 करोड़ लोगों तक पहुँचाएंगे। और हर spin पर — तुम्हें पैसा मिलेगा।
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/creators/apply" className="bg-[#FF6B1A] hover:bg-[#F0A500] text-black font-bold uppercase tracking-wider px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105">
                <Mic className="w-5 h-5" /> Become a Creator
              </Link>
              <Link href="/radio" onClick={(e) => { e.preventDefault(); handleTuneIn(); }} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold uppercase tracking-wider px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                <Radio className="w-5 h-5" /> Tune in to Bagheli
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── ENDORSEMENTS ── */}
      <section className="py-12 border-y border-white/5 bg-black/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#8B7355] uppercase mb-8">Backed By</div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-3 font-bold text-lg"><BadgeCheck className="text-[#FF6B1A]" /> Deputy CM Office</div>
            <div className="flex items-center gap-3 font-bold text-lg"><BadgeCheck className="text-[#FF6B1A]" /> Rewa Police</div>
            <div className="flex items-center gap-3 font-bold text-lg"><BadgeCheck className="text-[#FF6B1A]" /> SGMH Rewa</div>
            <div className="flex items-center gap-3 font-bold text-lg"><BadgeCheck className="text-[#FF6B1A]" /> NCC / NSS Units</div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 text-center bg-[#0A0805]">
        <div className="font-black text-4xl text-white tracking-tight mb-2">फ्यूचर रेडियो</div>
        <div className="text-white/40 text-sm mb-8">विंध्य की आवाज़ — India&apos;s Vernacular AI Radio Network</div>
        <div className="flex justify-center gap-6 text-sm font-medium text-white/60 mb-12">
          <Link href="/" className="hover:text-white transition-colors">Platform</Link>
          <button onClick={handleTuneIn} className="hover:text-white transition-colors">Bagheli Station</button>
          <Link href="/creators" className="hover:text-white transition-colors">Creators</Link>
        </div>
        <div className="text-xs text-white/20">
          &copy; {new Date().getFullYear()} Future Radio & Media Mafias
        </div>
      </footer>
    </div>
  );
}
