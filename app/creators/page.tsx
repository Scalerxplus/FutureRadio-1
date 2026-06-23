import Link from "next/link";
import { MoveLeft, Sparkles, Globe, Music, Crown, Star, PlayCircle } from "lucide-react";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Independent Artists | Future Radio India",
  description: "Join Future Radio as an independent artist or musician. Submit your regional and devotional music, earn royalties, and reach a global audience.",
  alternates: {
    canonical: "https://thefutureradio.com/creators",
  },
  openGraph: {
    title: "Independent Artists | Future Radio India",
    description: "Join Future Radio as an independent artist or musician. Submit your regional and devotional music.",
    url: "https://thefutureradio.com/creators",
  }
};

export default function CreatorsPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Independent Artists | Future Radio India",
      "description": "Join Future Radio as an independent artist or musician. Submit your regional and devotional music, earn royalties, and reach a global audience.",
      "url": "https://thefutureradio.com/creators"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://thefutureradio.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Independent Artists",
          "item": "https://thefutureradio.com/creators"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#FFD700] selection:text-black overflow-hidden relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Background Ambience */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(255,215,0,0.1)_0%,rgba(255,140,0,0.05)_40%,transparent_70%)] blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEwMCAwaDF2MTBoLTF6bTAgMTkwSDF2MTBoLTF6bS05MC05MHYxaDEwdi0xem0xOTAgMEgxOXYxaDEwdi0xeiIvPjwvc3ZnPg==')] mix-blend-screen" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('/textures/noise.png')] mix-blend-overlay" />

      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-24 pb-20 px-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mt-12 mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 backdrop-blur-md mb-8 shadow-[inset_0_0_20px_rgba(255,215,0,0.05)]">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span className="text-xs font-bold text-[#FFD700] tracking-[0.2em] uppercase">Calling All Independent Artists</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-baloo text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8DC] to-[#DAA520] mb-6 drop-shadow-2xl leading-[1.2]">
            आपकी कला, <br className="hidden md:block" /> हमारा मंच
          </h1>
          <p className="text-lg md:text-xl text-[#FFF8DC]/70 font-medium leading-relaxed tracking-wide">
            Future Radio is built for the independent musicians, the devotional singers, and the regional folk artists who bleed culture. Reach millions, autonomously.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-[#FFD700]/40 transition-all hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Crown className="w-6 h-6 text-[#FFD700]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Royalty Sharing</h3>
            <p className="text-white/60 text-sm leading-relaxed">Earn fair royalties for your music. When your track plays, you get paid. It's that simple.</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-[#00E5FF]/40 transition-all hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#7000FF]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-[#00E5FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Featured Spots</h3>
            <p className="text-white/60 text-sm leading-relaxed">Top tracks get featured placements on our Regional and Devotional highlight hours.</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-[#FF0055]/40 transition-all hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF0055]/20 to-[#FF8C00]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-[#FF0055]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Massive Reach</h3>
            <p className="text-white/60 text-sm leading-relaxed">Broadcast to a highly engaged global audience craving authentic Indian cultural content.</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-[#9370DB]/40 transition-all hover:-translate-y-2 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9370DB]/20 to-[#4B0082]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6 text-[#9370DB]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-wide">Cultural Impact</h3>
            <p className="text-white/60 text-sm leading-relaxed">Help preserve and promote regional dialects and devotional purity through your art.</p>
          </div>
        </div>

        {/* CTA Glass Panel */}
        <div className="w-full max-w-4xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-2xl border border-[#FFD700]/20 rounded-[3rem] p-12 md:p-16 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(255,215,0,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF8C00]/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#800080]/10 blur-[80px] rounded-full" />
          
          <h2 className="text-3xl md:text-5xl font-black font-baloo text-white mb-6 relative z-10">Join the Revolution</h2>
          <p className="text-[#FFF8DC]/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            Submit your portfolio. Once approved, you can directly upload your original tracks to our autonomous AI scheduling system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center relative z-10">
            <Link 
              href="/creators/apply" 
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] flex justify-center items-center gap-3"
            >
              <PlayCircle className="w-5 h-5" />
              Apply Now
            </Link>
            <Link 
              href="/creators/portal" 
              className="w-full sm:w-auto px-10 py-5 bg-black/40 text-[#FFD700] border border-[#FFD700]/50 font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#FFD700]/10 transition-all flex justify-center items-center"
            >
              Verified Portal
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
