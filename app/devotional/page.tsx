import { Metadata } from "next";
import Link from "next/link";
import { DEVOTIONAL_STATIONS } from "@/lib/data";
import { Header } from "@/components/layout/Header";
import { Play } from "lucide-react";

export const metadata: Metadata = {
  title: "Devotional Radio India | 24/7 Bhajans, Dhun & Spiritual Streams",
  description: "Listen to 24/7 devotional radio with Shiva Bhajans, Krishna Dhun, Ganesh Dhun and spiritual audio streams on Future Radio.",
};

export default function DevotionalHubPage() {
  return (
    <div className="min-h-screen bg-[#0A0805] text-[#FDF6E3] font-sans selection:bg-[#FF6B1A] selection:text-white relative overflow-x-hidden">
      <Header />
      
      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-khand font-black text-white leading-tight tracking-tighter drop-shadow-sm mb-4">
          Daily devotional listening, always on.
        </h1>
        <p className="text-lg md:text-xl font-bold text-white/70 max-w-2xl mx-auto">
          Listen to 24/7 devotional radio with Shiva Bhajans, Krishna Dhun, Ganesh Dhun and spiritual audio streams on Future Radio.
        </p>
      </section>

      {/* ── STATIONS GRID ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {DEVOTIONAL_STATIONS.map((station) => (
            <Link href={`/devotional/${station.id}`} key={station.id} className={`relative rounded-2xl border-4 border-[#FFA500] overflow-hidden flex flex-col block ${station.comingSoon ? 'opacity-60 cursor-not-allowed bg-gray-900 pointer-events-none' : 'cursor-pointer transition-all hover:scale-[1.02]'} `} style={{ backgroundColor: station.color }}>
                <div className="aspect-square border-b-4 border-[#FFA500] bg-white relative">
                  {station.image ? (
                    <img src={station.image} alt={station.name} className={`w-full h-full object-cover ${station.comingSoon ? 'grayscale' : ''}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-6xl text-black/20">?</div>
                  )}
                  
                  {station.comingSoon && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <div className="bg-[#FFA500] border-2 border-black font-black uppercase text-black text-xs px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-12">Coming Soon</div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-[#111] flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-black text-lg md:text-xl leading-tight text-white mb-1 line-clamp-1">{station.name}</h3>
                    <p className="text-white/60 font-bold text-xs uppercase">{station.region}</p>
                  </div>
                  
                  {!station.comingSoon && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-[#FFA500] border-2 border-black rounded-full px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                         <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                         <span className="text-[10px] font-black">{station.listeners}</span>
                      </div>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black hover:bg-[#FFA500] text-black transition-colors">
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
