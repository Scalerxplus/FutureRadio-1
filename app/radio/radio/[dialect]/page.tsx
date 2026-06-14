import { dialectMarkers } from "@/lib/data";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

// Define the interface for the params
interface PageProps {
  params: Promise<{
    dialect: string;
  }>;
}

// Generate Static Params for all dialects to pre-build the pages
export async function generateStaticParams() {
  return dialectMarkers.map((marker) => ({
    dialect: marker.name.toLowerCase().replace(/[\s\(\)]+/g, "-").replace(/-+$/, ""),
  }));
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const dialectParam = resolvedParams.dialect;
  const marker = dialectMarkers.find(
    (m) => m.name.toLowerCase().replace(/[\s\(\)]+/g, "-").replace(/-+$/, "") === dialectParam
  );

  if (!marker) {
    return {
      title: "Radio Not Found",
    };
  }

  const baseName = marker.name.split(" ")[0]; // e.g. Pune Marathi (Deshi) -> Pune

  return {
    title: `Radio in ${marker.name} | ${baseName} Radio Business & SaaS Platform`,
    description: `Start a radio business or advertise on ${marker.name} Radio. Media Mafias is the premier streaming software technology provider for ${baseName} and beyond. Target ${marker.speakers} listeners.`,
    keywords: [
      `radio in ${marker.name.toLowerCase()}`, 
      `${baseName.toLowerCase()} radio`, 
      `radio business in ${baseName.toLowerCase()}`,
      `start radio in ${marker.majorCities[0].toLowerCase()}`,
      "radio as saas",
      "digital audio platform"
    ]
  };
}

export default async function DialectRadioPage({ params }: PageProps) {
  const resolvedParams = await params;
  const dialectParam = resolvedParams.dialect;
  const marker = dialectMarkers.find(
    (m) => m.name.toLowerCase().replace(/[\s\(\)]+/g, "-").replace(/-+$/, "") === dialectParam
  );

  if (!marker) {
    notFound();
  }

  const cleanName = marker.name.replace(/\s*\(.*?\)\s*/g, '');

  return (
    <main className="flex min-h-screen flex-col bg-black text-white selection:bg-red-accent selection:text-white">
      <Header />
      
      <section className="pt-32 pb-24 px-6 min-h-[80vh] flex flex-col justify-center relative border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundColor: marker.color }}>
          {/* Subtle glow background based on dialect color */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] mix-blend-screen" style={{ backgroundColor: marker.color }}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <span className="text-red-accent font-mono text-sm tracking-widest uppercase flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: marker.color }}></span> 
            {marker.networkStatus} NETWORK NODE
          </span>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-widest uppercase text-white mb-6 leading-[0.9]">
            RADIO IN <br/>
            <span style={{ color: marker.color }}>{cleanName}</span>
          </h1>
          
          <p className="text-neutral-400 font-mono max-w-2xl text-lg mb-12">
            The broadcast model is dead. Welcome to the future of digital audio in the {cleanName} region. We provide the streaming software technology and the platform to monopolize this untapped market.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-neutral-950 border border-white/10 p-6 brutalist-border">
              <h3 className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Total Addressable Market</h3>
              <p className="font-display text-4xl text-white">{marker.speakers}</p>
              <p className="text-xs text-neutral-500 mt-2">Active Speakers</p>
            </div>
            
            <div className="bg-neutral-950 border border-white/10 p-6 brutalist-border">
              <h3 className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Primary Urban Centers</h3>
              <p className="font-display text-2xl text-white">{marker.majorCities[0]}</p>
              <p className="text-xs text-neutral-500 mt-2">+{marker.majorCities.slice(1).length} More Cities</p>
            </div>

            <div className="bg-neutral-950 border border-white/10 p-6 brutalist-border">
              <h3 className="font-mono text-xs text-secondary uppercase tracking-widest mb-2">Smartphone Penetration</h3>
              <p className="font-display text-4xl text-white">{marker.smartphonePenetration}%</p>
              <div className="w-full h-1 bg-black mt-2">
                <div className="h-full" style={{ width: `${marker.smartphonePenetration}%`, backgroundColor: marker.color }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/partner" className="bg-red-accent hover:bg-white hover:text-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors inline-block text-center font-bold">
              Claim This Territory
            </a>
            <a href="/analysis" className="border border-white/20 hover:bg-white/5 px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors inline-block text-center">
              View Market Analysis
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
