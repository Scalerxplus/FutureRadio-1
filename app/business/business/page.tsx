"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Building2, Radio, Headphones } from "lucide-react"; 
import Link from "next/link";

export default function BusinessPage() {
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
              BUSINESS
            </h1>
          </div>

          {/* Grid Layout matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* In-Store / In-House Radios (Clickable) */}
            <Link href="/business/in-store" className="block">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#dcdcdc] p-8 md:p-12 relative overflow-hidden group cursor-pointer hover:bg-white transition-colors h-full"
              >
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMSkiLz4KPC9zdmc+')] pointer-events-none opacity-50 mix-blend-multiply" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="bg-[#b3392a] text-white p-4">
                      <Building2 size={40} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-2xl md:text-4xl uppercase tracking-widest text-black group-hover:text-red-accent transition-colors">
                      IN-STORE /<br/>IN-HOUSE RADIOS
                    </h3>
                  </div>
                  
                  <p className="font-mono text-sm text-black leading-relaxed mb-12 border-b border-black/20 pb-8">
                    Communicate and engage with your in-store or in-house audience. Promote offers and announcements in real-time just by a simple prompt.
                  </p>

                  <div className="border-l-4 border-[#b3392a] pl-4 flex justify-between items-center">
                    <p className="font-mono text-xs font-bold uppercase tracking-widest text-black">
                      PUT YOUR PROMPT, SELECT THE VOICE, DRAG AND DROP. IT'S THAT EASY.
                    </p>
                    <span className="text-red-accent font-display text-2xl ml-4 group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#b3392a] opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity" />
              </motion.div>
            </Link>

            {/* Box 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white text-black p-8 brutalist-border relative group shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-black text-white p-4 brutalist-border">
                  <Radio size={32} />
                </div>
                <h2 className="font-display text-2xl md:text-3xl uppercase leading-none pt-2">
                  RADIO 3.0<br/>TECHNOLOGY SAAS
                </h2>
              </div>
              <p className="font-mono text-sm leading-relaxed mb-8 font-medium">
                Run multiple radio stations on one common platform. Front-end, backend, programming, and production setup—everything is entirely virtual.
              </p>
              <div className="border-l-4 border-black pl-4">
                <p className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  FOCUS ON BUSINESS GROWTH AND PR, WE HANDLE THE TECH.
                </p>
              </div>
            </motion.div>

          </div>

          {/* Full Width Box 3 (Clickable) */}
          <Link href="/future-radio" className="block w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white text-black p-8 brutalist-border relative group shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.3)] hover:bg-[#f5f5f5] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="border-4 border-black p-2 bg-black text-white group-hover:bg-red-accent group-hover:border-red-accent transition-colors">
                    <Headphones size={28} strokeWidth={2.5} />
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl uppercase group-hover:text-red-accent transition-colors">
                    FUTURE RADIO
                  </h2>
                </div>
                <span className="text-red-accent font-display text-3xl opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
              </div>
              <p className="font-mono text-sm leading-relaxed max-w-3xl font-medium">
                Our flagship consumer-facing audio streaming platform. A decentralized global hub empowering independent artists, driven by predictive curation and unfiltered human emotion.
              </p>
            </motion.div>
          </Link>

        </div>
      </section>
      
      <Footer />
    </main>
  );
}
