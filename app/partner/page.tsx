"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

  // Two-way binding: When tier changes, default to first item in that tier
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
        body: JSON.stringify({ source: "Station Partner Application", ...data }),
      });
      if (res.ok) setFormStatus("success");
      else setFormStatus("error");
    } catch {
      setFormStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-red-accent selection:text-white overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative border-b border-white/5 bg-black">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(192,57,43,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="text-red-accent font-mono text-sm tracking-widest uppercase border border-red-accent/30 px-3 py-1 bg-red-accent/5">
              Market Sovereignty
            </span>
            <h1 className="font-display text-5xl md:text-7xl tracking-widest uppercase text-white leading-[0.9] hover-glitch" data-text="OWN THE CODE">
              OWN THE CODE OF <br/> YOUR <span className="text-red-accent">REGION</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-sans max-w-4xl leading-relaxed border-l-4 border-red-accent pl-6">
              Build the backbone of local media. The frequency is coded now. You are not just launching a station; you are building a regional monopoly and owning your market&apos;s cultural data gateway.
            </p>
          </motion.div>

          {/* Interactive Map Selection Engine */}
          <div className="bg-neutral-950 border border-white/10 rounded-sm shadow-2xl relative overflow-hidden brutalist-border">
            
            {/* Top Selector Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-b border-white/10">
              
              {/* Tier Selector */}
              <div className="bg-neutral-950 p-6 space-y-4">
                <label className="font-mono text-xs text-secondary uppercase tracking-widest">1. Select Licensing Tier</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTierChange("HUB")}
                    className={`flex-1 p-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                      activeTier === "HUB" ? "bg-red-accent text-white font-bold border border-red-accent" : "bg-black text-secondary border border-white/10 hover:border-white/30"
                    }`}
                  >
                    Hub (Regional)
                  </button>
                  <button
                    onClick={() => handleTierChange("NODE")}
                    className={`flex-1 p-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                      activeTier === "NODE" ? "bg-red-accent text-white font-bold border border-red-accent" : "bg-black text-secondary border border-white/10 hover:border-white/30"
                    }`}
                  >
                    Node (Dialect)
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="bg-neutral-950 p-6 space-y-4">
                <label className="font-mono text-xs text-secondary uppercase tracking-widest">2. Select Target Vernacular</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      // We toggle a local state for the dropdown. Let's add it to the component.
                      // Wait, I can't add state here easily without changing the whole file or just adding it to the top.
                      // Let's use a simpler approach: a details/summary trick, or just add the state to the component.
                      const dropdown = document.getElementById('custom-dropdown-menu');
                      const arrow = document.getElementById('custom-dropdown-arrow');
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                        if (arrow) arrow.classList.toggle('rotate-180');
                      }
                    }}
                    className="w-full text-left bg-black border border-white/20 text-white font-display text-xl p-3 pr-10 focus:outline-none focus:border-red-accent transition-colors uppercase tracking-widest"
                  >
                    {activeMarker.name}
                  </button>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg id="custom-dropdown-arrow" className="w-4 h-4 text-red-accent transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  
                  {/* Custom Dropdown Menu */}
                  <div 
                    id="custom-dropdown-menu"
                    className="hidden absolute z-50 w-full mt-1 bg-black border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-60 overflow-y-auto"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <style>{`
                      #custom-dropdown-menu::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
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
                        className="w-full text-left px-4 py-3 text-secondary font-display text-lg uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
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
              <div className="flex-1 relative bg-[#050505] overflow-hidden cursor-move border-b lg:border-b-0 lg:border-r border-white/10 min-h-[400px]">
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
                            fill="#080808"
                            stroke={activeTier === "NODE" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.08)"}
                            strokeWidth={activeTier === "NODE" ? 0.2 : 0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fill: "#0a0a0a" },
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
                            <circle r={3} fill="#fff" opacity={isActive ? 1 : 0.3} />
                            {isActive && (
                              <circle r={16} fill="none" stroke="#fff" strokeWidth={1.5} opacity={0.8} className="animate-ping" />
                            )}
                          </g>
                        </Marker>
                      );
                    })}
                  </ZoomableGroup>
                </ComposableMap>
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-white/50 tracking-widest uppercase pointer-events-none bg-black/50 px-3 py-1 border border-white/5 backdrop-blur-sm">
                  Click Painted Zones to Select
                </div>
              </div>

              {/* Right Side: Overlay Data Card */}
              <div className="w-full lg:w-[400px] bg-neutral-950 p-8 flex flex-col justify-center relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeMarker.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative z-10 space-y-8"
                  >
                    <div>
                      <h4 className="font-display text-4xl uppercase leading-tight text-white mb-2">{activeMarker.name}</h4>
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] px-2 py-1 uppercase tracking-widest border border-white/20 text-white/50">
                          {activeMarker.type} TIER
                        </span>
                        <span className="font-mono text-[10px] px-2 py-1 uppercase tracking-widest border" style={{ borderColor: activeMarker.color, color: activeMarker.color }}>
                          {activeMarker.networkStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 border border-white/5 bg-black/50">
                        <p className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-1">Total Addressable Market (TAM)</p>
                        <p className="font-display text-5xl text-white">{activeMarker.speakers}</p>
                      </div>
                      <div className="p-4 border border-white/5 bg-black/50">
                        <p className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-1">Cultural Engagement Score</p>
                        <p className="font-display text-5xl" style={{ color: activeMarker.color }}>{activeMarker.engagement} <span className="text-xl text-secondary">/100</span></p>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        <p className="font-mono text-xs text-white uppercase tracking-widest mb-2">ROI Protocol:</p>
                        <p className="text-secondary font-sans text-sm leading-relaxed">{currentModel.roiDesc}</p>
                      </div>
                    </div>

                    <Button onClick={() => {
                      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
                    }} className="w-full text-black font-bold font-mono tracking-widest" style={{ backgroundColor: activeMarker.color }}>
                      LOCK TARGET & APPLY
                    </Button>
                  </motion.div>
                </AnimatePresence>
                
                {/* Background ambient glow matching the active language color */}
                <div 
                  className="absolute -bottom-32 -right-32 w-96 h-96 blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000" 
                  style={{ backgroundColor: activeMarker.color }} 
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 1. The Evolution (Pain Points) */}
      <section className="py-24 px-6 relative bg-neutral-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white hover-glitch" data-text="THE EVOLUTION">THE EVOLUTION</h2>
            <p className="text-red-accent font-mono text-sm uppercase tracking-widest mt-2">The Old Radio Model is Broken</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border border-red-accent/20 bg-black hover:border-red-accent/50 transition-colors">
              <h3 className="font-mono text-lg text-red-accent uppercase tracking-widest mb-3 border-b border-red-accent/20 pb-2">Declining Listenership</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">Negative growth curves and shrinking demographics are suffocating traditional terrestrial broadcasts.</p>
            </div>
            <div className="p-6 border border-red-accent/20 bg-black hover:border-red-accent/50 transition-colors">
              <h3 className="font-mono text-lg text-red-accent uppercase tracking-widest mb-3 border-b border-red-accent/20 pb-2">High Infra Cost</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">Massive broadcast towers, physical studios, and bloated manpower payrolls aggressively drain profitability.</p>
            </div>
            <div className="p-6 border border-red-accent/20 bg-black hover:border-red-accent/50 transition-colors">
              <h3 className="font-mono text-lg text-red-accent uppercase tracking-widest mb-3 border-b border-red-accent/20 pb-2">The Manual Grind</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">Endless hours wasted on manual music scheduling logs, physical FCT plotting, and tedious production tasks.</p>
            </div>
            <div className="p-6 border border-red-accent/20 bg-black hover:border-red-accent/50 transition-colors">
              <h3 className="font-mono text-lg text-red-accent uppercase tracking-widest mb-3 border-b border-red-accent/20 pb-2">Limited Penetration</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">Bound by analog frequencies and geographic restrictions, preventing true hyper-local to global scaling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Solution (MafiaOS) */}
      <section className="py-24 px-6 relative bg-black border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white hover-glitch" data-text="THE MAFIAOS SOLUTION">THE MAFIAOS SOLUTION</h2>
            <p className="text-secondary font-mono text-sm uppercase tracking-widest mt-2">Complete Autonomy. Absolute Scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-white/10 bg-neutral-950 brutalist-border group hover:border-white/30 transition-colors">
              <div className="text-white font-display text-4xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">01</div>
              <h3 className="font-mono text-lg text-white uppercase tracking-widest mb-4">Live Engagement Scheduling</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">
                Automated music and content scheduling driven entirely by live user engagement data. The algorithm dynamically adjusts to what retains listeners in real-time, removing the guesswork and enhancing quality.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-neutral-950 brutalist-border group hover:border-white/30 transition-colors">
              <div className="text-white font-display text-4xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">02</div>
              <h3 className="font-mono text-lg text-white uppercase tracking-widest mb-4">Algorithmic FCT Management</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">
                Free Commercial Time is dynamically plotted, optimized, and served. Maximize revenue yield seamlessly without spending hours manually adjusting ad blocks and tedious client logs.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-neutral-950 brutalist-border group hover:border-white/30 transition-colors">
              <div className="text-white font-display text-4xl mb-6 opacity-50 group-hover:opacity-100 transition-opacity">03</div>
              <h3 className="font-mono text-lg text-white uppercase tracking-widest mb-4">Client Servicing Portal</h3>
              <p className="text-sm text-secondary font-sans leading-relaxed">
                A dedicated transparent portal for your advertisers. They can check live campaign dashboards, listen to their ad audio, and make secure campaign payments directly through the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Aha! Moment */}
      <section className="py-24 px-6 relative bg-red-accent text-black border-b border-black">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <h2 className="font-display text-5xl md:text-7xl tracking-widest uppercase mb-4">The 30-Minute Station</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div className="bg-black/10 p-8 border border-black/20 relative">
              <div className="absolute top-0 right-0 bg-black text-white font-mono text-[10px] uppercase px-2 py-1">The Old Grind</div>
              <h3 className="font-mono text-xl uppercase tracking-widest mb-4 border-b border-black/20 pb-2">Manual Labor</h3>
              <p className="font-sans font-medium text-black/80 leading-relaxed">
                8+ hours of daily manual tasks. Sifting through music logs, editing promos, plotting FCT manually, and dealing with infrastructure breakdowns. No time left to actually grow the business.
              </p>
            </div>
            <div className="bg-black text-white p-8 border-4 border-black brutalist-border shadow-[10px_10px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute top-0 right-0 bg-red-accent text-black font-mono text-[10px] uppercase px-2 py-1">Media Mafias Advantage</div>
              <h3 className="font-mono text-xl uppercase tracking-widest mb-4 border-b border-white/20 pb-2 text-red-accent">Complete Autonomy</h3>
              <p className="font-sans leading-relaxed text-secondary">
                <span className="text-white font-bold">30 minutes of strategic input.</span> MafiaOS handles the execution. This extreme automation gives you your time back. Time you will use for high-leverage growth: <span className="text-white font-bold">Marketing, Relationship Building, Sales, and expanding your Creator Network.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Revenue Economics Dashboard */}
      <section className="py-32 px-6 border-b border-white/5 relative bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-red-accent/50 to-transparent" />
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl tracking-widest uppercase text-white hover-glitch" data-text="REVENUE ECONOMICS">REVENUE ECONOMICS</h2>
            <p className="text-secondary font-mono text-sm uppercase tracking-widest mt-4 flex items-center justify-center gap-3">
              Dynamic Split Mode: <span className="text-black font-bold px-3 py-1" style={{ backgroundColor: activeMarker.color }}>{activeTier} TIER ({activeMarker.name})</span>
            </p>
          </div>

          <div className="bg-neutral-950 border border-white/10 p-1 rounded-sm shadow-2xl brutalist-border relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] pointer-events-none transition-colors" style={{ backgroundColor: activeMarker.color, opacity: 0.2 }} />
            
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/5 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-secondary bg-black/50">
              <div>Revenue Stream</div>
              <div className="text-right">HQ Share</div>
              <div className="text-right" style={{ color: activeMarker.color }}>Partner Share</div>
            </div>

            <div className="divide-y divide-white/5">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`local-${activeTier}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-3 gap-4 p-6 items-center hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest">Local Ads</h4>
                    <p className="text-[10px] font-mono text-secondary mt-1 hidden sm:block">Direct sales by Partner</p>
                  </div>
                  <div className="font-display text-3xl sm:text-5xl text-secondary text-right transition-colors group-hover:text-white">{currentModel.revenueShare.hqLocal}</div>
                  <div className="font-display text-3xl sm:text-5xl text-right transition-all" style={{ color: activeMarker.color, textShadow: `0 0 10px ${activeMarker.color}40` }}>{currentModel.revenueShare.local}</div>
                </motion.div>
                
                <motion.div 
                  key={`network-${activeTier}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-3 gap-4 p-6 items-center hover:bg-white/5 transition-colors group"
                >
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest">Network Ads</h4>
                    <p className="text-[10px] font-mono text-secondary mt-1 hidden sm:block">National agency deals by HQ</p>
                  </div>
                  <div className="font-display text-3xl sm:text-4xl text-white text-right">{currentModel.revenueShare.hqNetwork}</div>
                  <div className="font-display text-3xl sm:text-4xl text-secondary text-right group-hover:text-white transition-colors">{currentModel.revenueShare.network}</div>
                </motion.div>
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-4 p-6 items-center hover:bg-white/5 transition-colors group opacity-60 hover:opacity-100">
                <div>
                  <h4 className="font-mono text-sm text-white uppercase tracking-widest">Subscription</h4>
                  <p className="text-[10px] font-mono text-secondary mt-1 hidden sm:block">Future premium tier</p>
                </div>
                <div className="font-display text-2xl sm:text-3xl text-white text-right">60%</div>
                <div className="font-display text-2xl sm:text-3xl text-white text-right">40%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of Work / Division of Labor */}
      <section className="py-24 px-6 border-b border-white/5 bg-neutral-950 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white hover-glitch" data-text="SCOPE OF WORK">SCOPE OF WORK</h2>
            <p className="text-secondary font-mono text-sm uppercase tracking-widest mt-4">
              The Protocol: Who Does What
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10 brutalist-border">
            
            {/* Media Mafias Side */}
            <div className="bg-black p-8 md:p-12 relative group hover:bg-neutral-950 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white/50 transition-colors" />
              <h3 className="font-display text-3xl tracking-widest uppercase text-white mb-8 border-b border-white/10 pb-4">
                What Media Mafias<br/><span className="text-secondary text-xl">Deploys</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="text-white mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">MafiaOS Infrastructure</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">Full access to the Radio 3.0 SaaS cloud platform, auto-scheduling algorithms, and streaming server bandwidth.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-white mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Music & Content Licensing</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">We handle the legal overhead, providing a vast catalog of cleared regional music and AI-generated content blocks.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-white mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Network Ad Injections</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">Programmatic routing of national brand campaigns directly into your station's free commercial time (FCT).</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-white mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Listener Applications</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">Your station is instantly broadcasted on the global Media Mafias consumer app and web portals.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Partner Side */}
            <div className="bg-black p-8 md:p-12 relative group hover:bg-neutral-950 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-accent/30 group-hover:bg-red-accent transition-colors" />
              <h3 className="font-display text-3xl tracking-widest uppercase text-white mb-8 border-b border-white/10 pb-4">
                What You<br/><span className="text-red-accent text-xl">Command</span>
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="text-red-accent mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Hyper-Local Sales</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">You own the street. Pitch local businesses, close direct ad deals, and keep up to 80% of the revenue.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-red-accent mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Cultural Curation</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">You manage the vibe. Hire local RJs, curate regional folk music, and ensure the broadcast bleeds local culture.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-red-accent mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Ground Marketing</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">Execute local PR, events, and billboard campaigns to dominate your dialect's listener acquisition.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="text-red-accent mt-1">»</div>
                  <div>
                    <h4 className="font-mono text-sm text-white uppercase tracking-widest mb-1">Creator Scouting</h4>
                    <p className="text-secondary font-sans text-sm leading-relaxed">Onboard underground talent from your region into the ecosystem to build a fiercely loyal listener base.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Cartel Membership Profile */}
      <section className="py-32 px-6 border-b border-white/5 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,57,43,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-block border border-red-accent/30 bg-red-accent/5 px-4 py-1.5 mb-4">
            <span className="text-red-accent font-mono text-xs tracking-widest uppercase">
              Exclusive Access Granted By Invitation Or Merit
            </span>
          </div>
          <h2 className="font-display text-5xl md:text-7xl tracking-widest uppercase text-white hover-glitch" data-text="JOIN THE CARTEL">JOIN THE CARTEL</h2>
          <p className="text-xl md:text-2xl text-secondary font-sans leading-relaxed max-w-3xl mx-auto">
            This is not a franchise. This is an exclusive syndicate reserved strictly for privileged radio professionals who understand the future. We are seeking the elites who want to aggressively transition radio to digital and reclaim the audience&apos;s pockets.
          </p>
          <div className="bg-neutral-950 border border-white/10 p-8 brutalist-border max-w-2xl mx-auto mt-12 relative group hover:border-red-accent/50 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-accent" />
            <h3 className="text-white font-mono text-lg tracking-widest uppercase mb-2">Strict Entry Requirements</h3>
            <p className="text-secondary font-mono text-sm leading-relaxed">
              This seat is only for the deserving. Access to the Media Mafias Network requires a verified minimum of <span className="text-white font-bold">2 years of active experience</span> in a professional radio environment. Corporate suits need not apply.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form with Hard Filter */}
      <section className="py-24 px-6 relative" id="apply">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl tracking-widest uppercase text-white">INITIATE CONNECTION</h2>
            <div className="w-24 h-1 bg-red-accent mx-auto mt-6" />
          </div>

          <AnimatePresence mode="wait">
            {filterState === "idle" && (
              <motion.div
                key="filter"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-950 border border-white/10 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                <h3 className="font-display text-3xl tracking-widest uppercase mb-4">Security Clearance Required</h3>
                <p className="text-secondary font-mono text-sm uppercase mb-12">
                  Do you have a minimum of 2 years professional radio broadcasting experience? (FM, AIR, or Community Radio)
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => handleFilter(false)} variant="outline" className="w-full sm:w-auto">
                    NEGATIVE
                  </Button>
                  <Button onClick={() => handleFilter(true)} className="w-full sm:w-auto">
                    AFFIRMATIVE
                  </Button>
                </div>
              </motion.div>
            )}

            {filterState === "rejected" && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black brutalist-border p-8 md:p-12 text-center"
              >
                <div className="w-16 h-16 rounded-full border-2 border-red-accent flex items-center justify-center mx-auto mb-6 text-red-accent">
                  <span className="font-display text-4xl">X</span>
                </div>
                <h3 className="font-display text-4xl tracking-widest uppercase text-red-accent mb-4">ACCESS DENIED</h3>
                <p className="text-secondary font-sans leading-relaxed max-w-md mx-auto">
                  The Station Partner program is strictly restricted to industry professionals with proven broadcast experience. We appreciate your interest. Keep hustling.
                </p>
                <Button onClick={() => setFilterState("idle")} variant="outline" className="mt-8">
                  RETURN
                </Button>
              </motion.div>
            )}

            {filterState === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-950 brutalist-border p-8 md:p-12 relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-accent" />
                
                {formStatus === "success" ? (
                  <div className="text-center py-12">
                    <div className="text-red-accent font-display text-6xl mb-6">✓</div>
                    <h4 className="font-display text-4xl tracking-widest uppercase text-white mb-4">TRANSMISSION RECEIVED</h4>
                    <p className="text-secondary font-mono text-sm uppercase">Our command center will review your dossier. Stand by.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                      <span className="text-[10px] font-mono text-red-accent tracking-widest uppercase border border-red-accent/30 px-2 py-0.5 bg-red-accent/5">
                        CLEARANCE GRANTED
                      </span>
                    </div>

                    {/* Pre-fill language from the map selection */}
                    <input type="hidden" name="language_tier" value={`${activeTier} - ${activeMarker.name}`} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-secondary uppercase tracking-widest">Operative Name</label>
                        <Input name="name" required placeholder="Full Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-secondary uppercase tracking-widest">Target Territory</label>
                        <Input name="city" required defaultValue={activeMarker.name} readOnly className="opacity-70" />
                        <p className="text-[10px] text-red-accent font-mono">Locked from Map Selection</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-secondary uppercase tracking-widest">Comms Link (Email)</label>
                        <Input name="email" required type="email" placeholder="hello@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-secondary uppercase tracking-widest">Direct Line (Phone)</label>
                        <Input name="phone" required type="tel" placeholder="+91..." />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-secondary uppercase tracking-widest">Broadcast History</label>
                      <Input name="experience" required placeholder="Ex: RJ at Red FM (3 Years)" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono text-secondary uppercase tracking-widest">LinkedIn Profile (Mandatory)</label>
                      <Input name="linkedin" required type="url" placeholder="https://linkedin.com/in/..." />
                    </div>
                    
                    {formStatus === "error" && (
                      <p className="text-red-accent text-xs font-mono tracking-widest uppercase text-center border border-red-accent p-2 bg-red-accent/10">
                        Error transmitting data. Check connection and retry.
                      </p>
                    )}

                    <Button type="submit" disabled={formStatus === "submitting"} className="w-full mt-8">
                      {formStatus === "submitting" ? "ENCRYPTING..." : `SUBMIT DOSSIER FOR ${activeMarker.name.toUpperCase()}`}
                    </Button>
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
