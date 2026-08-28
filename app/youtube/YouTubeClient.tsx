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
    <div className="w-[1920px] h-[1080px] overflow-hidden relative flex flex-col text-white font-sans" style={{
      backgroundColor: '#111',
      backgroundImage: `
        radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 16%),
        radial-gradient(rgba(255, 255, 255, 0.1) 15%, transparent 16%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px'
    }}>
      {/* Top Bar: Logos & Time */}
      <div className="w-full h-32 px-12 flex justify-between items-center z-10 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="flex items-center space-x-6">
          <img src="/Logo Main.png" alt="Media Mafias" className="h-20 object-contain drop-shadow-lg" />
          <div className="h-16 w-1 bg-red-600 rounded-full"></div>
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black tracking-widest text-white uppercase" style={{ fontFamily: 'Impact, sans-serif' }}>Future Radio</h1>
            <p className="text-xl text-red-500 font-bold tracking-widest">LIVE 24/7</p>
          </div>
        </div>
        <div className="text-5xl font-black tracking-wider text-gray-200" style={{ fontFamily: 'Impact, sans-serif' }}>
          {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex p-12 gap-12 z-10">
        
        {/* Left: Now Playing */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <motion.div 
            animate={{ 
              rotate: isPlaying ? 360 : 0 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="w-[500px] h-[500px] rounded-full border-8 border-neutral-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative flex items-center justify-center bg-[#111]"
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-0 rounded-full border border-white/5 m-4"></div>
            <div className="absolute inset-0 rounded-full border border-white/5 m-12"></div>
            <div className="absolute inset-0 rounded-full border border-white/5 m-20"></div>
            
            {/* Center Art */}
            <div className="w-64 h-64 rounded-full overflow-hidden z-10 border-4 border-black relative">
              <img 
                src={currentBlock?.coverArt || "/vinyl-icon.png"} 
                alt="Artwork" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/vinyl-icon.png"; }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-black border border-white/20"></div>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 text-center bg-black/60 backdrop-blur-lg p-8 rounded-3xl border border-white/10 w-full max-w-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest mb-2">NOW PLAYING</h2>
            <h1 className="text-6xl font-black mb-4 truncate text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              {currentBlock?.songTitle || "Connecting to Server..."}
            </h1>
            <p className="text-3xl text-gray-300 font-semibold truncate">
              {currentBlock?.songArtist || "Future Radio Audio Engine"}
            </p>
          </div>
        </div>

        {/* Right: Up Next & QR & Visualizer */}
        <div className="w-[600px] flex flex-col gap-8 h-full">
          
          {/* Visualizer (CSS Fake) */}
          <div className="h-64 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col justify-between shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-4">AUDIO STREAM</h3>
            <div className="flex-1 flex items-end gap-2 overflow-hidden justify-between px-4">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isPlaying ? ["20%", `${Math.random() * 80 + 20}%`, "20%"] : "10%"
                  }}
                  transition={{
                    duration: Math.random() * 0.5 + 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 0.5
                  }}
                  className="w-4 bg-red-600 rounded-t-sm"
                  style={{ opacity: 0.8 }}
                />
              ))}
            </div>
          </div>

          {/* Up Next */}
          <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden flex flex-col">
            <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">UP NEXT</h3>
            <div className="flex flex-col gap-6 flex-1 overflow-hidden">
              {upcomingBlocks.slice(0, 4).map((block, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0">
                    <img src={block.coverArt || "/vinyl-icon.png"} alt="art" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/vinyl-icon.png"; }} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-2xl font-bold text-white truncate">{block.songTitle}</p>
                    <p className="text-lg text-gray-400 truncate">{block.songArtist}</p>
                  </div>
                </div>
              ))}
              {upcomingBlocks.length === 0 && (
                <div className="text-gray-500 text-xl italic flex h-full items-center justify-center">Queue is empty</div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="h-48 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex items-center gap-8 shadow-2xl">
            <div className="bg-white p-2 rounded-xl flex-shrink-0">
              <QRCode value="https://www.thefutureradio.com" size={120} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>LISTEN ON MOBILE</h3>
              <p className="text-xl text-gray-300">Scan to visit thefutureradio.com & request songs!</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scrolling Ticker Bottom Bar */}
      <div className="h-20 bg-red-600 w-full flex items-center overflow-hidden z-20 shadow-[0_-10px_30px_rgba(220,38,38,0.3)]">
        <motion.div
          animate={{ x: [1920, -3000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-4xl font-bold text-black uppercase tracking-widest"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          🔥 YOU ARE LISTENING TO FUTURE RADIO | REGIONAL, DEVOTIONAL & INDIE | 🔴 LIVE 24/7 | SCAN THE QR CODE TO LISTEN ON YOUR PHONE | SUBSCRIBE TO MEDIA MAFIAS!
        </motion.div>
      </div>

    </div>
  );
}
