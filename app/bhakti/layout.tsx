import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bhakti Vibes | India's #1 Devotional Station | Future Radio",
  description: "Listen to 24/7 Bhajans, Aarti, and Devotional streams on Future Radio Bhakti.
  keywords: [
    "Rewa radio station", "Satna radio station", "Maihar Radio Station", "Shahdol Radio Station", 
    "Sidhi Radio Sation", "Sidhi Radio Station", "Umaria Radio Station", "Bhakti Lokgeet", 
    "Bhakti Gaane", "Sohar", "Dadar Song", "Kajari Folk Song", "Sawan Geet", "Kajri", 
    "Hinduli lokgeet", "Rewa Satna ka logeet", "Awadhi Lokgeet", "Modern Lokgeet", 
    "Naye Bhakti Gaane", "Radio in Rewa", "Radio in Satna", "Radio in Sidhi", 
    "Radio in Shahdol", "Radio in Prayagraj", "Radio in Mirzapur"
  ],
  alternates: {
    canonical: "https://thefutureradio.com/Bhakti",
  },
  openGraph: {
    title: "Bhakti Radio Station | Vindhya's #1 Local Radio Network",
    description: "Stream Bhakti Lokgeet, Naye Bhakti Gaane, Sohar, and Kajari 24/7. Your local radio station for Rewa, Satna, and Sidhi.",
    url: "https://thefutureradio.com/Bhakti",
    siteName: "Future Radio",
    locale: "hi_IN",
    type: "website",
  },
};

export default function BhaktiLayout({
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
            "name": "Future Radio Bhakti",
            "url": "https://thefutureradio.com/Bhakti",
            "description": "India's first autonomous Bhakti radio station serving Rewa, Satna, Sidhi, Shahdol, and Maihar.",
            "broadcastDisplayName": "Bhakti Vibes",
            "areaServed": ["Rewa", "Satna", "Sidhi", "Shahdol", "Maihar", "Umaria", "Prayagraj", "Mirzapur"],
            "genre": ["Folk Music", "Bhakti Lokgeet", "Regional News"],
          })
        }}
      />
    </>
  );
}
