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
    <div className="w-[1920px] h-[1080px] overflow-hidden relative flex flex-col text-black font-khand bg-[#FFD1DC] font-black uppercase">
      
      {/* Brutalist Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 1) 2px, transparent 2px), linear-gradient(90deg, rgba(0, 0, 0, 1) 2px, transparent 2px)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Top Bar: Logos & Time */}
      <div className="w-full h-32 px-12 flex justify-between items-center z-10 bg-[#FFD1DC] border-b-8 border-black shadow-[0_12px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center space-x-6">
          <div className="bg-white border-4 border-black p-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
            <img src="/Logo Main.png" alt="Media Mafias" className="h-16 object-contain" />
          </div>
          <div className="flex flex-col justify-center bg-black text-white px-6 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] translate-y-[-4px]">
            <h1 className="text-4xl tracking-widest leading-none">Future Radio</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></div>
              <p className="text-xl font-bold tracking-widest text-[#98FB98]">LIVE 24/7</p>
            </div>
          </div>
        </div>
        <div className="text-6xl tracking-wider text-black bg-white border-4 border-black px-8 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] font-mono translate-y-[-4px]">
          {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex p-12 gap-12 z-10 items-center">
        
        {/* Left: Now Playing (Vinyl & Title) */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          
          {/* Ultra Realistic 3D Vinyl */}
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-[520px] h-[520px] rounded-full relative flex items-center justify-center shadow-[16px_16px_0_0_rgba(0,0,0,1)] border-8 border-black bg-neutral-900"
            style={{
              background: `
                radial-gradient(circle at center, #111 20%, #222 25%, #111 30%, #333 35%, #111 40%, #222 45%, #111 50%, #333 55%, #111 60%, #222 65%, #111 70%),
                conic-gradient(from 0deg, #111, #444, #111, #555, #111)
              `,
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Vinyl Specular Highlight */}
            <div className="absolute inset-0 rounded-full" style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none'
            }}></div>

            {/* Bright Center Label for Logo contrast */}
            <div className="w-72 h-72 rounded-full overflow-hidden z-10 border-8 border-black relative bg-[#98FB98] flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <img src="/Logo Main.png" alt="Future Radio" className="w-3/4 opacity-90 mix-blend-multiply" />
              
              <div className="w-6 h-6 rounded-full bg-black border-4 border-[#FFD1DC] shadow-inner absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"></div>
            </div>
          </motion.div>

          {/* Brutalist Now Playing Tag */}
          <div className="mt-12 text-center bg-white border-8 border-black p-8 w-full max-w-2xl shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-[#98FB98] px-6 py-1 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <h2 className="text-2xl tracking-widest">NOW PLAYING</h2>
            </div>
            <h1 className="text-6xl truncate text-black mt-2">
              {currentBlock?.songTitle || "Connecting..."}
            </h1>
            <p className="text-3xl text-gray-700 truncate mt-2 bg-[#FFD1DC] border-2 border-black inline-block px-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              {currentBlock?.songArtist || "Future Radio"}
            </p>
          </div>
        </div>

        {/* Right: Up Next & QR & Visualizer */}
        <div className="w-[640px] flex flex-col gap-8 h-[800px]">
          
          {/* Visualizer */}
          <div className="h-72 bg-[#98FB98] border-8 border-black p-8 flex flex-col justify-between shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative">
            <div className="absolute -top-5 -left-5 bg-black text-[#FFD1DC] px-4 py-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-10 rotate-[-5deg]">
              <h3 className="text-2xl tracking-widest">AUDIO STREAM</h3>
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
                  className="w-6 bg-black border-2 border-black"
                />
              ))}
            </div>
          </div>

          {/* Up Next */}
          <div className="flex-1 bg-white border-8 border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col relative">
            <div className="absolute -top-5 right-10 bg-black text-white px-4 py-1 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] z-10 rotate-[2deg]">
              <h3 className="text-2xl tracking-widest">UP NEXT</h3>
            </div>
            <div className="flex flex-col gap-6 flex-1 overflow-hidden mt-6">
              {upcomingBlocks.slice(0, 3).map((block, i) => (
                <div key={i} className="flex items-center gap-6 bg-[#FFD1DC] p-3 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-2 transition-transform">
                  <div className="w-16 h-16 bg-white border-4 border-black flex-shrink-0 flex items-center justify-center font-bold text-2xl">
                    #{i + 1}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-3xl text-black truncate leading-none mb-1">{block.songTitle}</p>
                    <p className="text-xl text-gray-800 truncate leading-none">{block.songArtist}</p>
                  </div>
                </div>
              ))}
              {upcomingBlocks.length === 0 && (
                <div className="text-black text-3xl flex h-full items-center justify-center">QUEUE IS EMPTY</div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="h-48 bg-black border-8 border-black p-6 flex items-center gap-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)]">
            <div className="bg-white p-2 border-4 border-[#98FB98] shadow-[4px_4px_0_0_#98FB98] flex-shrink-0">
              <QRCode value="https://www.thefutureradio.com" size={110} />
            </div>
            <div className="text-[#FFD1DC]">
              <h3 className="text-5xl mb-2">LISTEN ON MOBILE</h3>
              <p className="text-2xl text-gray-300">SCAN TO VISIT THEFUTURERADIO.COM</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scrolling Ticker Bottom Bar */}
      <div className="h-24 bg-[#98FB98] w-full flex items-center overflow-hidden z-20 border-t-8 border-black shadow-[0_-12px_0_0_rgba(0,0,0,1)]">
        <motion.div
          animate={{ x: [1920, -3000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-5xl text-black"
        >
          ✦ YOU ARE LISTENING TO FUTURE RADIO ✦ REGIONAL, DEVOTIONAL & INDIE ✦ LIVE 24/7 ✦ SCAN THE QR CODE TO LISTEN ON YOUR PHONE ✦ SUBSCRIBE TO MEDIA MAFIAS! ✦
        </motion.div>
      </div>

    </div>
  );
}
