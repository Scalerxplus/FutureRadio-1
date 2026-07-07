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
  title: "Future Radio India | Regional, Devotional & Folk Audio Network",
  description: "Stream Shiva Bhajans, Ramayan, Bagheli Lokgeet, Bhojpuri music, Awadhi songs and 24/7 devotional radio on Future Radio India, a regional audio network built for Bharat.",
  keywords: [
    "devotional radio", "shiva devotional songs", "shiva bhajan", "shiva mantra", "ramayan", "radio ramayan", "ram", "ganesh", "krishna", "hanuman chalisa", "sundar kand", "ramcharit manas",
    "regional radio", "folk music india", "bagheli lokgeet", "up ke lokgeet", "rewa ke lokgeet", "satna ke lokgeet", "bhojpuri folk music", "bhojpuri music", "awadhi", "bundeli", "braj",
    "radio", "internet radio india", "future radio", "ai radio station", "new stations", "new structure", "new business model", "autonomous radio", "indie music"
  ],
  openGraph: {
    title: "Future Radio | #1 Devotional, Regional & Folk Audio Network",
    description: "Stream Shiva Bhajans, Hanuman Chalisa, Bagheli Lokgeet, Bhojpuri Music, and Regional Folk songs 24/7. The ultimate autonomous audio network.",
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
    title: "Future Radio | #1 Devotional, Regional & Folk Audio Network",
    description: "Stream Shiva Bhajans, Bagheli Lokgeet, and Bhojpuri Music 24/7.",
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
                  "name": "Future Radio India",
                  "url": "https://thefutureradio.com",
                  "logo": "https://thefutureradio.com/icons/player-logo.png",
                  "description": "Hyperlocal devotional, regional and folk audio for Bharat’s dialect-first audience."
                },
                {
                  "@type": "WebSite",
                  "name": "Future Radio India | Regional, Devotional & Folk Audio Network",
                  "url": "https://thefutureradio.com",
                  "description": "Stream Shiva Bhajans, Ramayan, Bagheli Lokgeet, Bhojpuri music, Awadhi songs and 24/7 devotional radio on Future Radio India, a regional audio network built for Bharat."
                },
                {
                  "@type": "RadioChannel",
                  "name": "Future Radio",
                  "url": "https://thefutureradio.com",
                  "genre": ["Devotional", "Regional Folk", "Indian Music", "Local News"]
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
