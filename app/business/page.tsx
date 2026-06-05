import Link from "next/link";
import { MoveLeft, Building2, Radio, Headphones, Code } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business & Advertisers | Future Radio India",
  description: "Advertise on Future Radio or license our AI radio SaaS technology. Reach millions across MP & CG with targeted audio ads.",
  alternates: {
    canonical: "https://thefutureradio.com/business",
  },
  openGraph: {
    title: "Business & Advertisers | Future Radio India",
    description: "Advertise on Future Radio or license our AI radio SaaS technology.",
    url: "https://thefutureradio.com/business",
  }
};

export default function BusinessPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Business & Advertisers | Future Radio India",
    "description": "Advertise on Future Radio or license our AI radio SaaS technology. Reach millions across MP & CG with targeted audio ads.",
    "url": "https://thefutureradio.com/business",
    "publisher": {
      "@type": "Organization",
      "name": "Future Radio"
    }
  };

  return (
    <div className="min-h-screen bg-brand-yellow text-brand-dark flex flex-col font-mono selection:bg-brand-red selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Brutalist Header */}
      <header className="border-b-4 border-brand-dark bg-white p-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/" className="hover:-translate-x-1 transition-transform">
          <div className="p-2 border-2 border-brand-dark shadow-brutal-sm bg-brand-red text-white hover:bg-brand-dark hover:text-white transition-colors">
            <MoveLeft className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          Business & Tech
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 max-w-5xl mx-auto w-full">
        
        {/* Intro */}
        <div className="mb-12 bg-white border-4 border-brand-dark p-6 md:p-10 shadow-brutal translate-x-1 -translate-y-1">
          <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 leading-tight">
            Next-Gen Audio Solutions for Brands & Creators
          </h2>
          <p className="text-lg md:text-xl font-medium">
            We build state-of-the-art audio streaming and broadcasting technologies. Explore our ecosystem of products below.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Card 1: Instore Radios */}
          <div className="bg-white border-4 border-brand-dark p-6 shadow-[8px_8px_0_0_#EF4444] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-brand-red text-white p-3 border-2 border-brand-dark">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">In-Store / In-House Radios</h3>
            </div>
            <p className="text-base font-medium mb-4 flex-grow">
              Communicate and engage with your in-store or in-house audience. Promote offers and announcements in real-time just by a simple prompt. 
            </p>
            <div className="bg-gray-100 p-3 border-l-4 border-brand-red text-sm font-bold uppercase mt-auto">
              Put your prompt, select the voice, drag and drop. It&apos;s that easy.
            </div>
          </div>

          {/* Card 2: Radio 3.0 SaaS */}
          <div className="bg-white border-4 border-brand-dark p-6 shadow-[8px_8px_0_0_#111827] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-brand-dark text-white p-3 border-2 border-brand-dark">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Radio 3.0 Technology SaaS</h3>
            </div>
            <p className="text-base font-medium mb-4 flex-grow">
              Run multiple radio stations on one common platform. Front-end, backend, programming, and production setup—everything is entirely virtual.
            </p>
            <div className="bg-brand-yellow/30 p-3 border-l-4 border-brand-dark text-sm font-bold uppercase mt-auto">
              Focus on business growth and PR, we handle the tech.
            </div>
          </div>

          {/* Card 3: Future Radio Consumer */}
          <div className="bg-white border-4 border-brand-dark p-6 shadow-[8px_8px_0_0_#FFFFFF] hover:shadow-none hover:translate-x-[8px] hover:translate-y-[8px] transition-all md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white text-brand-dark p-3 border-2 border-brand-dark">
                <Headphones className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Future Radio</h3>
            </div>
            <p className="text-lg font-medium max-w-3xl">
              Our flagship consumer-facing audio streaming platform. A decentralized global hub empowering independent artists, driven by predictive curation and unfiltered human emotion.
            </p>
          </div>
        </div>

        {/* Attribution */}
        <div className="bg-brand-dark text-white border-4 border-white p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Code className="w-10 h-10 text-brand-yellow" />
            <div>
              <p className="text-lg font-bold uppercase">Technology Co-Developed By</p>
              <p className="text-sm text-gray-300">The Future Radio & Media Mafias</p>
            </div>
          </div>
          <a 
            href="https://mediamafias.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-brand-yellow text-brand-dark px-6 py-3 font-black uppercase border-2 border-white hover:bg-white transition-colors text-center w-full md:w-auto"
          >
            Visit MediaMafias.com
          </a>
        </div>

      </main>
    </div>
  );
}
