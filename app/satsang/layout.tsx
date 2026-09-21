import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Satsang Vibes | Spiritual Awakening | Future Radio",
  description: "Listen to 24/7 Satsang, spiritual discourses, and meditation music on Future Radio Satsang.
  keywords: [
    "Rewa radio station", "Satna radio station", "Maihar Radio Station", "Shahdol Radio Station", 
    "Sidhi Radio Sation", "Sidhi Radio Station", "Umaria Radio Station", "Satsang Lokgeet", 
    "Satsang Gaane", "Sohar", "Dadar Song", "Kajari Folk Song", "Sawan Geet", "Kajri", 
    "Hinduli lokgeet", "Rewa Satna ka logeet", "Awadhi Lokgeet", "Modern Lokgeet", 
    "Naye Satsang Gaane", "Radio in Rewa", "Radio in Satna", "Radio in Sidhi", 
    "Radio in Shahdol", "Radio in Prayagraj", "Radio in Mirzapur"
  ],
  alternates: {
    canonical: "https://thefutureradio.com/Satsang",
  },
  openGraph: {
    title: "Satsang Radio Station | Vindhya's #1 Local Radio Network",
    description: "Stream Satsang Lokgeet, Naye Satsang Gaane, Sohar, and Kajari 24/7. Your local radio station for Rewa, Satna, and Sidhi.",
    url: "https://thefutureradio.com/Satsang",
    siteName: "Future Radio",
    locale: "hi_IN",
    type: "website",
  },
};

export default function SatsangLayout({
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
            "name": "Future Radio Satsang",
            "url": "https://thefutureradio.com/Satsang",
            "description": "India's first autonomous Satsang radio station serving Rewa, Satna, Sidhi, Shahdol, and Maihar.",
            "broadcastDisplayName": "Satsang Vibes",
            "areaServed": ["Rewa", "Satna", "Sidhi", "Shahdol", "Maihar", "Umaria", "Prayagraj", "Mirzapur"],
            "genre": ["Folk Music", "Satsang Lokgeet", "Regional News"],
          })
        }}
      />
    </>
  );
}
