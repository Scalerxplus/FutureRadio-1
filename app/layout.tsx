import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AudioOrchestrator from "@/components/audio/AudioOrchestrator";
import PlayerBar from "@/components/audio/PlayerBar";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

import { Baloo_2, Space_Grotesk, Space_Mono, Khand, Rozha_One } from "next/font/google";

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

const khandFont = Khand({
  subsets: ["devanagari", "latin"],
  variable: "--font-khand",
  weight: ["700", "600", "500", "400", "300"],
});

const rozhaOne = Rozha_One({
  subsets: ["devanagari", "latin"],
  variable: "--font-rozha",
  weight: ["400"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thefutureradio.com"),
  title: "Future Radio | #1 Independent Regional & Devotional Audio Network",
  description: "Experience India's first 100% autonomous, AI-powered virtual radio. Explore new stations, new structure, and a new business model for creators. Stream devotional, regional, bagheli lokgeet, bhojpuri music, ramcharit manas, sundar kand, hanuman chalisa, Shiva bhajan, and Radio Ramayan.",
  keywords: [
    "radio", "internet radio india", "ai radio station", "future radio", 
    "devotional", "regional", "bagheli lokgeet", "bhojpuri music", "ramcharit manas", 
    "sundar kand", "hanuman chalisa", "Shiva bhajan", "Radio Ramayan", 
    "new stations", "new structure", "new business model", "madhya pradesh radio", 
    "chhattisgarh radio", "bagheli", "bundeli", "malwi", "chhattisgarhi", 
    "sarguja", "bastar", "punjabi radio", "indie music", "autonomous radio"
  ],
  openGraph: {
    title: "Future Radio | #1 Independent Regional & Devotional Audio Network",
    description: "Tune into the future of sound with new stations and massive regional & devotional content like Hanuman Chalisa, Bagheli Lokgeet, and Radio Ramayan.",
    url: "https://thefutureradio.com",
    siteName: "Future Radio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Future Radio | #1 Independent Regional & Devotional Audio Network",
    description: "Stream the best of Bagheli Lokgeet, Bhojpuri Music, and Devotional tracks 24/7.",
    images: ["/og-image.jpg"],
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
    <html lang="en" className={`dark scroll-smooth ${khandFont.variable} ${rozhaOne.variable}`}>
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
        
        {/* SEO JSON-LD Schemas */}
        <Script id="organization-schema" strategy="beforeInteractive" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "Future Radio",
                  "url": "https://thefutureradio.com",
                  "logo": "https://thefutureradio.com/icons/player-logo.png"
                },
                {
                  "@type": "WebSite",
                  "name": "Future Radio | Digital India's #1 Digital & Virtual Radio Network",
                  "url": "https://thefutureradio.com"
                }
              ]
            }
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
