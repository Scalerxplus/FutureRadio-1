"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Crosshair, Lock, Database } from "lucide-react";

// Official-aligned GeoJSON that includes full Jammu & Kashmir (POK)
const geoUrl = "https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/state_ut/india_state.json";

import { dialectMarkers, DialectMarker } from "@/lib/data";

export default function MarketAnalysisPage() {
  const [mapMode, setMapMode] = useState<"HUB" | "NODE">("HUB");
  const activeData = dialectMarkers.filter(m => m.type === mapMode);
  
  // Default to the first item of the active mode
  const [activeMarker, setActiveMarker] = useState<typeof dialectMarkers[0]>(activeData[0]);

  // Automatically update active marker when switching modes
  React.useEffect(() => {
    setActiveMarker(activeData[0]);
  }, [mapMode]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-red-accent selection:text-white overflow-hidden">
      <Header />
      
      {/* Command Center Container */}
      <section className="pt-24 min-h-screen flex flex-col relative border-b border-white/5 bg-neutral-950">
        
        {/* CRT Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-30" />
        
        <div className="flex-1 w-full flex flex-col lg:flex-row relative z-20">
          
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-[400px] border-r border-red-accent/20 bg-black/80 backdrop-blur-md p-8 flex flex-col justify-between shrink-0">
            <div className="space-y-8">
              <div>
                <span className="text-red-accent font-mono text-xs tracking-widest uppercase flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4" /> SECURE_CONNECTION
                </span>
                <h1 className="font-display text-4xl tracking-widest uppercase text-white hover-glitch">
                  COMMAND <br/> <span className="text-red-accent">CENTER</span>
                </h1>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-[10px] text-secondary uppercase tracking-[0.2em] border-b border-white/10 pb-2">
                  Select Targeting Protocol
                </p>
                <div className="flex bg-black border border-white/20 p-1 rounded-sm w-full relative overflow-hidden">
                  <button 
                    onClick={() => setMapMode("HUB")}
                    className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 relative z-10 ${
                      mapMode === "HUB" 
                        ? "text-white font-bold" 
                        : "text-secondary hover:text-white"
                    }`}
                  >
                    <span>Dialects</span>
                    <span className="text-[8px] opacity-50">(Hub)</span>
                  </button>
                  <button 
                    onClick={() => setMapMode("NODE")}
                    className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 relative z-10 ${
                      mapMode === "NODE" 
                        ? "text-red-accent font-bold" 
                        : "text-secondary hover:text-white"
                    }`}
                  >
                    <span>Vernaculars</span>
                    <span className="text-[8px] opacity-50">(Node)</span>
                  </button>
                  
                  {/* Sliding highlight */}
                  <div className={`absolute top-0 bottom-0 w-1/2 transition-transform duration-300 ease-out ${mapMode === "HUB" ? "translate-x-0 bg-white/10" : "translate-x-full bg-red-accent/20 border border-red-accent/30"}`} />
                </div>
              </div>

              {/* Data Card (Active Selection) */}
              <AnimatePresence mode="wait">
                {activeMarker ? (
                  <motion.div 
                    key={activeMarker.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-red-accent/30 bg-red-accent/5 p-6 space-y-4 relative overflow-hidden"
                  >
                    {/* Thematic Accent Line matching the dialect color */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50" style={{ backgroundColor: activeMarker.color }} />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-2xl uppercase text-white leading-tight">{activeMarker.name}</h4>
                        <p className="font-mono text-[10px] text-red-accent uppercase tracking-widest mt-1">Confirmed Target Region</p>
                      </div>
                      <span className={`font-mono text-[9px] px-2 py-1 uppercase tracking-widest border whitespace-nowrap ml-2 ${
                        activeMarker.networkStatus === "CRITICAL" ? "border-red-accent text-red-accent animate-pulse" :
                        activeMarker.networkStatus === "DEPLOYABLE" ? "border-green-500 text-green-500" :
                        "border-white/20 text-white/50"
                      }`}>
                        {activeMarker.networkStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-4">
                      <div>
                        <p className="font-mono text-[9px] text-secondary uppercase tracking-widest">Est. Speakers (TAM)</p>
                        <p className="font-display text-3xl text-white mt-1">{activeMarker.speakers}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-secondary uppercase tracking-widest">Cult. Engagement</p>
                        <p className="font-display text-3xl mt-1" style={{ color: activeMarker.color }}>{activeMarker.engagement}<span className="text-lg text-secondary">/100</span></p>
                      </div>
                    </div>

                    {/* Stacked Data Logic for overlapping regions */}
                    {activeMarker.secondaryDialects && (
                      <div className="pt-2">
                        <p className="font-mono text-[9px] text-secondary uppercase tracking-widest mb-2">Stacked Influence Zone</p>
                        {activeMarker.secondaryDialects.map((sd, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-l-2 pl-3" style={{ borderColor: activeMarker.color }}>
                            <span className="font-sans text-neutral-300">{sd.name}</span>
                            <span className="font-mono text-white/70">{sd.speakers}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button 
                      className="w-full py-3 mt-4 transition-colors font-mono text-xs font-bold uppercase tracking-widest text-black"
                      style={{ backgroundColor: activeMarker.color }}
                    >
                      Deploy Campaign
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            
            <div className="text-[10px] font-mono text-secondary uppercase tracking-widest flex items-center gap-2">
              <Database className="w-3 h-3" /> VERIFIED CENSUS DATA LIVE
            </div>
          </div>

          {/* Right Panel: The Map */}
          <div className="flex-1 relative bg-[#050505] overflow-hidden group cursor-move">
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 1200, center: [80, 22] }}
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                {/* Dialect Blend Filter - creates a soft, painted bleed effect */}
                <filter id="dialect-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="15" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <ZoomableGroup center={[80, 22]} zoom={1} minZoom={1} maxZoom={5}>
                {/* State Geographies */}
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#080808"
                        // Fade internal borders heavily in NODE mode to emphasize painted dialects
                        stroke={mapMode === "NODE" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.08)"}
                        strokeWidth={mapMode === "NODE" ? 0.2 : 0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#0a0a0a" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* The Linguistic Painted Zones */}
                {activeData.map((marker, index) => {
                  const isActive = activeMarker?.name === marker.name;
                  const isOpportunity = marker.networkStatus === "CRITICAL" || marker.networkStatus === "DEPLOYABLE";
                  
                  return (
                    <Marker 
                      key={index} 
                      coordinates={marker.coordinates}
                      onClick={() => setActiveMarker(marker)}
                    >
                      <g className="cursor-crosshair transition-transform duration-500" style={{ transform: isActive ? 'scale(1.05)' : 'scale(1)' }}>
                        
                        {/* The massive painted SVG blob overlapping states */}
                        {marker.spread && (
                          <ellipse 
                            rx={marker.spread.rx} 
                            ry={marker.spread.ry} 
                            transform={`rotate(${marker.spread.rotate})`}
                            fill={marker.color}
                            filter="url(#dialect-blur)"
                            // Screen blend mode ensures overlapping languages bleed together beautifully
                            style={{ 
                              mixBlendMode: "screen", 
                              opacity: isActive ? 0.8 : 0.4,
                              transition: "opacity 0.5s ease"
                            }}
                          />
                        )}
                        
                        {/* Central Node Indicator */}
                        <circle r={3} fill="#fff" opacity={isActive ? 1 : 0.5} />
                        
                        {/* Tactical ping only on opportunity zones that are active */}
                        {(isActive && isOpportunity) && (
                          <circle 
                            r={16} 
                            fill="none" 
                            stroke="#fff" 
                            strokeWidth={1.5} 
                            opacity={0.8} 
                            className="animate-ping" 
                          />
                        )}
                      </g>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
            
            {/* Legend / Overlay Text */}
            <div className="absolute top-6 right-6 font-display text-3xl text-white/10 uppercase tracking-[0.3em] pointer-events-none text-right">
              {mapMode === "HUB" ? "Macro State Level" : "Linguistic Zones"} <br/>
              <span className="text-sm tracking-widest font-mono text-red-accent/30">{mapMode === "NODE" ? "> 1,000,000 SPEAKERS" : "STATE DENSITY"}</span>
            </div>

            {/* Zoom Controls Hint */}
            <div className="absolute bottom-6 right-6 font-mono text-[10px] text-white/50 tracking-widest uppercase pointer-events-none bg-black/50 px-4 py-2 backdrop-blur-sm border border-white/5">
              Scroll to zoom • Drag to pan
            </div>
          </div>
          
        </div>
      </section>

      {/* Audience Intelligence Hub */}
      <section className="py-24 px-6 bg-black relative border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white hover-glitch" data-text="AUDIENCE INTELLIGENCE">AUDIENCE INTELLIGENCE</h2>
              <p className="text-secondary font-mono text-sm uppercase tracking-widest mt-2">
                VERIFIED MARKET DATA FOR {mapMode === "HUB" ? "REGIONAL MACRO-ZONES" : "LINGUISTIC MICRO-NODES"}
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-white/10 rounded-sm overflow-hidden brutalist-border">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-white/10 bg-black/50 font-mono text-xs uppercase tracking-widest text-neutral-400">
              <div className="col-span-4">Target Market</div>
              <div className="col-span-2">Est. TAM</div>
              <div className="col-span-4">Dense Urban Centers</div>
              <div className="col-span-2 text-right">Smartphone</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {activeData.map((marker, index) => (
                  <motion.div
                    key={marker.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 p-6 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => {
                      setActiveMarker(marker);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="col-span-1 md:col-span-4">
                      <div className="font-display text-2xl sm:text-xl text-white group-hover:text-red-accent transition-colors">
                        {marker.name}
                      </div>
                      <div className="text-[10px] font-mono text-secondary uppercase mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 inline-block rounded-full" style={{ backgroundColor: marker.color }} />
                        {marker.networkStatus}
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 font-mono text-xl md:text-lg text-white">
                      <span className="text-[10px] text-neutral-500 md:hidden block mb-1">EST. TAM</span>
                      {marker.speakers}
                    </div>

                    <div className="col-span-1 md:col-span-4 flex flex-wrap gap-2">
                      <span className="text-[10px] text-neutral-500 md:hidden block w-full mb-1">URBAN CENTERS</span>
                      {marker.majorCities.map(city => (
                        <span key={city} className="text-xs font-sans text-secondary bg-white/5 border border-white/10 px-2 py-1 rounded-sm">
                          {city}
                        </span>
                      ))}
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center md:items-end gap-2">
                      <span className="text-[10px] text-neutral-500 md:hidden block mb-1">SMARTPHONE PENETRATION</span>
                      <div className="font-mono text-lg text-white">
                        {marker.smartphonePenetration}%
                      </div>
                      <div className="w-full md:max-w-[100px] h-1.5 bg-black border border-white/10 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${marker.smartphonePenetration}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full"
                          style={{ backgroundColor: marker.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
