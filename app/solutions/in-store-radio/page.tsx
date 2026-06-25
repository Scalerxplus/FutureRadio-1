import React from 'react';
import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'In-Store Radio Software India | Future Radio B2B',
  description: 'Autonomous AI-powered in-store radio and background music software for retail stores, showrooms, and malls in India. PPL and IPRS compliant royalty-free music.',
  alternates: {
    canonical: 'https://thefutureradio.com/solutions/in-store-radio',
  },
};

export default function B2BLandingPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://thefutureradio.com/solutions/in-store-radio/#business",
    "name": "Future Radio B2B Solutions",
    "url": "https://thefutureradio.com/solutions/in-store-radio",
    "logo": "https://thefutureradio.com/icons/player-logo.png",
    "image": "https://thefutureradio.com/og-image.jpg",
    "description": "Provider of autonomous, AI-powered in-store radio software, background music, and retail media network solutions across India.",
    "telephone": "+91-9999999999",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Future Radio Tech Center",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "postalCode": "400001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "18.9220",
      "longitude": "72.8340"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <div className="min-h-screen bg-[#F0FDF4] text-black font-sans selection:bg-black selection:text-[#E5FF00]">
        <Header />
        
        <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
            <div className="bg-[#E5FF00] border-4 border-black px-4 py-1 font-black uppercase text-sm mb-6 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              B2B Enterprise Solutions
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-khand leading-tight mb-6 uppercase">
              Autonomous <br /> In-Store Radio Software
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-2xl text-black/80">
              The complete audio compliance and sensory platform for retail and hospitality in India. Replace manual playlists with context-aware AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
              <h2 className="text-3xl font-black mb-4 font-khand uppercase">PPL & IPRS Compliant</h2>
              <p className="text-lg mb-4">
                Stop risking legal notices by using personal streaming accounts like Spotify or YouTube in commercial spaces. Our directly-licensed, royalty-free catalog is 100% audit-proof.
              </p>
              <ul className="space-y-2 font-bold">
                <li className="flex items-center gap-2">✓ Bypass PPL/IPRS fees by up to 70%</li>
                <li className="flex items-center gap-2">✓ Studio-grade royalty-free music</li>
                <li className="flex items-center gap-2">✓ Legal coverage certificate included</li>
              </ul>
            </div>

            <div className="bg-[#C4B5FD] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
              <h2 className="text-3xl font-black mb-4 font-khand uppercase">Agentic AI Engine</h2>
              <p className="text-lg mb-4">
                Our dynamic BPM and harmonic structure adjustments respond to real-time local temperatures, weather dynamics, and time-of-day traffic to optimize customer dwell times.
              </p>
              <ul className="space-y-2 font-bold">
                <li className="flex items-center gap-2">✓ Multilingual AI RJ generator</li>
                <li className="flex items-center gap-2">✓ Automated promotional voiceovers</li>
                <li className="flex items-center gap-2">✓ Centralized dashboard for 100+ stores</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
