"use client";

import { useEffect, useState } from "react";
import { Music, Mic2, Settings, Target } from "lucide-react";

export default function MixingConsole({ schedule, now }: { schedule: any[], now: Date }) {
  // Find currently active element
  const flatElements = schedule.flatMap(s => s.elements);
  const activeElement = flatElements.find(el => new Date(el.end_time) > now && !el.isPlaceholder) || flatElements[0];
  const activeIndex = flatElements.findIndex(el => el.id === activeElement?.id);
  const nextElement = flatElements[activeIndex + 1];

  // Derive which deck is active based on position
  const songElementsBefore = flatElements.slice(0, activeIndex + 1).filter(el => el.element_type === 'song');
  const isDeckAActive = songElementsBefore.length % 2 !== 0;

  // Deck State Variables
  const [faders, setFaders] = useState({
    deckA: 0,
    deckB: 0,
    sweeper: 0,
    voice: 0,
    bed: 0
  });

  useEffect(() => {
    if (!activeElement) return;
    
    // Simulate Fader Automation based on Element Type
    let targetFaders = { deckA: 0, deckB: 0, sweeper: 0, voice: 0, bed: 0 };
    
    if (activeElement.element_type === 'song') {
      targetFaders = isDeckAActive 
        ? { deckA: 100, deckB: 0, sweeper: 0, voice: 0, bed: 0 } 
        : { deckA: 0, deckB: 100, sweeper: 0, voice: 0, bed: 0 };
    } else if (activeElement.element_type === 'sweeper' || activeElement.element_type === 'station_id') {
      targetFaders = { deckA: 0, deckB: 0, sweeper: 100, voice: 0, bed: 0 };
    } else if (activeElement.element_type === 'jocktalk') {
      targetFaders = { deckA: 0, deckB: 0, sweeper: 0, voice: 100, bed: 30 }; // Bed is ducked
    }

    // Apply crossfade smoothing
    setFaders(targetFaders);

  }, [activeElement, isDeckAActive]);

  return (
    <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 mb-8 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Settings size={200} className="text-gray-500 animate-[spin_60s_linear_infinite]" />
      </div>

      <div className="flex justify-between items-end mb-6 z-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Live Mixing Console</h2>
          <p className="text-xs text-gray-400">Monitoring internal client-side audio crossfades.</p>
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
          isActive={isDeckAActive && activeElement?.element_type === 'song'}
          color="bg-blue-500"
          trackName={isDeckAActive && activeElement?.element_type === 'song' ? activeElement.metadata?.title : (isDeckAActive ? "Queued" : "Loading...")}
        />
        
        {/* CH 2: DECK B */}
        <ChannelStrip 
          label="DECK B" 
          icon={<Music size={14} />} 
          level={faders.deckB} 
          isActive={!isDeckAActive && activeElement?.element_type === 'song'}
          color="bg-fuchsia-500"
          trackName={!isDeckAActive && activeElement?.element_type === 'song' ? activeElement.metadata?.title : (!isDeckAActive ? "Queued" : "Loading...")}
        />

        {/* CH 3: SWEEPER */}
        <ChannelStrip 
          label="SFX / SWEEPER" 
          icon={<Target size={14} />} 
          level={faders.sweeper} 
          isActive={activeElement?.element_type === 'sweeper' || activeElement?.element_type === 'station_id'}
          color="bg-yellow-500"
          trackName={activeElement?.element_type === 'sweeper' ? activeElement.metadata?.title : "Idle"}
        />

        {/* CH 4: VOICE */}
        <ChannelStrip 
          label="JOCKTALK" 
          icon={<Mic2 size={14} />} 
          level={faders.voice} 
          isActive={activeElement?.element_type === 'jocktalk'}
          color="bg-purple-500"
          trackName={activeElement?.element_type === 'jocktalk' ? "RJ Channel Active" : "Idle"}
        />

        {/* CH 5: MUSIC BED */}
        <ChannelStrip 
          label="MUSIC BED" 
          icon={<Music size={14} />} 
          level={faders.bed} 
          isActive={faders.bed > 0}
          color="bg-orange-500"
          trackName={faders.bed > 0 ? "BGM Loop" : "Muted"}
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
