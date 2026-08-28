"use client";

import React, { useEffect, useState } from "react";
import { useAudioStore, unlockAudio } from "@/components/audio/useAudioStore";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

// Helpers to clean raw metadata
function formatTitle(title?: string): string {
  if (!title) return "Connecting to Studio...";
  // Remove extensions
  let clean = title.replace(/\.mp[34]$|\.wav$/i, '');
  // Remove common noise in parentheses like (Remastered), (Edit), (1), etc.
  clean = clean.replace(/\((Remastered|Edit|Official|Audio|Video|Radio|\d+.*?)\)/gi, '');
  // Clean up any remaining empty parentheses and trim
  clean = clean.replace(/\(\s*\)/g, '').trim();
  return clean || "Connecting to Studio...";
}

function formatArtist(artist?: string): string {
  if (!artist) return "Future Radio";
  const lower = artist.toLowerCase();
  if (lower.includes('prameesh') || lower.includes('scalerxlab')) {
    return "Future Radio";
  }
  return artist;
}

export default function YouTubeClient() {
  const { currentBlock, upcomingBlocks, phase, isPlaying, setIsPlaying } = useAudioStore();
  const [time, setTime] = useState(new Date());

  // Hardware-accelerated CSS animations for buttery smooth UI in Puppeteer
  const globalStyles = `
    @keyframes eqPulse {
      0%, 100% { height: 10%; background-color: #000; }
      50% { height: var(--eq-h); background-color: #fff; }
    }
    .eq-bar {
      width: 1.25rem;
      border: 3px solid #000;
      box-shadow: 4px 4px 0px rgba(0,0,0,1);
      background-color: #000;
      transition: height 0.1s ease;
      height: 5%;
    }
    .eq-bar.playing {
      animation: eqPulse var(--eq-d) ease-in-out infinite;
      animation-delay: var(--eq-del);
    }
    @keyframes smoothSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .smooth-spin {
      animation: smoothSpin 4s linear infinite;
    }
    @keyframes spinReverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    .spin-reverse {
      animation: spinReverse 8s linear infinite;
    }
  `;

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-start stream
  useEffect(() => {
    const timer = setTimeout(() => {
      unlockAudio();
      setIsPlaying(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [setIsPlaying]);

  return (
    <div className="w-[1920px] h-[1080px] overflow-hidden flex font-khand text-black relative bg-[#C4B5FD] selection:bg-black selection:text-[#E5FF00]">
      <style>{globalStyles}</style>
      
      {/* Neo-Brutalist Background Watermarks */}
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

      {/* Left Sidebar: Brutalist Logos */}
      <div className="w-[360px] h-full bg-white border-r-8 border-black z-30 flex flex-col items-center py-16 justify-around shadow-[16px_0_0_0_rgba(0,0,0,1)] relative">
        <div className="w-56 h-56 flex items-center justify-center p-2 bg-[#E5FF00] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
          <img src="/icons/media-mafias-logo.png" alt="Media Mafias" className="w-full h-full object-contain" />
        </div>
        <div className="w-56 h-56 flex items-center justify-center p-2 bg-[#FF69B4] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
          <img src="/icons/future-radio-logo.png" alt="Future Radio" className="w-full h-full object-contain" />
        </div>
        <div className="w-56 h-56 flex items-center justify-center p-2 bg-[#00E5FF] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
          <img src="/icons/bagheli-logo.png" alt="Bagheli Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative flex flex-col z-10 p-12">
        
        {/* Top Header: Clock & ON AIR Badge */}
        <div className="flex justify-between items-start w-full">
          <div></div> {/* Spacer */}
          <div className="flex items-center">
            <div className="bg-white border-4 border-black px-6 py-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center">
              <div className="text-5xl font-black font-khand tracking-widest text-black">
                {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
            
            {/* ON AIR Neo-Brutalist Badge */}
            <div className="bg-[#E5FF00] border-4 border-black px-8 py-3 ml-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center gap-4">
              <div className="w-5 h-5 bg-red-500 border-2 border-black rounded-full animate-pulse shadow-[2px_2px_0_0_rgba(0,0,0,1)]" />
              <p className="text-4xl font-black font-khand tracking-widest text-black mt-1">
                ON AIR
              </p>
            </div>
          </div>
        </div>

        {/* Center Content: Visuals & Panels */}
        <div className="flex-1 flex gap-16 mt-12 items-center justify-center">
          
          {/* Left: Dynamic Bagheli Artwork Visual */}
          <div className="flex-1 flex flex-col justify-center items-center">
            
            {/* Circular Frame with RGB Border */}
            <div className="relative w-[500px] h-[500px] flex items-center justify-center mt-[-60px]">
              
              {/* Glowing RGB Border (Similar to Radio Player) */}
              <div 
                className={`absolute inset-[-12px] rounded-full blur-[15px] opacity-70 ${isPlaying ? 'smooth-spin' : ''}`}
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)'
                }}
              />
              <div 
                className={`absolute inset-[-4px] rounded-full ${isPlaying ? 'smooth-spin' : ''}`}
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)'
                }}
              />
              
              {/* Center Image Container */}
              <div className="w-full h-full rounded-full overflow-hidden bg-black relative z-10 border-4 border-black">
                <img 
                  src="/images/stations/bagheli_artwork.png" 
                  alt="Bagheli Vibes" 
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>

            {/* Now Playing Info (Solid Card) */}
            <div className="mt-20 bg-[#00E5FF] border-[6px] border-black p-8 w-full max-w-2xl shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col items-center">
              <div className="bg-black text-[#E5FF00] px-4 py-1 font-bold text-xl uppercase mb-4 shadow-[4px_4px_0_0_rgba(255,255,255,1)] transform -rotate-2">
                NOW PLAYING
              </div>
              <h1 className="text-5xl font-black font-khand tracking-tight uppercase text-black text-center truncate w-full">
                {formatTitle(currentBlock?.songTitle)}
              </h1>
              <p className="text-3xl font-bold font-khand uppercase text-black/70 tracking-widest truncate mt-2">
                {formatArtist(currentBlock?.songArtist)}
              </p>
            </div>
          </div>

          {/* Right: Solid Panels (Visualizer & Up Next) */}
          <div className="w-[500px] flex flex-col gap-12 h-[800px] mt-[-40px]">
            
            {/* Brutalist Equalizer Panel */}
            <div className="h-[280px] bg-[#FF69B4] border-[6px] border-black p-8 flex flex-col justify-between shadow-[16px_16px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
              <h3 className="text-3xl font-black font-khand text-black uppercase bg-white border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] inline-block w-fit">Audio Stream</h3>
              
              <div className="flex-1 flex items-end gap-3 overflow-hidden justify-between mt-8 px-2 border-b-[6px] border-black">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className={`eq-bar ${isPlaying ? 'playing' : ''}`}
                    style={{
                      '--eq-h': `${Math.floor(Math.random() * 70 + 20)}%`,
                      '--eq-d': `${(Math.random() * 0.4 + 0.3).toFixed(2)}s`,
                      '--eq-del': `${(Math.random() * 0.5).toFixed(2)}s`
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>

            {/* Up Next Panel */}
            <div className="flex-1 bg-[#E5FF00] border-[6px] border-black p-8 shadow-[16px_16px_0_0_rgba(0,0,0,1)] flex flex-col">
              <h3 className="text-3xl font-black font-khand text-black uppercase mb-6 bg-white border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] inline-block w-fit">Up Next</h3>
              <div className="flex flex-col gap-5 flex-1 overflow-hidden">
                {upcomingBlocks.slice(0, 4).map((block, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white p-3 border-[4px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                    <div className="w-12 h-12 min-w-[48px] bg-black text-[#E5FF00] flex items-center justify-center font-black text-3xl font-khand border-2 border-black">
                      {i + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-2xl text-black font-black font-khand uppercase truncate leading-tight">{formatTitle(block.songTitle)}</p>
                      <p className="text-lg font-bold text-black/60 uppercase truncate leading-tight mt-1">{formatArtist(block.songArtist)}</p>
                    </div>
                  </div>
                ))}
                {upcomingBlocks.length === 0 && (
                  <div className="text-black/40 font-black text-3xl flex h-full items-center justify-center tracking-widest uppercase text-center border-4 border-dashed border-black/20 p-4">
                    QUEUE IS EMPTY
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Brutalist Ticker */}
      <div className="absolute bottom-0 w-full h-16 bg-white border-t-[8px] border-black z-40 flex items-center overflow-hidden">
        <motion.div
          animate={{ x: [0, -3000] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-3xl font-black font-khand tracking-[0.1em] text-black pt-2 flex items-center"
        >
          {[...Array(6)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-[#FF69B4] mx-8 text-4xl">✦</span>
              YOU ARE LISTENING TO FUTURE RADIO
              <span className="text-[#00E5FF] mx-8 text-4xl">✦</span>
              100% AUTONOMOUS PREMIUM FOLK RADIO
              <span className="text-[#E5FF00] mx-8 text-4xl">✦</span>
              LIVE 24/7
            </React.Fragment>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
