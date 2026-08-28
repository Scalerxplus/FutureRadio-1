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
      0%, 100% { height: 10%; background-color: #8b5cf6; }
      50% { height: var(--eq-h); background-color: #06b6d4; }
    }
    .eq-bar {
      width: 1rem;
      border-top-left-radius: 9999px;
      border-top-right-radius: 9999px;
      box-shadow: 0 0 15px rgba(139,92,246,0.6);
      background-color: #333;
      transition: height 0.3s ease, background-color 0.3s ease;
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
  `;

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
    <div className="w-[1920px] h-[1080px] overflow-hidden flex font-khand text-white relative bg-[#050510]">
      
      {/* Deep Space / Atmospheric Background */}
      <div className="absolute inset-0 z-0" style={{
        background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #050510 80%)',
      }}></div>

      {/* Floating Particles / Ambient Noise Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }}></div>

      {/* Animated Subtle Ambient Glows */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] z-0" 
      />
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[100px] z-0" 
      />

      {/* Left Sidebar: Glassmorphism Logos */}
      <div className="w-[360px] h-full bg-black/40 backdrop-blur-2xl border-r border-white/10 z-30 flex flex-col items-center py-16 justify-around shadow-[16px_0_30px_rgba(0,0,0,0.5)]">
        <div className="w-56 h-56 flex items-center justify-center p-2">
          <img src="/icons/media-mafias-logo.png" alt="Media Mafias" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>
        <div className="w-56 h-56 flex items-center justify-center p-2">
          <img src="/icons/future-radio-logo.png" alt="Future Radio" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>
        <div className="w-56 h-56 flex items-center justify-center p-2">
          <img src="/icons/bagheli-logo.png" alt="Bagheli Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative flex flex-col z-10 p-12">
        
        {/* Top Header: Clock & ON AIR Badge */}
        <div className="flex justify-between items-start w-full">
          <div></div> {/* Spacer */}
          <div className="flex items-center gap-8">
            <div className="text-5xl tracking-widest text-white/80 font-mono drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            
            {/* ON AIR Neon Sign */}
            <div className="flex items-center gap-4 bg-red-950/40 backdrop-blur-md px-8 py-3 rounded-xl border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <motion.div 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              />
              <p className="text-4xl font-bold tracking-[0.2em] text-red-400 mt-1" style={{ textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
                ON AIR
              </p>
            </div>
          </div>
        </div>

        {/* Center Content: Visuals & Panels */}
        <div className="flex-1 flex gap-12 mt-8 items-center justify-center">
          
          {/* Left: Dynamic Bagheli Artwork Visual */}
          <div className="flex-1 flex flex-col justify-center items-center">
            
            {/* Rotating RGB Neon Circular Frame */}
            <div className="relative w-[550px] h-[550px] flex items-center justify-center">
              
              {/* Rotating RGB Glow (Blurred for Neon Effect) */}
              <div 
                className={`absolute inset-[-15px] rounded-full blur-[20px] opacity-80 ${isPlaying ? 'smooth-spin' : ''}`}
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)'
                }}
              />
              
              {/* Rotating RGB Border */}
              <div 
                className={`absolute inset-[-6px] rounded-full ${isPlaying ? 'smooth-spin' : ''}`}
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)'
                }}
              />

              {/* Center Image Container (Perfect Circle) */}
              <div className="w-full h-full rounded-full overflow-hidden bg-black relative z-10">
                <img 
                  src="/images/stations/bagheli_artwork.png" 
                  alt="Bagheli Vibes" 
                  className="w-full h-full object-cover scale-105"
                />
              </div>
            </div>

            {/* Now Playing Info (Glass Card) */}
            <div className="mt-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl flex flex-col items-center">
              <p className="text-cyan-400 text-2xl tracking-[0.3em] font-medium uppercase mb-4 shadow-cyan-400/50 drop-shadow-md">
                NOW PLAYING
              </p>
              <h1 className="text-5xl font-bold tracking-wide text-white text-center truncate w-full" style={{ textShadow: '0 0 15px rgba(255,255,255,0.4)' }}>
                {formatTitle(currentBlock?.songTitle)}
              </h1>
              <p className="text-2xl text-white/60 tracking-wider truncate mt-3">
                {formatArtist(currentBlock?.songArtist)}
              </p>
            </div>
          </div>

          {/* Right: Glassmorphism Panels (Visualizer & Up Next) */}
          <div className="w-[500px] flex flex-col gap-8 h-[800px]">
            
            {/* Neon Visualizer Panel */}
            <div className="h-64 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <h3 className="text-2xl tracking-[0.2em] text-white/80 uppercase">Audio Stream</h3>
              
              <div className="flex-1 flex items-end gap-2 overflow-hidden justify-between mt-8 px-2">
                {[...Array(16)].map((_, i) => (
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
            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col">
              <h3 className="text-2xl tracking-[0.2em] text-white/80 uppercase mb-6">Up Next</h3>
              <div className="flex flex-col gap-5 flex-1 overflow-hidden">
                {upcomingBlocks.slice(0, 4).map((block, i) => (
                  <div key={i} className="flex items-center gap-5 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                      {i + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-2xl text-white truncate leading-tight tracking-wide">{formatTitle(block.songTitle)}</p>
                      <p className="text-lg text-white/50 truncate leading-tight mt-1">{formatArtist(block.songArtist)}</p>
                    </div>
                  </div>
                ))}
                {upcomingBlocks.length === 0 && (
                  <div className="text-white/40 text-2xl flex h-full items-center justify-center tracking-widest">
                    QUEUE IS EMPTY
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Sleek Dark Ticker */}
      <div className="absolute bottom-0 w-full h-16 bg-black/80 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <motion.div
          animate={{ x: [1920, -3000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-3xl tracking-[0.2em] text-white/70 font-light pt-1"
        >
          <span className="text-cyan-400 font-bold mx-8">✦</span>
          YOU ARE LISTENING TO FUTURE RADIO
          <span className="text-purple-400 font-bold mx-8">✦</span>
          100% AUTONOMOUS PREMIUM FOLK RADIO
          <span className="text-cyan-400 font-bold mx-8">✦</span>
          LIVE 24/7
          <span className="text-purple-400 font-bold mx-8">✦</span>
          SUBSCRIBE TO MEDIA MAFIAS!
        </motion.div>
      </div>

    </div>
  );
}
