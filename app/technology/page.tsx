"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Server, Mic2, Cpu, RadioTower } from "lucide-react"; 

export default function TechnologyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-red-accent selection:text-white">
      <Header />
      
      <section className="pt-32 pb-24 px-6 min-h-[80vh] flex flex-col items-center relative z-10">
        <div className="w-full max-w-5xl">
          
          <div className="flex items-center gap-4 mb-12">
            <a href="/" className="bg-red-accent text-white p-3 brutalist-border hover:bg-white hover:text-black transition-colors cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </a>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-widest bg-white text-black px-6 py-3 brutalist-border">
              RADIO 3.0 SAAS
            </h1>
          </div>

          <div className="mb-12 border-l-4 border-red-accent pl-6">
            <p className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-white">
              RUN MULTIPLE RADIO STATIONS ON ONE COMMON PLATFORM.
            </p>
            <p className="font-mono text-sm text-secondary mt-2">
              Front-end, backend, programming, and production setup—everything is entirely virtual. Focus on business growth and PR. We handle the tech.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Core Tech 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-950 text-white p-8 brutalist-border relative group border border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-accent text-white p-4 brutalist-border">
                  <Server size={32} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase leading-none pt-2">
                  CLOUD<br/>AUTOMATION
                </h2>
              </div>
              <p className="font-mono text-sm text-secondary leading-relaxed mb-6 font-medium">
                No massive broadcast towers. No physical studio hardware. Our virtual cloud infrastructure allows you to deploy and manage stations globally from a single dashboard.
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-accent">
                  » Infinite Scalability
                </p>
              </div>
            </motion.div>

            {/* Core Tech 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-950 text-white p-8 brutalist-border relative group border border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white text-black p-4 brutalist-border">
                  <Cpu size={32} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase leading-none pt-2">
                  AI TTS<br/>INJECTION
                </h2>
              </div>
              <p className="font-mono text-sm text-secondary leading-relaxed mb-6 font-medium">
                Generate real-time news, weather updates, and dynamic host announcements. Input custom text prompts and select a localized vernacular voice profile to auto-generate flawless audio.
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">
                  » Dynamic Audio Generation
                </p>
              </div>
            </motion.div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Core Tech 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-950 text-white p-8 brutalist-border relative group border border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white text-black p-4 brutalist-border">
                  <RadioTower size={32} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase leading-none pt-2">
                  SMART<br/>SCHEDULING
                </h2>
              </div>
              <p className="font-mono text-sm text-secondary leading-relaxed mb-6 font-medium">
                Forget tedious manual music logs. Our algorithm dynamically sequences tracks, promos, station IDs, and ads. Set rules for top-of-the-hour and let the system run the 24/7 broadcast flawlessly.
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">
                  » Algorithmic FCT Management
                </p>
              </div>
            </motion.div>

            {/* Core Tech 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-950 text-white p-8 brutalist-border relative group border border-white/20 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:border-white/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-accent text-white p-4 brutalist-border">
                  <Mic2 size={32} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase leading-none pt-2">
                  LIVE<br/>OVERRIDE
                </h2>
              </div>
              <p className="font-mono text-sm text-secondary leading-relaxed mb-6 font-medium">
                Instantly break into the automated cloud broadcast to stream a live DJ set, an emergency regional announcement, or a live event. Ultimate control at your fingertips.
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-accent">
                  » Instant Broadcast Hijack
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>
      
      <Footer />
    </main>
  );
}
