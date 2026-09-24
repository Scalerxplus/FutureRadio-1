"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";

export default function RadioPage() {
  const dialects = [
    "Hindi", "Bagheli", "Bundeli", 
    "Chhattisgarhi", "Malwi", "Sarguja", 
    "Bastar", "Raigarh", "Punjabi"
  ];

  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-red-accent selection:text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,57,43,0.1)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="font-display text-6xl md:text-8xl tracking-widest uppercase text-white leading-[0.9] hover-glitch pt-4" data-text="THE NEW AGE NETWORK">
              THE NEW AGE <span className="text-red-accent">NETWORK</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-sans max-w-3xl mx-auto leading-relaxed">
              Future Radio is an autonomous AI-curated audio engine targeting hyper-local vernacular segments. <br/><br/>
              <span className="text-white font-bold">Digital India&apos;s #1 Digital & Virtual Radio Network.</span>
            </p>
          </motion.div>
          
          <motion.a
            href="https://www.thefutureradio.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer block mt-8"
          >
            <div className="absolute inset-0 bg-red-accent blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <motion.div
              animate={{ filter: ["drop-shadow(0px 0px 0px rgba(192,57,43,0))", "drop-shadow(0px 0px 20px rgba(192,57,43,0.5))", "drop-shadow(0px 0px 0px rgba(192,57,43,0))"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 p-4"
            >
              <Image 
                src="/logo-vertical-light.png" 
                alt="Future Radio Official" 
                width={440} 
                height={600} 
                className="object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105"
              />
            </motion.div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 whitespace-nowrap">
              <span className="text-red-accent font-mono text-sm tracking-[0.3em] uppercase border border-red-accent/30 bg-black px-4 py-2">
                ENTER PLATFORM
              </span>
            </div>
          </motion.a>
        </div>
      </section>

      {/* How it Works / Tech */}
      <section className="py-24 px-6 border-b border-white/5 bg-neutral-950">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white">THE ENGINE</h2>
            <div className="w-16 h-1 bg-red-accent" />
            <p className="text-xl md:text-2xl text-secondary font-mono max-w-4xl mx-auto leading-relaxed border-t border-white/10 pt-8">
              Future Radio is a truly decentralized audio platform empowering independent creators. We bypass FM licenses and traditional broadcast towers. Utilizing our proprietary cloud-based MafiaOS, we stream creator-sourced regional music, talk shows, and culturally relevant content directly to millions of mobile devices.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 border border-white/10 bg-black">
              <span className="text-red-accent font-display text-3xl block mb-2">01.</span>
              <h4 className="font-display tracking-widest text-white uppercase text-xl">Cloud OS</h4>
              <p className="text-secondary font-mono text-xs mt-2">No hardware limits.</p>
            </div>
            <div className="p-6 border border-white/10 bg-black">
              <span className="text-red-accent font-display text-3xl block mb-2">02.</span>
              <h4 className="font-display tracking-widest text-white uppercase text-xl">Decentralized</h4>
              <p className="text-secondary font-mono text-xs mt-2">Creator owned.</p>
            </div>
            <div className="p-6 border border-white/10 bg-black">
              <span className="text-red-accent font-display text-3xl block mb-2">03.</span>
              <h4 className="font-display tracking-widest text-white uppercase text-xl">Dialect First</h4>
              <p className="text-secondary font-mono text-xs mt-2">Hyper-local audio.</p>
            </div>
            <div className="p-6 border border-red-accent/30 bg-black brutalist-border relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-red-accent font-display text-3xl block mb-2">04.</span>
              <h4 className="font-display tracking-widest text-red-accent uppercase text-xl">Direct to Mobile</h4>
              <p className="text-secondary font-mono text-xs mt-2">Algorithmic streaming.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Matrix */}
      <section className="py-24 px-6 border-b border-white/5 bg-[url('/noise.png')] bg-repeat">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-widest uppercase text-white mb-4 hover-glitch" data-text="THE CONTENT MATRIX">THE CONTENT MATRIX</h2>
          <p className="text-secondary font-mono text-sm uppercase tracking-widest mb-16">Broadcasting across the linguistic spectrum</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dialects.map((dialect, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 border border-white/10 bg-black hover:border-red-accent/50 transition-colors flex items-center justify-center group"
              >
                <h4 className="font-display text-xl tracking-widest text-white uppercase group-hover:text-red-accent transition-colors">
                  {dialect}
                </h4>
              </motion.div>
            ))}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: dialects.length * 0.1 }}
              className="p-6 border border-dashed border-white/20 bg-neutral-900/50 flex items-center justify-center"
            >
              <h4 className="font-display text-xl tracking-widest text-secondary uppercase">
                + EXPANDING
              </h4>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-red-accent tracking-widest uppercase border border-red-accent/30 px-2 py-0.5 bg-red-accent/5">
              DIRECTIVE 01
            </span>
            <h3 className="font-display text-4xl tracking-widest uppercase text-white">THE MISSION</h3>
            <p className="text-lg text-secondary font-mono leading-relaxed border-l-2 border-white/10 pl-6">
              To reclaim radio from the dashboard and establish it as an omnipresent digital companion. We are engineering a borderless, on-demand audio ecosystem that lives directly in the pockets of the audience—accessible whenever and wherever they demand it.
            </p>
          </div>
          
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-red-accent tracking-widest uppercase border border-red-accent/30 px-2 py-0.5 bg-red-accent/5">
              DIRECTIVE 02
            </span>
            <h3 className="font-display text-4xl tracking-widest uppercase text-red-accent">THE VISION</h3>
            <p className="text-lg text-secondary font-mono leading-relaxed border-l-2 border-red-accent/50 pl-6">
              To architect a high-fidelity digital audio infrastructure for 140 Crore Indians, delivering uncompromising content in their native dialects. We are actively preserving local traditions and aggressively empowering grassroots talent—forging a decentralized creator economy where broadcast is truly driven to the people, by the people.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
