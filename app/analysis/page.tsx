"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Database, Activity } from "lucide-react";

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
    <main className="flex min-h-screen flex-col bg-brand-yellow text-brand-dark font-sans selection:bg-brand-red selection:text-white overflow-hidden">
      <Header />
      
      {/* Dashboard Container */}
      <section className="pt-24 min-h-screen flex flex-col relative border-b-4 border-brand-dark bg-white">
        
        <div className="flex-1 w-full flex flex-col lg:flex-row relative z-20">
          
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-[450px] border-r-4 border-brand-dark bg-brand-yellow p-8 flex flex-col justify-between shrink-0 shadow-brutal z-10 relative">
            <div className="space-y-8">
              <div>
                <span className="text-brand-dark font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-4 bg-white border-2 border-brand-dark w-fit px-3 py-1 shadow-brutal-sm">
                  <Activity className="w-4 h-4 text-brand-red" /> LIVE_DATA_FEED
                </span>
                <h1 className="font-display text-4xl tracking-widest uppercase text-brand-dark font-black">
                  AUDIENCE <br/> <span className="text-brand-red">INSIGHTS</span>
                </h1>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-xs text-brand-dark font-bold uppercase tracking-[0.2em] border-b-2 border-brand-dark pb-2">
                  Select Regional Metric
                </p>
                <div className="flex bg-white border-4 border-brand-dark p-1 w-full relative shadow-brutal-sm">
                  <button 
                    onClick={() => setMapMode("HUB")}
                    className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 relative z-10 ${
                      mapMode === "HUB" 
                        ? "text-white" 
                        : "text-brand-dark hover:bg-gray-100"
                    }`}
                  >
                    <span>Dialects</span>
                    <span className="text-[10px] opacity-70">(Macro)</span>
                  </button>
                  <button 
                    onClick={() => setMapMode("NODE")}
                    className={`flex-1 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all text-center flex flex-col items-center justify-center gap-1 relative z-10 ${
                      mapMode === "NODE" 
                        ? "text-white" 
                        : "text-brand-dark hover:bg-gray-100"
                    }`}
                  >
                    <span>Vernaculars</span>
                    <span className="text-[10px] opacity-70">(Micro)</span>
                  </button>
                  
                  {/* Sliding highlight */}
                  <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] transition-transform duration-300 ease-out border-2 border-brand-dark ${mapMode === "HUB" ? "translate-x-0 bg-brand-dark" : "translate-x-full bg-brand-red"}`} />
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
                    className="border-4 border-brand-dark bg-white p-6 space-y-4 relative shadow-brutal"
                  >
                    {/* Thematic Accent Line matching the dialect color */}
                    <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: activeMarker.color }} />
                    
                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <h4 className="font-display text-3xl font-black uppercase text-brand-dark leading-tight">{activeMarker.name}</h4>
                        <p className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Active Broadcast Zone</p>
                      </div>
                      <span className={`font-mono font-bold text-[9px] px-2 py-1 uppercase tracking-widest border-2 whitespace-nowrap ml-2 ${
                        activeMarker.networkStatus === "CRITICAL" ? "border-brand-red bg-brand-red text-white animate-pulse" :
                        activeMarker.networkStatus === "DEPLOYABLE" ? "border-green-600 bg-green-100 text-green-700" :
                        "border-gray-300 bg-gray-100 text-gray-500"
                      }`}>
                        {activeMarker.networkStatus}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-b-2 border-gray-200 pb-4 pl-2">
                      <div>
                        <p className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">Est. Listeners (TAM)</p>
                        <p className="font-display text-3xl font-bold text-brand-dark mt-1">{activeMarker.speakers}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cultural Index</p>
                        <p className="font-display text-3xl font-bold mt-1" style={{ color: activeMarker.color }}>{activeMarker.engagement}<span className="text-lg text-gray-400">/100</span></p>
                      </div>
                    </div>

                    {/* Stacked Data Logic for overlapping regions */}
                    {activeMarker.secondaryDialects && (
                      <div className="pt-2 pl-2">
                        <p className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Stacked Dialect Zones</p>
                        {activeMarker.secondaryDialects.map((sd, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-l-4 pl-3 mb-2" style={{ borderColor: activeMarker.color }}>
                            <span className="font-sans font-bold text-brand-dark">{sd.name}</span>
                            <span className="font-mono text-gray-600">{sd.speakers}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
            
            <div className="text-[10px] font-mono font-bold text-brand-dark uppercase tracking-widest flex items-center gap-2 bg-white border-2 border-brand-dark px-3 py-2 w-fit mt-8 shadow-brutal-sm">
              <Database className="w-4 h-4 text-brand-red" /> VERIFIED CENSUS DATA LIVE
            </div>
          </div>

          {/* Right Panel: The Map */}
          <div className="flex-1 relative bg-brand-dark overflow-hidden group cursor-move">
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 1200, center: [80, 22] }}
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <filter id="dialect-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
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
                        fill="#1A1E2E"
                        stroke={mapMode === "NODE" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}
                        strokeWidth={mapMode === "NODE" ? 0.3 : 0.8}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: "#24293D" },
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
                      <g className="cursor-pointer transition-transform duration-500" style={{ transform: isActive ? 'scale(1.05)' : 'scale(1)' }}>
                        
                        {/* Painted SVG blob */}
                        {marker.spread && (
                          <ellipse 
                            rx={marker.spread.rx} 
                            ry={marker.spread.ry} 
                            transform={`rotate(${marker.spread.rotate})`}
                            fill={marker.color}
                            filter="url(#dialect-blur)"
                            style={{ 
                              mixBlendMode: "screen", 
                              opacity: isActive ? 0.9 : 0.4,
                              transition: "opacity 0.5s ease"
                            }}
                          />
                        )}
                        
                        {/* Central Node Indicator */}
                        <circle r={isActive ? 6 : 4} fill="#fff" opacity={isActive ? 1 : 0.8} />
                        <circle r={isActive ? 10 : 0} fill="none" stroke="#fff" strokeWidth={2} opacity={isActive ? 1 : 0} />
                        
                        {/* Tactical ping only on opportunity zones that are active */}
                        {(isActive && isOpportunity) && (
                          <circle 
                            r={24} 
                            fill="none" 
                            stroke="#fff" 
                            strokeWidth={2} 
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
            <div className="absolute top-6 right-6 font-display font-black text-4xl text-white/20 uppercase tracking-widest pointer-events-none text-right">
              {mapMode === "HUB" ? "Macro State Level" : "Linguistic Zones"} <br/>
              <span className="text-lg tracking-widest font-mono text-brand-yellow/60">{mapMode === "NODE" ? "> 1M SPEAKERS" : "STATE DENSITY"}</span>
            </div>

            {/* Zoom Controls Hint */}
            <div className="absolute bottom-6 right-6 font-mono text-xs font-bold text-brand-dark tracking-widest uppercase pointer-events-none bg-brand-yellow px-4 py-2 border-2 border-brand-dark shadow-brutal-sm">
              Scroll to zoom • Drag to pan
            </div>
          </div>
          
        </div>
      </section>

      {/* Audience Intelligence Hub */}
      <section className="py-24 px-6 bg-brand-red relative border-b-4 border-brand-dark">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 bg-white border-4 border-brand-dark p-8 shadow-brutal transform -rotate-1">
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl tracking-widest uppercase text-brand-dark">MARKET INTELLIGENCE</h2>
              <p className="text-gray-600 font-mono text-sm font-bold uppercase tracking-widest mt-2">
                VERIFIED MARKET DATA FOR {mapMode === "HUB" ? "REGIONAL MACRO-ZONES" : "LINGUISTIC MICRO-NODES"}
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-brand-dark shadow-brutal">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b-4 border-brand-dark bg-gray-100 font-mono text-xs font-bold uppercase tracking-widest text-brand-dark">
              <div className="col-span-4">Target Market</div>
              <div className="col-span-2">Est. TAM</div>
              <div className="col-span-4">Dense Urban Centers</div>
              <div className="col-span-2 text-right">Smartphone Penetration</div>
            </div>

            {/* Table Body */}
            <div className="divide-y-2 divide-gray-200">
              <AnimatePresence mode="popLayout">
                {activeData.map((marker, index) => (
                  <motion.div
                    key={marker.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 p-6 items-center hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => {
                      setActiveMarker(marker);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="col-span-1 md:col-span-4">
                      <div className="font-display font-bold text-2xl sm:text-xl text-brand-dark group-hover:text-brand-red transition-colors">
                        {marker.name}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-gray-500 uppercase mt-1 flex items-center gap-2">
                        <span className="w-3 h-3 inline-block rounded-full border border-brand-dark" style={{ backgroundColor: marker.color }} />
                        {marker.networkStatus}
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 font-mono font-bold text-xl md:text-lg text-brand-dark">
                      <span className="text-[10px] text-gray-500 md:hidden block mb-1 uppercase">EST. TAM</span>
                      {marker.speakers}
                    </div>

                    <div className="col-span-1 md:col-span-4 flex flex-wrap gap-2">
                      <span className="text-[10px] text-gray-500 md:hidden block w-full mb-1 uppercase">URBAN CENTERS</span>
                      {marker.majorCities.map(city => (
                        <span key={city} className="text-xs font-bold font-sans text-brand-dark bg-brand-yellow border-2 border-brand-dark px-2 py-1 shadow-brutal-sm">
                          {city}
                        </span>
                      ))}
                    </div>

                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center md:items-end gap-2">
                      <span className="text-[10px] text-gray-500 md:hidden block mb-1 uppercase">SMARTPHONE PENETRATION</span>
                      <div className="font-mono font-bold text-lg text-brand-dark">
                        {marker.smartphonePenetration}%
                      </div>
                      <div className="w-full md:max-w-[100px] h-3 bg-gray-200 border-2 border-brand-dark overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${marker.smartphonePenetration}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full border-r-2 border-brand-dark"
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
      
      <Footer />
    </main>
  );
}
