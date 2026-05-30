"use client";

import { useEffect, useState } from "react";
import { Music, Mic2, Settings, Target } from "lucide-react";

export default function MixingConsole({ schedule, now }: { schedule: any[], now: Date }) {
  // Find currently active element
  const flatElements = schedule.flatMap(s => s.elements);
  const activeElement = flatElements.find(el => new Date(el.end_time) > now && !el.isPlaceholder) || flatElements[0];
  const activeIndex = flatElements.findIndex(el => el.id === activeElement?.id);

  // Derive which deck is active based on continuous 3-deck A/B/C rotation
  const mainElementsBefore = flatElements.slice(0, activeIndex + 1).filter(el => el.element_type !== 'sweeper' && el.element_type !== 'station_id');
  const activeDeckIndex = Math.max(0, (mainElementsBefore.length - 1) % 3); // 0 = A, 1 = B, 2 = C
  
  const isSweeper = activeElement?.element_type === 'sweeper' || activeElement?.element_type === 'station_id';

  // Deck State Variables
  const [faders, setFaders] = useState({
    deckA: 0,
    deckB: 0,
    deckC: 0,
    sweeper: 0,
  });

  useEffect(() => {
    if (!activeElement) return;
    
    // Simulate Fader Automation based on Element Type
    let targetFaders = { deckA: 0, deckB: 0, deckC: 0, sweeper: 0 };
    
    if (isSweeper) {
      targetFaders = { deckA: 0, deckB: 0, deckC: 0, sweeper: 100 };
      // Keep the previous main deck slightly active in UI to represent ducking
      if (activeDeckIndex === 0) targetFaders.deckA = 30;
      if (activeDeckIndex === 1) targetFaders.deckB = 30;
      if (activeDeckIndex === 2) targetFaders.deckC = 30;
    } else {
      if (activeDeckIndex === 0) targetFaders.deckA = 100;
      if (activeDeckIndex === 1) targetFaders.deckB = 100;
      if (activeDeckIndex === 2) targetFaders.deckC = 100;
    }

    // Apply crossfade smoothing
    setFaders(targetFaders);

  }, [activeElement, activeDeckIndex, isSweeper]);

  return (
    <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 mb-8 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Settings size={200} className="text-gray-500 animate-[spin_60s_linear_infinite]" />
      </div>

      <div className="flex justify-between items-end mb-6 z-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Live Mixing Console</h2>
          <p className="text-xs text-gray-400">Monitoring 3-Deck Continuous Playout Architecture.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">On Air Automation</span>
        </div>
      </div>

      <div className="flex gap-4 z-10">
        {/* CH 1: DECK A */}
        <ChannelStrip 
          label="DECK A" 
          icon={<Music size={14} />} 
          level={faders.deckA} 
          isActive={activeDeckIndex === 0 || (isSweeper && activeDeckIndex === 0)}
          color="bg-blue-500"
          trackName={activeDeckIndex === 0 ? activeElement?.metadata?.title : "Loading..."}
        />
        
        {/* CH 2: DECK B */}
        <ChannelStrip 
          label="DECK B" 
          icon={<Music size={14} />} 
          level={faders.deckB} 
          isActive={activeDeckIndex === 1 || (isSweeper && activeDeckIndex === 1)}
          color="bg-fuchsia-500"
          trackName={activeDeckIndex === 1 ? activeElement?.metadata?.title : "Loading..."}
        />

        {/* CH 3: DECK C */}
        <ChannelStrip 
          label="DECK C" 
          icon={<Music size={14} />} 
          level={faders.deckC} 
          isActive={activeDeckIndex === 2 || (isSweeper && activeDeckIndex === 2)}
          color="bg-emerald-500"
          trackName={activeDeckIndex === 2 ? activeElement?.metadata?.title : "Loading..."}
        />

        {/* CH 4: SWEEPER (Overdub Layer) */}
        <ChannelStrip 
          label="OVERDUB LAYER" 
          icon={<Target size={14} />} 
          level={faders.sweeper} 
          isActive={isSweeper}
          color="bg-yellow-500"
          trackName={isSweeper ? activeElement.metadata?.title : "Idle"}
        />
      </div>
    </div>
  );
}

function ChannelStrip({ label, icon, level, isActive, color, trackName }: { label: string, icon: any, level: number, isActive: boolean, color: string, trackName?: string }) {
  return (
    <div className={`flex-1 flex flex-col items-center p-3 rounded-xl border transition-colors ${isActive ? 'bg-[#1a1a24] border-[#2a2a34]' : 'bg-[#0d0d14] border-[#15151e]'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${isActive ? color + ' text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-[#1a1a24] text-gray-600'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-widest uppercase text-center mb-1 ${isActive ? 'text-white' : 'text-gray-500'}`}>{label}</span>
      <span className="text-[9px] text-gray-500 text-center truncate w-full px-1 mb-4 h-3">{trackName}</span>
      
      {/* Fader Track & Markers */}
      <div className="flex gap-2 items-center">
        {/* dB Markers Left */}
        <div className="flex flex-col justify-between h-32 text-[7px] text-gray-600 font-mono py-1">
          <span>+6</span>
          <span> 0</span>
          <span>-6</span>
          <span>-12</span>
          <span>-24</span>
          <span>-∞</span>
        </div>

        {/* The Fader */}
        <div className="w-8 h-32 bg-black rounded-lg relative flex justify-center border border-[#222] shadow-inner">
          {/* LED VU Meter Effect */}
          <div className="absolute bottom-0 w-full rounded-lg overflow-hidden flex flex-col justify-end">
            <div 
              className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-600 transition-all duration-[2000ms] ease-out opacity-90"
              style={{ height: `${level}%` }}
            ></div>
          </div>
          
          {/* Fader Cap */}
          <div 
            className="absolute w-12 h-6 bg-gradient-to-b from-gray-300 to-gray-400 rounded shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-t border-b-2 border-white/50 border-b-black/50 transition-all duration-[2000ms] ease-out flex items-center justify-center cursor-pointer"
            style={{ bottom: `max(0%, calc(${level}% - 12px))` }}
          >
            <div className="w-8 h-[2px] bg-red-600 shadow-[0_0_4px_rgba(255,0,0,0.5)]"></div>
          </div>
        </div>

        {/* dB Markers Right */}
        <div className="flex flex-col justify-between h-32 text-[7px] text-gray-600 font-mono py-1">
          <span>-</span>
          <span>-</span>
          <span>-</span>
          <span>-</span>
          <span>-</span>
          <span>-</span>
        </div>
      </div>
      
      {/* dB readout */}
      <div className="mt-4 text-[9px] font-mono text-brand-red bg-black/50 px-2 py-0.5 rounded border border-[#222] shadow-inner">
        {level > 0 ? (level === 100 ? "0.0dB" : `-${Math.round((100 - level) / 4)}dB`) : "-INF"}
      </div>
    </div>
  );
}
