"use client";

import Link from "next/link";
import { Building2, Radio, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-[#FDE047] text-black flex flex-col font-sans selection:bg-black selection:text-[#FDE047] overflow-hidden relative">
      
      {/* Background Ambience / Neo Brutalist Watermarks */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[-5%] text-[70vw] leading-none text-black/[0.04] font-black font-khand select-none -rotate-6">
          B2B
        </div>
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/textures/noise.png')] mix-blend-overlay" />
      </div>

      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mt-12 mb-20 max-w-4xl flex flex-col items-center">
          <div className="inline-block bg-white border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 transform rotate-2">
            <span className="font-bold text-black tracking-widest text-sm uppercase">Business & Technology</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black font-khand text-black mb-6 uppercase tracking-tight leading-[0.9] drop-shadow-sm">
            NEXT-GEN <br className="hidden md:block" /> AUDIO SOLUTIONS
          </h1>
          
          <p className="text-xl md:text-3xl font-bold text-black/80 max-w-3xl font-sans mt-4 leading-snug tracking-tight bg-white/40 px-6 py-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            We build state-of-the-art audio streaming and broadcasting technologies. Explore our ecosystem.
          </p>
        </div>

        {/* Products Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          {/* Card 1 */}
          <div className="bg-white border-4 border-black p-10 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-[#FF0055] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black font-khand uppercase tracking-wide text-black leading-none">In-Store <br/> Radios</h3>
            </div>
            <p className="text-black/80 font-bold text-lg leading-snug mb-8 flex-grow">
              Communicate and engage with your in-store or in-house audience. Promote offers and announcements in real-time just by a simple prompt.
            </p>
            <div className="bg-[#E5FF00] p-4 border-4 border-black rounded-xl text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              Type prompt. Select Voice. Broadcast.
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border-4 border-black p-10 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-[#00E5FF] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Radio className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black font-khand uppercase tracking-wide text-black leading-none">Radio 3.0 <br/> SaaS</h3>
            </div>
            <p className="text-black/80 font-bold text-lg leading-snug mb-8 flex-grow">
              Want to start your own 100% autonomous web radio station? License our proprietary AI master clock and streaming technology.
            </p>
            <div className="bg-[#FF69B4] p-4 border-4 border-black rounded-xl text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              Enterprise Licensing Available
            </div>
          </div>

        </div>

        {/* CTA Section */}
        <div className="w-full max-w-4xl mx-auto bg-black border-[6px] border-black rounded-[3rem] p-10 md:p-16 text-center shadow-[16px_16px_0px_0px_rgba(255,0,85,1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF0055] rounded-full blur-[100px] opacity-20" />
          
          <h2 className="text-4xl md:text-6xl font-black font-khand text-white mb-6 uppercase leading-tight relative z-10">
            Let's build <span className="text-[#FF0055]">Together</span>
          </h2>
          <p className="text-white/80 font-bold text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
            Contact our business team to discuss enterprise licensing, custom in-store radio solutions, or advertising on Future Radio.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <a 
              href="mailto:business@thefutureradio.com"
              className="group bg-[#FF0055] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-lg border-4 border-[#FF0055] hover:bg-transparent hover:text-[#FF0055] transition-colors flex items-center gap-3"
            >
              Contact Us
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>

      </main>
    </div>
  );
}
