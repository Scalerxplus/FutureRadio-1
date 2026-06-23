"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/state_ut/india_state.json";

import { dialectMarkers, DialectMarker } from "@/lib/data";

const pricing_model = {
  HUB: {
    roiTitle: "Mass Network Penetration",
    roiDesc: "High-volume ad opportunities across a massive state-level footprint.",
    revenueShare: { local: "60%", hqLocal: "40%", network: "20%", hqNetwork: "80%" }
  },
  NODE: {
    roiTitle: "Hyper-Local Cultural Dominance",
    roiDesc: "Incentivized high revenue share for extreme micro-targeting and local direct sales.",
    revenueShare: { local: "80%", hqLocal: "20%", network: "30%", hqNetwork: "70%" }
  }
};

export default function PartnerPage() {
  const [filterState, setFilterState] = useState<"idle" | "rejected" | "approved">("idle");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  
  // Map Interactivity State
  const [activeTier, setActiveTier] = useState<"HUB" | "NODE">("NODE");
  const [activeMarker, setActiveMarker] = useState<typeof dialectMarkers[0]>(
    dialectMarkers.filter(m => m.type === "NODE")[0]
  );

  const activeDataList = dialectMarkers.filter(m => m.type === activeTier);
  const currentModel = pricing_model[activeTier];

  const handleTierChange = (tier: "HUB" | "NODE") => {
    setActiveTier(tier);
    setActiveMarker(dialectMarkers.filter(m => m.type === tier)[0]);
  };

  const handleFilter = (hasExperience: boolean) => {
    if (hasExperience) setFilterState("approved");
    else setFilterState("rejected");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "Future Radio Station Partner Application", ...data }),
      });
      if (res.ok) setFormStatus("success");
      else setFormStatus("error");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FFB6C1] text-black selection:bg-black selection:text-[#FFB6C1] font-sans overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative border-b-[6px] border-black bg-transparent">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#FF2E2E_0%,transparent_40%)] opacity-20 pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="text-black font-mono font-bold text-sm tracking-widest uppercase border-4 border-black px-4 py-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Regional Sovereignty
            </span>
            <h1 className="font-khand font-black text-6xl md:text-8xl tracking-widest uppercase text-black leading-[0.9]">
              OWN THE VOICE OF <br/> YOUR <span className="text-[#E5FF00] bg-black px-2 border-4 border-black inline-block transform -rotate-2 mt-2">REGION</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-sans max-w-4xl leading-relaxed border-l-8 border-brand-red pl-6 font-medium">
              Build the backbone of local media. You are not just launching a station; you are building a regional monopoly and owning your market&apos;s cultural gateway on Digital India&apos;s #1 network.
            </p>
          </motion.div>

          {/* Interactive Map Selection Engine */}
          <div className="bg-white border-4 border-brand-dark shadow-brutal relative overflow-hidden">
            
            {/* Top Selector Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b-4 border-brand-dark">
              
              {/* Tier Selector */}
              <div className="bg-white p-6 space-y-4 border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-brand-dark">
                <label className="font-mono font-bold text-xs text-brand-dark uppercase tracking-widest">1. Select Licensing Tier</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTierChange("HUB")}
                    className={`flex-1 p-3 font-mono font-bold text-xs uppercase tracking-widest transition-all border-2 border-brand-dark ${
                      activeTier === "HUB" ? "bg-brand-red text-white shadow-brutal-sm translate-y-[-2px]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Hub (State)
                  </button>
                  <button
                    onClick={() => handleTierChange("NODE")}
                    className={`flex-1 p-3 font-mono font-bold text-xs uppercase tracking-widest transition-all border-2 border-brand-dark ${
                      activeTier === "NODE" ? "bg-brand-red text-white shadow-brutal-sm translate-y-[-2px]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Node (Dialect)
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="bg-white p-6 space-y-4">
                <label className="font-mono font-bold text-xs text-brand-dark uppercase tracking-widest">2. Select Target Vernacular</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const dropdown = document.getElementById('custom-dropdown-menu');
                      const arrow = document.getElementById('custom-dropdown-arrow');
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                        if (arrow) arrow.classList.toggle('rotate-180');
                      }
                    }}
                    className="w-full text-left bg-brand-yellow border-4 border-brand-dark text-brand-dark font-display font-black text-2xl p-3 pr-10 focus:outline-none shadow-brutal-sm transition-all uppercase tracking-widest hover:translate-y-[-2px] hover:shadow-brutal"
                  >
                    {activeMarker.name}
                  </button>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg id="custom-dropdown-arrow" className="w-6 h-6 text-brand-dark transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  
                  {/* Custom Dropdown Menu */}
                  <div 
                    id="custom-dropdown-menu"
                    className="hidden absolute z-50 w-full mt-2 bg-white border-4 border-brand-dark shadow-brutal max-h-60 overflow-y-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {activeDataList.map(marker => (
                      <button
                        key={marker.name}
                        type="button"
                        onClick={() => {
                          setActiveMarker(marker);
                          const dropdown = document.getElementById('custom-dropdown-menu');
                          const arrow = document.getElementById('custom-dropdown-arrow');
                          if (dropdown) {
                            dropdown.classList.add('hidden');
                            if (arrow) arrow.classList.remove('rotate-180');
                          }
                        }}
                        className="w-full text-left px-6 py-4 text-brand-dark font-display font-bold text-xl uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors border-b-2 border-gray-200 last:border-0"
                      >
                        {marker.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map & Data Area */}
            <div className="flex flex-col lg:flex-row h-auto lg:h-[600px]">
              
              {/* Left Side: Map Render */}
              <div className="flex-1 relative bg-brand-dark overflow-hidden cursor-move border-b-4 lg:border-b-0 lg:border-r-4 border-brand-dark min-h-[400px]">
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 1200, center: [80, 22] }}
                  style={{ width: "100%", height: "100%" }}
                >
                  <defs>
                    <filter id="partner-dialect-blur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="15" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <ZoomableGroup center={[80, 22]} zoom={1.5} minZoom={1} maxZoom={5}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#1A1E2E"
                            stroke={activeTier === "NODE" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)"}
                            strokeWidth={activeTier === "NODE" ? 0.2 : 0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fill: "#24293D" },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>

                    {activeDataList.map((marker, index) => {
                      const isActive = activeMarker.name === marker.name;
                      return (
                        <Marker 
                          key={index} 
                          coordinates={marker.coordinates}
                          onClick={() => setActiveMarker(marker)}
                        >
                          <g className="cursor-pointer transition-transform duration-500" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                            {marker.spread && (
                              <ellipse 
                                rx={marker.spread.rx} 
                                ry={marker.spread.ry} 
                                transform={`rotate(${marker.spread.rotate})`}
                                fill={marker.color}
                                filter="url(#partner-dialect-blur)"
                                style={{ 
                                  mixBlendMode: "screen", 
                                  opacity: isActive ? 0.9 : 0.2,
                                  transition: "opacity 0.5s ease"
                                }}
                              />
                            )}
                            <circle r={4} fill="#fff" opacity={isActive ? 1 : 0.5} />
                            {isActive && (
                              <circle r={18} fill="none" stroke="#fff" strokeWidth={2} opacity={0.8} className="animate-ping" />
                            )}
                          </g>
                        </Marker>
                      );
                    })}
                  </ZoomableGroup>
                </ComposableMap>
                <div className="absolute bottom-4 left-4 font-mono font-bold text-[10px] text-brand-dark tracking-widest uppercase pointer-events-none bg-brand-yellow px-3 py-1 border-2 border-brand-dark shadow-brutal-sm">
                  Click Painted Zones to Select
                </div>
              </div>

              {/* Right Side: Overlay Data Card */}
              <div className="w-full lg:w-[450px] bg-white p-8 flex flex-col justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeMarker.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative z-10 space-y-8"
                  >
                    <div>
                      <h4 className="font-display font-black text-5xl uppercase leading-none text-brand-dark mb-2">{activeMarker.name}</h4>
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-[10px] px-2 py-1 uppercase tracking-widest border-2 border-brand-dark bg-gray-100">
                          {activeMarker.type} TIER
                        </span>
                        <span className="font-mono font-bold text-[10px] px-2 py-1 uppercase tracking-widest border-2 border-brand-dark text-white" style={{ backgroundColor: activeMarker.color }}>
                          {activeMarker.networkStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border-4 border-brand-dark bg-gray-50 shadow-brutal-sm">
                        <p className="font-mono font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Addressable Market (TAM)</p>
                        <p className="font-display font-black text-4xl text-brand-dark">{activeMarker.speakers}</p>
                      </div>
                      <div className="p-4 border-4 border-brand-dark bg-gray-50 shadow-brutal-sm">
                        <p className="font-mono font-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cultural Engagement Score</p>
                        <p className="font-display font-black text-4xl" style={{ color: activeMarker.color }}>{activeMarker.engagement} <span className="text-xl text-gray-400">/100</span></p>
                      </div>
                      
                      <div className="pt-4 border-t-2 border-gray-200">
                        <p className="font-mono font-bold text-xs text-brand-dark uppercase tracking-widest mb-2">ROI Protocol:</p>
                        <p className="text-gray-600 font-sans font-medium text-sm leading-relaxed">{currentModel.roiDesc}</p>
                      </div>
                    </div>

                    <button onClick={() => {
                      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
                    }} className="w-full text-white border-4 border-brand-dark font-black font-mono text-lg py-4 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all" style={{ backgroundColor: activeMarker.color }}>
                      LOCK TARGET & APPLY
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 1. The Evolution (Pain Points) */}
      <section className="py-24 px-6 relative bg-brand-red border-b-4 border-brand-dark">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 bg-white border-4 border-brand-dark p-8 shadow-brutal transform rotate-1 max-w-3xl mx-auto">
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-widest uppercase text-brand-dark">THE EVOLUTION</h2>
            <p className="text-gray-600 font-mono font-bold text-sm uppercase tracking-widest mt-2">The Old Radio Model is Broken</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border-4 border-brand-dark bg-white shadow-brutal hover:-translate-y-2 hover:shadow-none transition-all">
              <h3 className="font-display font-black text-xl text-brand-red uppercase tracking-widest mb-3">Declining Listeners</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">Negative growth curves and shrinking demographics are suffocating traditional terrestrial broadcasts.</p>
            </div>
            <div className="p-6 border-4 border-brand-dark bg-white shadow-brutal hover:-translate-y-2 hover:shadow-none transition-all">
              <h3 className="font-display font-black text-xl text-brand-red uppercase tracking-widest mb-3">High Infra Cost</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">Massive broadcast towers, physical studios, and bloated manpower payrolls aggressively drain profitability.</p>
            </div>
            <div className="p-6 border-4 border-brand-dark bg-white shadow-brutal hover:-translate-y-2 hover:shadow-none transition-all">
              <h3 className="font-display font-black text-xl text-brand-red uppercase tracking-widest mb-3">The Manual Grind</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">Endless hours wasted on manual music scheduling logs, physical FCT plotting, and tedious production tasks.</p>
            </div>
            <div className="p-6 border-4 border-brand-dark bg-white shadow-brutal hover:-translate-y-2 hover:shadow-none transition-all">
              <h3 className="font-display font-black text-xl text-brand-red uppercase tracking-widest mb-3">Limited Penetration</h3>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">Bound by analog frequencies and geographic restrictions, preventing true hyper-local to global scaling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Solution */}
      <section className="py-24 px-6 relative bg-white border-b-4 border-brand-dark overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-widest uppercase text-brand-dark">THE FUTURE RADIO SOLUTION</h2>
            <p className="text-brand-red font-mono font-bold text-sm uppercase tracking-widest mt-2">Complete Autonomy. Absolute Scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-4 border-brand-dark bg-brand-yellow shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="text-brand-dark font-display font-black text-5xl mb-6 opacity-30">01</div>
              <h3 className="font-display font-black text-2xl text-brand-dark uppercase tracking-widest mb-4">Live Engagement Scheduling</h3>
              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                Automated music and content scheduling driven entirely by live user engagement data. The algorithm dynamically adjusts to what retains listeners in real-time.
              </p>
            </div>
            <div className="p-8 border-4 border-brand-dark bg-brand-yellow shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="text-brand-dark font-display font-black text-5xl mb-6 opacity-30">02</div>
              <h3 className="font-display font-black text-2xl text-brand-dark uppercase tracking-widest mb-4">Algorithmic FCT Management</h3>
              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                Free Commercial Time is dynamically plotted, optimized, and served. Maximize revenue yield seamlessly without spending hours manually adjusting ad blocks.
              </p>
            </div>
            <div className="p-8 border-4 border-brand-dark bg-brand-yellow shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <div className="text-brand-dark font-display font-black text-5xl mb-6 opacity-30">03</div>
              <h3 className="font-display font-black text-2xl text-brand-dark uppercase tracking-widest mb-4">Client Servicing Portal</h3>
              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                A dedicated transparent portal for your advertisers. They can check live campaign dashboards and make secure campaign payments directly through the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Revenue Economics Dashboard */}
      <section className="py-24 px-6 border-b-4 border-brand-dark relative bg-gray-100">
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl md:text-6xl tracking-widest uppercase text-brand-dark">REVENUE ECONOMICS</h2>
            <p className="text-brand-red font-mono font-bold text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-3">
              Dynamic Split Mode: <span className="text-white font-bold px-3 py-1 border-2 border-brand-dark shadow-brutal-sm transform -rotate-2" style={{ backgroundColor: activeMarker.color }}>{activeTier} TIER ({activeMarker.name})</span>
            </p>
          </div>

          <div className="bg-white border-4 border-brand-dark shadow-brutal relative overflow-hidden transition-all duration-500">
            <div className="grid grid-cols-3 gap-4 p-6 border-b-4 border-brand-dark font-mono font-bold text-xs uppercase tracking-widest text-brand-dark bg-brand-yellow">
              <div>Revenue Stream</div>
              <div className="text-right">Platform Share</div>
              <div className="text-right text-brand-red">Partner Share</div>
            </div>

            <div className="divide-y-2 divide-gray-200">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`local-${activeTier}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-3 gap-4 p-6 items-center hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <h4 className="font-mono font-bold text-base text-brand-dark uppercase tracking-widest">Local Ads</h4>
                    <p className="text-[10px] font-mono font-bold text-gray-500 mt-1 hidden sm:block">Direct sales by Partner</p>
                  </div>
                  <div className="font-display font-black text-3xl sm:text-5xl text-gray-400 text-right">{currentModel.revenueShare.hqLocal}</div>
                  <div className="font-display font-black text-3xl sm:text-5xl text-right transition-all text-brand-red">{currentModel.revenueShare.local}</div>
                </motion.div>
                
                <motion.div 
                  key={`network-${activeTier}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-3 gap-4 p-6 items-center hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <h4 className="font-mono font-bold text-base text-brand-dark uppercase tracking-widest">Network Ads</h4>
                    <p className="text-[10px] font-mono font-bold text-gray-500 mt-1 hidden sm:block">National agency deals</p>
                  </div>
                  <div className="font-display font-black text-3xl sm:text-4xl text-brand-dark text-right">{currentModel.revenueShare.hqNetwork}</div>
                  <div className="font-display font-black text-3xl sm:text-4xl text-gray-400 text-right">{currentModel.revenueShare.network}</div>
                </motion.div>
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-4 p-6 items-center bg-gray-100">
                <div>
                  <h4 className="font-mono font-bold text-base text-gray-600 uppercase tracking-widest">Subscription</h4>
                  <p className="text-[10px] font-mono font-bold text-gray-500 mt-1 hidden sm:block">Future premium tier</p>
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-gray-600 text-right">60%</div>
                <div className="font-display font-black text-2xl sm:text-3xl text-gray-600 text-right">40%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of Work */}
      <section className="py-24 px-6 border-b-4 border-brand-dark bg-brand-yellow relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-4xl md:text-5xl tracking-widest uppercase text-brand-dark">SCOPE OF WORK</h2>
            <p className="text-brand-dark font-mono font-bold text-sm uppercase tracking-widest mt-4">
              The Protocol: Who Does What
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-brand-dark shadow-brutal">
            
            <div className="bg-white p-8 md:p-12 border-b-4 md:border-b-0 md:border-r-4 border-brand-dark">
              <h3 className="font-display font-black text-3xl tracking-widest uppercase text-brand-dark mb-8 border-b-4 border-brand-dark pb-4">
                What Future Radio<br/><span className="text-gray-500 text-xl">Deploys</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="text-brand-red font-black mt-1">»</div>
                  <div>
                    <h4 className="font-mono font-bold text-sm text-brand-dark uppercase tracking-widest mb-1">Autonomous Infrastructure</h4>
                    <p className="text-gray-700 font-sans font-medium text-sm leading-relaxed">Full access to the Radio 3.0 SaaS cloud platform, auto-scheduling algorithms, and streaming server bandwidth.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-brand-red font-black mt-1">»</div>
                  <div>
                    <h4 className="font-mono font-bold text-sm text-brand-dark uppercase tracking-widest mb-1">Music & Content Licensing</h4>
                    <p className="text-gray-700 font-sans font-medium text-sm leading-relaxed">We handle the legal overhead, providing a vast catalog of cleared regional music and AI-generated content blocks.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-brand-dark p-8 md:p-12">
              <h3 className="font-display font-black text-3xl tracking-widest uppercase text-white mb-8 border-b-4 border-white pb-4">
                What You<br/><span className="text-brand-red text-xl">Command</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="text-brand-red font-black mt-1">»</div>
                  <div>
                    <h4 className="font-mono font-bold text-sm text-white uppercase tracking-widest mb-1">Hyper-Local Sales</h4>
                    <p className="text-gray-400 font-sans font-medium text-sm leading-relaxed">You own the street. Pitch local businesses, close direct ad deals, and keep up to 80% of the revenue.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-brand-red font-black mt-1">»</div>
                  <div>
                    <h4 className="font-mono font-bold text-sm text-white uppercase tracking-widest mb-1">Cultural Curation</h4>
                    <p className="text-gray-400 font-sans font-medium text-sm leading-relaxed">You manage the vibe. Hire local RJs, curate regional folk music, and ensure the broadcast bleeds local culture.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Application Form with Hard Filter */}
      <section className="py-24 px-6 relative bg-white" id="apply">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-5xl tracking-widest uppercase text-brand-dark">BECOME A PARTNER</h2>
            <div className="w-24 h-2 bg-brand-red mx-auto mt-6" />
          </div>

          <AnimatePresence mode="wait">
            {filterState === "idle" && (
              <motion.div
                key="filter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-4 border-brand-dark p-8 md:p-12 text-center shadow-brutal relative overflow-hidden"
              >
                <h3 className="font-display font-black text-3xl tracking-widest uppercase mb-4 text-brand-dark">Experience Verification</h3>
                <p className="text-gray-700 font-mono font-bold text-sm uppercase mb-12">
                  Do you have a minimum of 2 years professional radio broadcasting experience? (FM, AIR, or Community Radio)
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => handleFilter(false)} className="border-4 border-brand-dark bg-gray-200 text-brand-dark font-bold font-mono py-3 px-6 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-widest">
                    NO EXPERIENCE
                  </button>
                  <button onClick={() => handleFilter(true)} className="border-4 border-brand-dark bg-brand-red text-white font-bold font-mono py-3 px-6 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-widest">
                    YES, I HAVE EXPERIENCE
                  </button>
                </div>
              </motion.div>
            )}

            {filterState === "rejected" && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-dark border-4 border-brand-red p-8 md:p-12 text-center shadow-brutal"
              >
                <h3 className="font-display font-black text-4xl tracking-widest uppercase text-brand-red mb-4">APPLICATION DECLINED</h3>
                <p className="text-gray-300 font-sans font-medium leading-relaxed max-w-md mx-auto">
                  The Station Partner program is strictly restricted to industry professionals with proven broadcast experience. We appreciate your interest! Check out our Creator Program instead.
                </p>
                <button onClick={() => setFilterState("idle")} className="mt-8 border-2 border-white text-white font-mono font-bold py-2 px-6 hover:bg-white hover:text-brand-dark transition-colors uppercase tracking-widest">
                  RETURN
                </button>
              </motion.div>
            )}

            {filterState === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-brand-dark p-8 md:p-12 relative shadow-brutal"
              >
                {formStatus === "success" ? (
                  <div className="text-center py-12">
                    <div className="text-brand-red font-display font-black text-6xl mb-6">✓</div>
                    <h4 className="font-display font-black text-4xl tracking-widest uppercase text-brand-dark mb-4">APPLICATION RECEIVED</h4>
                    <p className="text-gray-600 font-mono font-bold text-sm uppercase">Our network team will review your application. Stand by.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <span className="text-[10px] font-mono font-bold text-brand-red tracking-widest uppercase border-2 border-brand-red px-2 py-0.5 bg-red-50">
                        VERIFICATION SUCCESSFUL
                      </span>
                    </div>

                    <input type="hidden" name="language_tier" value={`${activeTier} - ${activeMarker.name}`} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">Full Name</label>
                        <input name="name" required placeholder="John Doe" className="w-full bg-gray-50 border-2 border-brand-dark p-3 text-brand-dark focus:border-brand-red focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">Target Territory</label>
                        <input name="city" required defaultValue={activeMarker.name} readOnly className="w-full bg-gray-200 border-2 border-brand-dark p-3 text-brand-dark opacity-70 cursor-not-allowed" />
                        <p className="text-[10px] text-brand-red font-mono font-bold">Locked from Map Selection</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">Email Address</label>
                        <input name="email" required type="email" placeholder="hello@example.com" className="w-full bg-gray-50 border-2 border-brand-dark p-3 text-brand-dark focus:border-brand-red focus:outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">Phone Number</label>
                        <input name="phone" required type="tel" placeholder="+91..." className="w-full bg-gray-50 border-2 border-brand-dark p-3 text-brand-dark focus:border-brand-red focus:outline-none transition-colors" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">Broadcast Experience</label>
                      <input name="experience" required placeholder="Ex: RJ at Red FM (3 Years)" className="w-full bg-gray-50 border-2 border-brand-dark p-3 text-brand-dark focus:border-brand-red focus:outline-none transition-colors" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">LinkedIn Profile (Mandatory)</label>
                      <input name="linkedin" required type="url" placeholder="https://linkedin.com/in/..." className="w-full bg-gray-50 border-2 border-brand-dark p-3 text-brand-dark focus:border-brand-red focus:outline-none transition-colors" />
                    </div>
                    
                    {formStatus === "error" && (
                      <p className="text-white text-xs font-mono font-bold tracking-widest uppercase text-center border-4 border-brand-dark p-3 bg-brand-red shadow-brutal-sm">
                        Error transmitting data. Check connection and retry.
                      </p>
                    )}

                    <button type="submit" disabled={formStatus === "submitting"} className="w-full mt-8 border-4 border-brand-dark bg-brand-yellow text-brand-dark font-black font-mono text-lg py-4 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase tracking-widest">
                      {formStatus === "submitting" ? "PROCESSING..." : `SUBMIT APPLICATION FOR ${activeMarker.name.toUpperCase()}`}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
}
