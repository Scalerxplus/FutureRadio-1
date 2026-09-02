import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bagheli Radio Station | Rewa, Satna, Sidhi | Future Radio",
  description: "Listen to the #1 Bagheli Radio Station. Stream Naye Bagheli Gaane, Sohar, Kajari, and Awadhi Lokgeet. Live 24/7 in Rewa, Satna, Sidhi, Maihar, and Shahdol.",
  keywords: [
    "Rewa radio station", "Satna radio station", "Maihar Radio Station", "Shahdol Radio Station", 
    "Sidhi Radio Sation", "Sidhi Radio Station", "Umaria Radio Station", "Bagheli Lokgeet", 
    "Bagheli Gaane", "Sohar", "Dadar Song", "Kajari Folk Song", "Sawan Geet", "Kajri", 
    "Hinduli lokgeet", "Rewa Satna ka logeet", "Awadhi Lokgeet", "Modern Lokgeet", 
    "Naye Bagheli Gaane", "Radio in Rewa", "Radio in Satna", "Radio in Sidhi", 
    "Radio in Shahdol", "Radio in Prayagraj", "Radio in Mirzapur"
  ],
  alternates: {
    canonical: "https://thefutureradio.com/bagheli",
  },
  openGraph: {
    title: "Bagheli Radio Station | Vindhya's #1 Local Audio Network",
    description: "Stream Bagheli Lokgeet, Naye Bagheli Gaane, Sohar, and Kajari 24/7. Your local radio station for Rewa, Satna, and Sidhi.",
    url: "https://thefutureradio.com/bagheli",
    siteName: "Future Radio",
    locale: "hi_IN",
    type: "website",
  },
};

export default function BagheliLayout({
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
            "name": "Future Radio Bagheli",
            "url": "https://thefutureradio.com/bagheli",
            "description": "India's first autonomous Bagheli radio station serving Rewa, Satna, Sidhi, Shahdol, and Maihar.",
            "broadcastDisplayName": "Bagheli Vibes",
            "areaServed": ["Rewa", "Satna", "Sidhi", "Shahdol", "Maihar", "Umaria", "Prayagraj", "Mirzapur"],
            "genre": ["Folk Music", "Bagheli Lokgeet", "Regional News"],
          })
        }}
      />
    </>
  );
}
