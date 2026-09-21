import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Indie Vibes | Independent Music | Future Radio",
  description: "Listen to 24/7 underground, alternative, and indie music on Future Radio Indie.
  keywords: [
    "Rewa radio station", "Satna radio station", "Maihar Radio Station", "Shahdol Radio Station", 
    "Sidhi Radio Sation", "Sidhi Radio Station", "Umaria Radio Station", "Indie Lokgeet", 
    "Indie Gaane", "Sohar", "Dadar Song", "Kajari Folk Song", "Sawan Geet", "Kajri", 
    "Hinduli lokgeet", "Rewa Satna ka logeet", "Awadhi Lokgeet", "Modern Lokgeet", 
    "Naye Indie Gaane", "Radio in Rewa", "Radio in Satna", "Radio in Sidhi", 
    "Radio in Shahdol", "Radio in Prayagraj", "Radio in Mirzapur"
  ],
  alternates: {
    canonical: "https://thefutureradio.com/Indie",
  },
  openGraph: {
    title: "Indie Radio Station | Vindhya's #1 Local Radio Network",
    description: "Stream Indie Lokgeet, Naye Indie Gaane, Sohar, and Kajari 24/7. Your local radio station for Rewa, Satna, and Sidhi.",
    url: "https://thefutureradio.com/Indie",
    siteName: "Future Radio",
    locale: "hi_IN",
    type: "website",
  },
};

export default function IndieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RadioStation",
            "name": "Future Radio Indie",
            "url": "https://thefutureradio.com/Indie",
            "description": "India's first autonomous Indie radio station serving Rewa, Satna, Sidhi, Shahdol, and Maihar.",
            "broadcastDisplayName": "Indie Vibes",
            "areaServed": ["Rewa", "Satna", "Sidhi", "Shahdol", "Maihar", "Umaria", "Prayagraj", "Mirzapur"],
            "genre": ["Folk Music", "Indie Lokgeet", "Regional News"],
          })
        }}
      />
    </>
  );
}
