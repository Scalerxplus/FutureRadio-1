"use client";

import Link from "next/link";
import { Sparkles, Globe, Music, Crown, Star, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-[#A7F3D0] text-black flex flex-col font-sans selection:bg-black selection:text-[#00E5FF] overflow-hidden relative">
      
      {/* Background Ambience / Neo Brutalist Watermarks */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] text-[80vw] leading-none text-black/[0.04] font-black font-khand select-none rotate-12">
          ARTIST
        </div>
        <div className="absolute inset-0 opacity-[0.08] bg-[url('/textures/noise.png')] mix-blend-overlay" />
      </div>

      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-32 pb-20 px-6 relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mt-12 mb-20 max-w-4xl flex flex-col items-center">
          <div className="inline-block bg-white border-4 border-black px-6 py-2 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-10 transform -rotate-2">
            <span className="font-bold text-black tracking-widest text-sm uppercase">Calling Independent Creators</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black font-khand text-black mb-6 uppercase tracking-tight leading-[0.9] drop-shadow-sm">
            आपकी कला, <br className="hidden md:block" /> हमारा मंच
          </h1>
          
          <p className="text-xl md:text-3xl font-bold text-black/80 max-w-3xl font-sans mt-4 leading-snug tracking-tight bg-white/40 px-6 py-3 border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Future Radio is built for the independent musicians and regional folk artists who bleed culture. Reach millions, autonomously.
          </p>
        </div>

        {/* Benefits Section (Neo Brutalist Cards) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          
          <div className="bg-[#FF69B4] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Crown className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-2">Royalty Sharing</h3>
            <p className="text-black/80 font-bold leading-snug">Earn fair royalties for your music. When your track plays, you get paid. It's that simple.</p>
          </div>

          <div className="bg-[#E5FF00] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-2">Featured Spots</h3>
            <p className="text-black/80 font-bold leading-snug">Top tracks get featured placements on our Regional and Devotional highlight hours.</p>
          </div>

          <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="w-16 h-16 bg-[#00E5FF] border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Globe className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-2">Global Reach</h3>
            <p className="text-black/80 font-bold leading-snug">Take your regional dialects global. Our AI streams your art to the entire diaspora.</p>
          </div>

          <div className="bg-[#FFA500] border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Music className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black font-khand uppercase tracking-wide text-black mb-2">Pure Focus</h3>
            <p className="text-black/80 font-bold leading-snug">We handle the tech and autonomous streaming. You just focus on creating great music.</p>
          </div>

        </div>

        {/* CTA Section */}
        <div className="w-full max-w-4xl mx-auto bg-black border-[6px] border-black rounded-[3rem] p-10 md:p-16 text-center shadow-[16px_16px_0px_0px_rgba(229,255,0,1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5FF00] rounded-full blur-[100px] opacity-20" />
          
          <h2 className="text-4xl md:text-6xl font-black font-khand text-white mb-6 uppercase leading-tight relative z-10">
            Ready to broadcast your <span className="text-[#E5FF00]">Masterpiece?</span>
          </h2>
          <p className="text-white/80 font-bold text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
            Apply to be an early creator on the Future Radio platform and secure your spot on the world's first autonomous network.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link 
              href="/creators/apply"
              className="group bg-[#E5FF00] text-black px-10 py-5 rounded-full font-black uppercase tracking-widest text-lg border-4 border-[#E5FF00] hover:bg-transparent hover:text-[#E5FF00] transition-colors flex items-center gap-3"
            >
              Submit Application
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
