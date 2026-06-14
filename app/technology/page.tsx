"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Server, Mic2, Cpu, RadioTower, ArrowLeft } from "lucide-react"; 

export default function TechnologyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-yellow text-brand-dark selection:bg-brand-red selection:text-white font-sans">
      <Header />
      
      <section className="pt-32 pb-24 px-6 min-h-[80vh] flex flex-col items-center relative z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjRkFDQzE1IiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMSkiIC8+Cjwvc3ZnPg==')]">
        <div className="w-full max-w-5xl">
          
          <div className="flex items-center gap-4 mb-12">
            <a href="/" className="bg-brand-red text-white p-3 border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
              <ArrowLeft className="w-6 h-6" strokeWidth={3} />
            </a>
            <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-widest bg-white text-brand-dark px-6 py-3 border-4 border-brand-dark shadow-brutal transform -rotate-1">
              RADIO 3.0 ARCHITECTURE
            </h1>
          </div>

          <div className="mb-12 border-l-8 border-brand-red pl-6 bg-white p-6 border-y-4 border-r-4 border-brand-dark shadow-brutal">
            <p className="font-display text-2xl md:text-3xl font-black uppercase tracking-widest text-brand-dark">
              RUN MULTIPLE RADIO STATIONS ON ONE COMMON PLATFORM.
            </p>
            <p className="font-mono font-bold text-sm text-gray-600 mt-2">
              Front-end, backend, programming, and production setup—everything is entirely virtual. Focus on community and growth. We handle the autonomous tech.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Core Tech 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white text-brand-dark p-8 border-4 border-brand-dark shadow-[8px_8px_0_0_#FF2E2E] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-brand-red text-white p-4 border-4 border-brand-dark shadow-brutal-sm">
                  <Server size={32} />
                </div>
                <h2 className="font-display font-black text-3xl uppercase leading-none pt-2">
                  CLOUD<br/>AUTOMATION
                </h2>
              </div>
              <p className="font-mono text-sm text-gray-600 leading-relaxed mb-6 font-bold flex-grow">
                No massive broadcast towers. No physical studio hardware. Our virtual cloud infrastructure allows you to deploy and manage stations globally from a single dashboard.
              </p>
              <div className="border-t-4 border-brand-dark pt-4 mt-auto">
                <p className="font-mono text-xs font-black uppercase tracking-widest text-brand-red">
                  » Infinite Scalability
                </p>
              </div>
            </motion.div>

            {/* Core Tech 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white text-brand-dark p-8 border-4 border-brand-dark shadow-[8px_8px_0_0_#0A0D14] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-brand-dark text-white p-4 border-4 border-brand-dark shadow-brutal-sm">
                  <Cpu size={32} />
                </div>
                <h2 className="font-display font-black text-3xl uppercase leading-none pt-2">
                  AI TTS<br/>INJECTION
                </h2>
              </div>
              <p className="font-mono text-sm text-gray-600 leading-relaxed mb-6 font-bold flex-grow">
                Generate real-time news, weather updates, and dynamic host announcements. Input custom text prompts and select a localized vernacular voice profile to auto-generate flawless audio.
              </p>
              <div className="border-t-4 border-brand-dark pt-4 mt-auto">
                <p className="font-mono text-xs font-black uppercase tracking-widest text-brand-dark">
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
              className="bg-white text-brand-dark p-8 border-4 border-brand-dark shadow-[8px_8px_0_0_#FFFFFF] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white text-brand-dark p-4 border-4 border-brand-dark shadow-brutal-sm">
                  <RadioTower size={32} />
                </div>
                <h2 className="font-display font-black text-3xl uppercase leading-none pt-2">
                  SMART<br/>SCHEDULING
                </h2>
              </div>
              <p className="font-mono text-sm text-gray-600 leading-relaxed mb-6 font-bold flex-grow">
                Forget tedious manual music logs. Our algorithm dynamically sequences tracks, promos, station IDs, and ads. Set rules for top-of-the-hour and let the system run the 24/7 broadcast flawlessly.
              </p>
              <div className="border-t-4 border-brand-dark pt-4 mt-auto">
                <p className="font-mono text-xs font-black uppercase tracking-widest text-brand-dark">
                  » Algorithmic FCT Management
                </p>
              </div>
            </motion.div>

            {/* Core Tech 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white text-brand-dark p-8 border-4 border-brand-dark shadow-[8px_8px_0_0_#FF2E2E] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-brand-red text-white p-4 border-4 border-brand-dark shadow-brutal-sm">
                  <Mic2 size={32} />
                </div>
                <h2 className="font-display font-black text-3xl uppercase leading-none pt-2">
                  LIVE<br/>OVERRIDE
                </h2>
              </div>
              <p className="font-mono text-sm text-gray-600 leading-relaxed mb-6 font-bold flex-grow">
                Instantly break into the automated cloud broadcast to stream a live DJ set, an emergency regional announcement, or a live event. Ultimate control at your fingertips.
              </p>
              <div className="border-t-4 border-brand-dark pt-4 mt-auto">
                <p className="font-mono text-xs font-black uppercase tracking-widest text-brand-red">
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
