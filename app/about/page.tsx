"use client";

import Link from "next/link";
import { ArrowRight, Cloud, Globe2, Code2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#BAE6FD] text-black flex flex-col font-sans selection:bg-black selection:text-[#BAE6FD] overflow-hidden relative">
      
      {/* Background Ambience / Neo Brutalist Watermarks */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[30%] left-[-10%] text-[80vw] leading-none text-black/[0.04] font-black font-khand select-none rotate-12">
          ABOUT
        </div>
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/textures/noise.png')] mix-blend-overlay" />
      </div>

      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mt-12 mb-20 max-w-4xl flex flex-col items-center">
          <div className="inline-block bg-[#00E5FF] border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 transform -rotate-3">
            <span className="font-bold text-black tracking-widest text-sm uppercase">A Cloud-First Movement</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black font-khand text-black mb-6 uppercase tracking-tight leading-[0.9] drop-shadow-sm">
            THE FUTURE <br className="hidden md:block" /> OF <span className="text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">AUDIO</span>
          </h1>
          
          <p className="text-xl md:text-3xl font-bold text-black/80 max-w-3xl font-sans mt-4 leading-snug tracking-tight bg-white/40 px-6 py-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            India's first 100% autonomous, AI-powered virtual radio network. Decentralized and purely built for the modern digital listener.
          </p>
        </div>

        {/* Mission & Vision Section (Neo Brutalist Cards) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          <div className="bg-[#FF69B4] border-4 border-black p-10 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <h3 className="text-3xl font-black font-khand uppercase tracking-wide text-black mb-6 bg-white inline-block px-4 py-2 border-4 border-black self-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">Our Mission</h3>
            <p className="text-black/90 font-bold text-xl leading-relaxed">
              To provide quick info and entertainment to rural and urban India alike. Taking the most reliable medium—audio—and supercharging it through advanced technology to connect the disconnected.
            </p>
          </div>

          <div className="bg-[#E5FF00] border-4 border-black p-10 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <h3 className="text-3xl font-black font-khand uppercase tracking-wide text-black mb-6 bg-white inline-block px-4 py-2 border-4 border-black self-start shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">Our Vision</h3>
            <p className="text-black/90 font-bold text-xl leading-relaxed">
              To build a decentralized global audio platform that empowers independent artists and creators by deeply integrating local dialects and pure devotional content into one seamless app-less experience.
            </p>
          </div>

        </div>

        {/* Contact Strip */}
        <div className="w-full max-w-4xl mx-auto bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col">
             <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black">Get In Touch</h3>
             <p className="text-black/60 font-bold">Talk to the founders & builders directly.</p>
          </div>
          <div className="flex gap-4">
             <a href="https://wa.me/919209290699" target="_blank" rel="noreferrer" className="bg-[#25D366] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2">
                WhatsApp
             </a>
             <a href="mailto:hello@thefutureradio.com" className="bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2">
                Email Us
             </a>
          </div>
        </div>

      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
