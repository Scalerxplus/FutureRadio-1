"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Radio, Play, Pause, Newspaper, Tractor, CloudSun, Briefcase, Landmark, Tv } from "lucide-react";
import { useCityStore } from "@/lib/store";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";

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

  return (
    <div className="min-h-screen bg-[#F1F0EA] text-black font-sans selection:bg-[#E5FF00] selection:text-black overflow-x-hidden pt-24 pb-24">
      <Header />
      
      {/* ── SEO HIDDEN CONTENT ── */}
      <div className="sr-only">
        <h2>The #1 Local Radio Station for Vindhya and Awadh</h2>
        <p>
          Welcome to Future Radio Bagheli, your ultimate destination for authentic regional audio. We are the premier 
          <strong>Rewa radio station</strong> and <strong>Satna radio station</strong>, bringing you closer to your roots. 
          Whether you are searching for a <strong>Maihar Radio Station</strong>, <strong>Shahdol Radio Station</strong>, 
          <strong>Sidhi Radio Station</strong>, or <strong>Umaria Radio Station</strong>, our 24/7 broadcast covers the entire Vindhya region.
        </p>
        <p>
          Immerse yourself in our massive collection of <strong>Bagheli Lokgeet</strong> and <strong>Bagheli Gaane</strong>. 
          We feature traditional classics like <strong>Sohar</strong>, <strong>Dadar Song</strong>, and <strong>Kajari Folk Song Sawan Geet</strong>. 
          Celebrate the monsoon with authentic <strong>Kajri</strong> and <strong>Hinduli lokgeet</strong>. Our library perfectly captures the essence of 
          <strong>Rewa Satna ka logeet</strong> and <strong>Awadhi Lokgeet</strong>.
        </p>
        <p>
          Looking for something fresh? Tune in for <strong>Modern Lokgeet</strong> and the latest <strong>Naye Bagheli Gaane</strong>. 
          Future Radio is redefining the local listening experience, acting as the definitive <strong>Radio in Rewa</strong>, 
          <strong>Radio in Satna</strong>, <strong>Radio in Sidhi</strong>, and <strong>Radio in Shahdol</strong>. We even reach audiences looking for 
          <strong>Radio in Prayagraj</strong> and <strong>Radio in Mirzapur</strong>, connecting the entire Hindi and regional belt through 
          autonomous, AI-powered broadcasting.
        </p>
      </div>
      
      {/* ── HERO SECTION ── */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-16 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-left">
          <div className="inline-block border-2 border-black bg-[#E5FF00] font-black uppercase text-xs px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            Future Radio · Vindhya Movement
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-khand font-black leading-[0.9] tracking-tighter uppercase drop-shadow-sm mb-6">
            आपन <span className="text-[#FF6B1A]">बघेली</span>,<br />
            आपन <span className="text-[#00E5FF]">रेडियो</span>।
          </h1>
          <p className="text-xl md:text-2xl font-bold text-black/80 font-sans max-w-xl mb-8 leading-snug">
            Bagheli audio that sounds like home. विंध्य की ताज़ा खबरें, खेती की बातें, और ठेठ बघेली लोकगीत - अब सीधे आपके कानों तक, चौबीसों घंटे।
          </p>
          <button 
            onClick={handleTuneIn}
            className="group relative inline-flex items-center gap-3 bg-[#FF69B4] border-4 border-black px-8 py-4 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
          >
            <Radio className="w-6 h-6 animate-pulse" />
            Listen Live Now
          </button>
        </div>
        
        {/* Visual Graphic Element */}
        <div className="flex-1 flex justify-center items-center w-full relative">
            <div className="absolute inset-0 bg-[#E5FF00] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] transform rotate-3"></div>
            <div className="absolute inset-0 bg-[#00E5FF] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-[3rem] transform -rotate-3 mix-blend-multiply opacity-50"></div>
            <div className="relative z-10 w-full h-[400px] border-4 border-black bg-[url('/assets/stations/bagheli_artwork.png')] bg-cover bg-center rounded-[3rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                    <div className="font-khand font-black text-3xl uppercase leading-none">Bagheli Vibe</div>
                    <div className="font-mono text-xs font-bold mt-1">LIVE · 2.1k Listeners</div>
                </div>
            </div>
        </div>
      </section>

      {/* ── HYPER-LOCAL SEGMENTS (Grid) ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl md:text-6xl font-khand font-black text-center mb-16 uppercase">गाँव की बात, गाँव के साथ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "बघेली समाचार", desc: "रीवा, सतना, सीधी, सिंगरौली की हर ताज़ा खबर, ठेठ बघेली अंदाज़ में।", icon: Newspaper, color: "#E5FF00" },
            { title: "खेती किसानी", desc: "फसल बुवाई से कटाई तक, मौसम की सटीक जानकारी और कृषि विशेषज्ञों की राय।", icon: Tractor, color: "#FF69B4" },
            { title: "मंडी भाव", desc: "रोजाना ताज़ा मंडी भाव सीधे आपके कानों तक, सही कीमत सही समय पर।", icon: CloudSun, color: "#00E5FF" },
            { title: "ग्रामीण एंटरप्रेन्योरशिप", desc: "गाँव में व्यापार कैसे बढ़ाएं? सफल लोगों की कहानियाँ और मार्गदर्शन।", icon: Briefcase, color: "#FF6B1A" },
            { title: "सरकारी योजनाएं", desc: "किसान सम्मान निधि, लाड़ली बहना और अन्य योजनाओं की पूरी जानकारी।", icon: Landmark, color: "#CCCCFF" },
            { title: "ठेठ लोकगीत", desc: "फाग, सोहर, और बघेली लोक संगीत का अनवरत प्रवाह 24/7।", icon: Radio, color: "#E5FF00" },
          ].map((item, i) => (
            <div key={i} className={`border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col h-full bg-[${item.color}]`} style={{ backgroundColor: item.color }}>
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="font-khand font-black text-3xl mb-3">{item.title}</h3>
              <p className="font-bold text-black/80 font-sans text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CREATORS/YOUTUBERS SPOTLIGHT ── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
         <div className="bg-[#00E5FF] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="flex-1">
                    <div className="inline-block border-2 border-black bg-white font-black uppercase text-xs px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4 transform -rotate-3">
                        Local Creators
                    </div>
                    <h2 className="text-4xl md:text-6xl font-khand font-black leading-[1] tracking-tighter uppercase mb-6">
                        विंध्य के सुपरस्टार्स <br /> अब रेडियो पर!
                    </h2>
                    <p className="text-xl font-bold font-sans text-black/80 mb-8">
                        अपने पसंदीदा बघेली YouTubers और Creators को अब सीधे Future Radio पर सुनें।
                    </p>
                    <button onClick={handleTuneIn} className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-black border-4 border-black transition-colors">
                        <Tv className="w-5 h-5" />
                        Tune In Now
                    </button>
                </div>
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                     {/* Decorative Creator Elements */}
                     <div className="bg-[#FF6B1A] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-6">
                         <div className="font-khand font-black text-2xl uppercase">Comedy Shows</div>
                     </div>
                     <div className="bg-[#E5FF00] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-3">
                         <div className="font-khand font-black text-2xl uppercase">Folk Tales</div>
                     </div>
                     <div className="bg-[#FF69B4] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
                         <div className="font-khand font-black text-2xl uppercase">Podcasts</div>
                     </div>
                </div>
            </div>
         </div>
      </section>

      {/* ── ANTI-COREX RAP ANTHEM (Feature Block) ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-black border-4 border-black shadow-[12px_12px_0px_0px_rgba(229,255,0,1)] p-8 md:p-12 relative text-white">
          <div className="font-mono text-xs tracking-[0.2em] text-[#E5FF00] uppercase mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B1A] animate-pulse"></span>
            Official Anti-Corex Anthem
          </div>
          <h2 className="text-4xl md:text-5xl font-khand font-black mb-6 uppercase">
            एक ज़हर जो खामोशी से मारता है।
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl font-bold mb-8">
            "तैं सुन नौजवान! छोड़ दे य जहर, बचाइले आपन जान।" <br/> 
            रीवा, सतना, सीधी में नशे की लत एक चुप्पी में फैल रही है। Future Radio ने यह ठान लिया है — यह चुप्पी तोड़नी है।
          </p>

          {/* Audio Player UI */}
          <div className="bg-white/10 border-2 border-white/20 p-6 flex flex-col sm:flex-row items-center gap-6">
            <audio 
              ref={audioRef} 
              src="/audio/originals/tain_sun_5.mp3"
              onTimeUpdate={handleTimeUpdate} 
              onEnded={() => { setIsPlayingAnthem(false); setProgress(0); }}
            />
            <button 
              onClick={toggleAnthem}
              className="w-16 h-16 rounded-full bg-[#E5FF00] hover:bg-white text-black flex items-center justify-center border-4 border-black transition-all hover:scale-105 shrink-0 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              {isPlayingAnthem ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
            </button>
            <div className="flex-1 w-full">
              <div className="font-bold text-lg text-white mb-2 font-sans">Bagheli Rap Anthem - Vindhya Movement</div>
              <div 
                className="w-full h-4 bg-black border-2 border-white/50 cursor-pointer relative"
                onClick={handleSeek}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-[#E5FF00] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 text-center border-t-4 border-black mt-24">
        <div className="font-khand font-black text-5xl uppercase tracking-tight mb-2">फ्यूचर रेडियो</div>
        <div className="font-bold text-black/60 mb-8">विंध्य की आवाज़ — India&apos;s Vernacular AI Radio Network</div>
        <div className="flex justify-center gap-6 text-sm font-black uppercase text-black/80 mb-12">
          <Link href="/" className="hover:text-[#FF6B1A] transition-colors">Platform</Link>
          <button onClick={handleTuneIn} className="hover:text-[#FF6B1A] transition-colors">Bagheli Station</button>
          <Link href="/creators" className="hover:text-[#FF6B1A] transition-colors">Creators</Link>
        </div>
        <div className="text-xs font-bold text-black/40">
          &copy; {new Date().getFullYear()} Future Radio & Media Mafias
        </div>
      </footer>
    </div>
  );
}
