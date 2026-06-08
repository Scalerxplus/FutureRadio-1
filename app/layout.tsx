import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AudioOrchestrator from "@/components/audio/AudioOrchestrator";
import PlayerBar from "@/components/audio/PlayerBar";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

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
  title: "Future Radio | Digital India's #1 Digital Audio Network",
  description: "Experience the next generation of sound. Future Radio is India's first 100% autonomous, AI-powered virtual radio station network covering all regional and global dialects.",
  keywords: ["radio", "internet radio india", "ai radio station", "future radio", "madhya pradesh radio", "chhattisgarh radio", "bagheli", "bundeli", "malwi", "chhattisgarhi", "sarguja", "bastar", "punjabi radio", "indie music"],
  openGraph: {
    title: "Future Radio | Digital India's #1 Digital Audio Network",
    description: "The New-age radio network. Tune into the future of sound with regional and global music in your own dialect.",
    url: "https://thefutureradio.com",
    siteName: "Future Radio",
    images: [
      {
        url: "/icons/logo-horizontal-dark.png",
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
    images: ["/icons/logo-horizontal-dark.png"],
  },
  icons: {
    icon: "/icons/player-logo.png",
    apple: "/icons/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://thefutureradio.com",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Future Radio",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TY6F9GVTSY"
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-TY6F9GVTSY');
          `}
        </Script>
      </head>
      <body
        className={`${balooFont.variable} ${spaceGrotesk.variable} ${digitalFont.variable} font-sans antialiased text-white min-h-screen selection:bg-brand-red selection:text-white`}
      >
        {/* Persistent Audio Core Layers */}
        <AudioOrchestrator />
        <PlayerBar />

        
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
