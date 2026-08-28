"use client";

import React, { useEffect, useState } from "react";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function YouTubeClient() {
  const { currentBlock, upcomingBlocks, phase, isPlaying, setIsPlaying } = useAudioStore();
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-start stream
  useEffect(() => {
    // With --autoplay-policy=no-user-gesture-required in Puppeteer, this works automatically!
    const timer = setTimeout(() => {
      unlockAudio();
      setIsPlaying(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setIsPlaying]);

  return (
    <div className="w-[1920px] h-[1080px] overflow-hidden flex text-black font-khand font-black uppercase">
      
      {/* Left Sidebar: Stacked Logos */}
      <div className="w-[360px] h-full bg-white border-r-8 border-black z-30 flex flex-col items-center py-16 justify-around shadow-[16px_0_0_0_rgba(0,0,0,1)] relative">
        <div className="w-64 h-64 flex items-center justify-center">
          <img src="/Logo Main.png" alt="Media Mafias" className="w-full h-full object-contain drop-shadow-xl" />
        </div>

        <div className="w-72 h-48 flex items-center justify-center">
          <img src="/logo-transparent.png" alt="Future Radio" className="w-full h-full object-contain drop-shadow-xl scale-125" />
        </div>

        <div className="w-64 h-64 flex items-center justify-center">
          <img src="/Bagheli_Logo.png" alt="Bagheli Logo" className="w-full h-full object-contain drop-shadow-xl scale-110" />
        </div>
      </div>

      {/* Main Content Area (Purple Background) */}
      <div className="flex-1 h-full bg-[#c4b5fd] relative flex flex-col overflow-hidden">
        
        {/* Brutalist Grid Background Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 1) 2px, transparent 2px), linear-gradient(90deg, rgba(0, 0, 0, 1) 2px, transparent 2px)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Top Right: Clock & Live Badge */}
        <div className="absolute top-12 right-12 flex flex-col items-end gap-6 z-20">
          <div className="text-6xl tracking-wider text-black bg-white border-8 border-black px-8 py-3 shadow-[8px_8px_0_0_rgba(0,0,0,1)] font-mono">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="flex items-center gap-3 bg-black px-6 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
            <p className="text-3xl font-bold tracking-widest text-[#eaff04] mt-1">LIVE 24/7</p>
          </div>
        </div>

        {/* Center Content Container */}
        <div className="flex-1 flex px-16 pt-24 pb-32 gap-16 z-10 items-center justify-center">
          
          {/* Left: Now Playing (Album Art & Title) */}
          <div className="flex-1 flex flex-col justify-center items-center relative mt-8">
            
            {/* Glowing Pulsating Album Art */}
            <motion.div 
              animate={isPlaying ? { 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0px 0px 0px 0px rgba(0, 0, 0, 1)",
                  "0px 0px 40px 20px rgba(234, 255, 4, 0.8)",
                  "0px 0px 0px 0px rgba(0, 0, 0, 1)"
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-[520px] h-[520px] bg-neutral-900 border-8 border-black relative overflow-hidden shadow-[16px_16px_0_0_rgba(0,0,0,1)]"
            >
              <img 
                src={currentBlock?.coverArt || "/icons/icon-512x512.png"} 
                alt="Album Art" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/icons/icon-512x512.png"; }}
              />
            </motion.div>

            {/* Brutalist Now Playing Tag */}
            <div className="mt-16 text-center bg-white border-8 border-black p-8 w-full max-w-2xl shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#eaff04] px-8 py-1 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <h2 className="text-3xl tracking-widest mt-1">NOW PLAYING</h2>
              </div>
              <h1 className="text-6xl truncate text-black mt-4">
                {currentBlock?.songTitle || "Connecting..."}
              </h1>
              <p className="text-3xl text-gray-700 truncate mt-4 bg-[#c4b5fd] border-2 border-black inline-block px-4 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                {currentBlock?.songArtist || "Future Radio"}
              </p>
            </div>
          </div>

          {/* Right: Up Next & QR & Visualizer */}
          <div className="w-[640px] flex flex-col gap-10 h-[840px]">
            
            {/* Visualizer */}
            <div className="h-72 bg-white border-8 border-black p-8 flex flex-col justify-between shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
              <div className="absolute -top-6 -left-6 bg-black text-[#eaff04] px-6 py-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-10 rotate-[-4deg]">
                <h3 className="text-3xl tracking-widest mt-1">AUDIO STREAM</h3>
              </div>
              <div className="flex-1 flex items-end gap-3 overflow-hidden justify-between mt-6 px-4">
                {[...Array(18)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: isPlaying ? ["20%", `${Math.random() * 80 + 20}%`, "20%"] : "10%"
                    }}
                    transition={{
                      duration: Math.random() * 0.4 + 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: Math.random() * 0.5
                    }}
                    className="w-6 bg-[#c4b5fd] border-4 border-black"
                  />
                ))}
              </div>
            </div>

            {/* Up Next */}
            <div className="flex-1 bg-white border-8 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
              <div className="absolute -top-6 right-8 bg-black text-white px-6 py-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-10 rotate-[3deg]">
                <h3 className="text-3xl tracking-widest mt-1">UP NEXT</h3>
              </div>
              <div className="flex flex-col gap-6 flex-1 overflow-hidden mt-6">
                {upcomingBlocks.slice(0, 3).map((block, i) => (
                  <div key={i} className="flex items-center gap-6 bg-[#eaff04] p-3 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-2 transition-transform">
                    <div className="w-16 h-16 bg-white border-4 border-black flex-shrink-0 flex items-center justify-center font-bold text-3xl">
                      #{i + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-3xl text-black truncate leading-none mb-1">{block.songTitle}</p>
                      <p className="text-xl text-gray-800 truncate leading-none">{block.songArtist}</p>
                    </div>
                  </div>
                ))}
                {upcomingBlocks.length === 0 && (
                  <div className="text-black text-4xl flex h-full items-center justify-center">QUEUE IS EMPTY</div>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="h-48 bg-black border-8 border-black p-6 flex items-center gap-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
              <div className="bg-white p-2 border-4 border-[#eaff04] shadow-[4px_4px_0_0_#eaff04] flex-shrink-0">
                <QRCode value="https://www.thefutureradio.com" size={110} />
              </div>
              <div className="text-[#eaff04]">
                <h3 className="text-5xl mb-2">LISTEN ON MOBILE</h3>
                <p className="text-2xl text-gray-300">SCAN TO VISIT THEFUTURERADIO.COM</p>
              </div>
            </div>

          </div>
        </div>

        {/* Scrolling Ticker Bottom Bar */}
        <div className="h-24 bg-[#eaff04] w-full flex items-center overflow-hidden z-20 border-t-8 border-black shadow-[0_-12px_0_0_rgba(0,0,0,1)] absolute bottom-0">
          <motion.div
            animate={{ x: [1560, -3000] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="whitespace-nowrap text-5xl text-black pt-2"
          >
            ✦ YOU ARE LISTENING TO FUTURE RADIO ✦ 100% AUTONOMOUS STREAMING ✦ REGIONAL, DEVOTIONAL & INDIE ✦ LIVE 24/7 ✦ SCAN THE QR CODE TO LISTEN ON YOUR PHONE ✦ SUBSCRIBE TO MEDIA MAFIAS! ✦
          </motion.div>
        </div>

      </div>
    </div>
  );
}
