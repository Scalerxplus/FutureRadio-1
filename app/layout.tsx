import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AudioOrchestrator from "@/components/audio/AudioOrchestrator";
import PlayerBar from "@/components/audio/PlayerBar";
import RadioBubble from "@/components/ui/RadioBubble";
import { Analytics } from "@vercel/analytics/react";

import { Outfit, Space_Grotesk, Share_Tech_Mono } from "next/font/google";

const digitalFont = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-digital",
  weight: "400",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Future Radio | Live Data Stream",
  description: "Experience the next generation of sound, AI news, and curated futuristic radio streams. Powered by Station Intelligence.",
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
        className={`${outfit.variable} ${spaceGrotesk.variable} ${digitalFont.variable} font-sans antialiased bg-[#0a0a0f] text-white min-h-screen selection:bg-brand-purple selection:text-white`}
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
      </body>
    </html>
  );
}
