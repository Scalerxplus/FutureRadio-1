import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AudioOrchestrator from "@/components/audio/AudioOrchestrator";
import PlayerBar from "@/components/audio/PlayerBar";
import RadioBubble from "@/components/ui/RadioBubble";
import { Analytics } from "@vercel/analytics/react";

import { Baloo_2, Space_Grotesk, Space_Mono } from "next/font/google";

const digitalFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-digital",
  weight: ["400", "700"],
});

const balooFont = Baloo_2({
  subsets: ["devanagari", "latin"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thefutureradio.com"),
  title: "Future Radio | India's First Autonomous AI Virtual Radio Station",
  description: "Experience the next generation of sound. Future Radio is India's first 100% autonomous, AI-powered virtual radio station. The New-age radio station.",
  keywords: ["radio", "internet radio india", "ai radio station", "virtual radio", "future radio", "indie music", "web3 radio", "audius india"],
  openGraph: {
    title: "Future Radio | India's First Autonomous AI Radio",
    description: "The New-age radio station. Tune into the future of sound with India's 100% autonomous virtual radio.",
    url: "https://thefutureradio.com",
    siteName: "Future Radio",
    images: [
      {
        url: "/logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Future Radio - Autonomous AI Station",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Future Radio | AI Virtual Radio Station",
    description: "India's first 100% autonomous, AI-powered virtual radio station. The New-age radio.",
    images: ["/logo-horizontal.png"],
  },
  icons: {
    icon: "/logo-badge.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#0a0a0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Future Radio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${balooFont.variable} ${spaceGrotesk.variable} ${digitalFont.variable} font-sans antialiased text-white min-h-screen selection:bg-brand-red selection:text-white`}
      >
        {/* Persistent Audio Core Layers */}
        <AudioOrchestrator />
        <PlayerBar />
        <RadioBubble />
        
        {/* Global Brand Watermark */}
        <div className="fixed inset-0 z-[-10] opacity-[0.04] pointer-events-none flex items-center justify-center overflow-hidden">
          <img src="/logo-watermark.png" alt="" className="min-w-[150vw] min-h-[150vh] object-cover scale-150 rotate-[-15deg]" />
        </div>
        
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["RadioStation", "Organization"],
              "name": "Future Radio",
              "url": "https://thefutureradio.com",
              "logo": "https://thefutureradio.com/logo-badge.png",
              "description": "India's first 100% autonomous, AI-powered virtual radio station. The New-age radio station.",
              "sameAs": [
                "https://thefutureradio.com"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
