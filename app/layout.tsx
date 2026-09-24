import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AudioOrchestrator from "@/components/audio/AudioOrchestrator";
import PlayerBar from "@/components/audio/PlayerBar";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

import { Baloo_2, Space_Grotesk, Khand } from "next/font/google";



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



const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thefutureradio.com"),
  title: "Future Radio Roots | India's First AI-Powered Vernacular Radio Network",
  description: "India's premier autonomous AI-powered vernacular radio network. Broadcasting raw culture 24/7 across the Indo-Gangetic belt including Bagheli, Bhojpuri, Awadhi, Bundeli, and Maithili.",
  keywords: [
    "hyper-local radio", "vernacular radio", "digital radio network", "folk music india", "bagheli lokgeet", "bhojpuri music", "awadhi songs", "devotional radio", "internet radio india", "Future Radio Roots", "indo-gangetic belt", "bhojpuri music", "bagheli lokgeet", "bundeli", "awadhi", "maithili"
  ],
  openGraph: {
    title: "Future Radio Roots | India's First AI-Powered Vernacular Radio Network",
    description: "India's premier autonomous AI-powered vernacular radio network. Broadcasting raw culture 24/7 across the Indo-Gangetic belt including Bagheli, Bhojpuri, Awadhi, Bundeli, and Maithili.",
    url: "https://thefutureradio.com",
    siteName: "Future Radio Roots",
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
    title: "Future Radio Roots | India's First AI-Powered Vernacular Radio Network",
    description: "India's First AI-Powered Vernacular Radio Network. Stream 24/7 authentic folk music, local dialects like Bagheli and Bhojpuri.",
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
    title: "Future Radio Roots",
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
    <html lang="en" className={`dark scroll-smooth ${khandFont.variable} `}>
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
                  "description": "India's First AI-Powered Vernacular Radio Network for Bharat’s dialect-first audience."
                },
                {
                  "@type": "WebSite",
                  "name": "Future Radio Roots | India's First AI-Powered Vernacular Radio Network",
                  "url": "https://www.thefutureradio.com",
                  "description": "India's premier autonomous AI-powered vernacular radio network. Broadcasting raw culture 24/7 across the Indo-Gangetic belt including Bagheli, Bhojpuri, Awadhi, Bundeli, and Maithili."
                },
                {
                  "@type": "RadioChannel",
                  "name": "Future Radio Roots", "indo-gangetic belt", "bhojpuri music", "bagheli lokgeet", "bundeli", "awadhi", "maithili",
                  "url": "https://thefutureradio.com",
                  "genre": ["Devotional", "Regional Folk", "Indian Music", "Local News"]
                }
              ]
            }
          `}
        </Script>
      </head>
      <body
        className={`${balooFont.variable} ${spaceGrotesk.variable} font-sans antialiased text-white min-h-screen selection:bg-brand-red selection:text-white`}
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
              "name": "Future Radio Roots",
              "url": "https://thefutureradio.com",
              "logo": "https://thefutureradio.com/logo-badge.png",
              "description": "India's First AI-Powered Vernacular Radio Network. The new-age radio network for Bharat.",
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




