import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bundeli Radio Station | Jhansi, Gwalior, Sagar | Future Radio",
  description: "Listen to the #1 Bundeli Radio Station. Stream Naye Bundeli Gaane, Sohar, Kajari, and Awadhi Lokgeet. Live 24/7 in Jhansi, Gwalior, Sagar, Maihar, and Shahdol.",
  keywords: [
    "Jhansi radio station", "Gwalior radio station", "Maihar Radio Station", "Shahdol Radio Station", 
    "Sagar Radio Sation", "Sagar Radio Station", "Umaria Radio Station", "Bundeli Lokgeet", 
    "Bundeli Gaane", "Sohar", "Dadar Song", "Kajari Folk Song", "Sawan Geet", "Kajri", 
    "Hinduli lokgeet", "Jhansi Gwalior ka logeet", "Awadhi Lokgeet", "Modern Lokgeet", 
    "Naye Bundeli Gaane", "Radio in Jhansi", "Radio in Gwalior", "Radio in Sagar", 
    "Radio in Shahdol", "Radio in Prayagraj", "Radio in Mirzapur"
  ],
  alternates: {
    canonical: "https://thefutureradio.com/Bundeli",
  },
  openGraph: {
    title: "Bundeli Radio Station | Vindhya's #1 Local Radio Network",
    description: "Stream Bundeli Lokgeet, Naye Bundeli Gaane, Sohar, and Kajari 24/7. Your local radio station for Jhansi, Gwalior, and Sagar.",
    url: "https://thefutureradio.com/Bundeli",
    siteName: "Future Radio",
    locale: "hi_IN",
    type: "website",
  },
};

export default function BundeliLayout({
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
            "name": "Future Radio Bundeli",
            "url": "https://thefutureradio.com/Bundeli",
            "description": "India's first autonomous Bundeli radio station serving Jhansi, Gwalior, Sagar, Shahdol, and Maihar.",
            "broadcastDisplayName": "Bundeli Vibes",
            "areaServed": ["Jhansi", "Gwalior", "Sagar", "Shahdol", "Maihar", "Umaria", "Prayagraj", "Mirzapur"],
            "genre": ["Folk Music", "Bundeli Lokgeet", "Regional News"],
          })
        }}
      />
    </>
  );
}
