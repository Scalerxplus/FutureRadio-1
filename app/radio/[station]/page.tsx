import { Metadata } from 'next';
import RadioClient from '../RadioClient';

const seoMap: Record<string, { title: string, desc: string }> = {
  hindi: { title: "Future Radio Hindi | India's Best AI Hindi Music Station", desc: "Listen to the best Hindi Indie and Global music 24/7 on Future Radio Hindi." },
  bagheli: { title: "Future Radio Bagheli | MP's No. 1 Bagheli Dialect Radio", desc: "Enjoy authentic Bagheli folk, regional hits, and global music mixed for Baghelkhand on Future Radio Bagheli." },
  bundeli: { title: "Future Radio Bundeli | The Heartbeat of Bundelkhand", desc: "Tune into Future Radio Bundeli for the best Bundeli regional songs, folk music, and global hits." },
  chhattisgarhi: { title: "Future Radio CG | Chhattisgarhi & Global Hits", desc: "Listen to Future Radio CG for non-stop Chhattisgarhi regional hits and global music." },
  malwi: { title: "Future Radio Malwi | MP's Malwi Dialect Music Station", desc: "Future Radio Malwi brings you the sweet dialect of Malwa with regional music and global hits." },
  sarguja: { title: "Future Radio Sarguja | Ambikapur & Sarguja's AI Radio", desc: "Experience the unique Sargujiha dialect and regional music from Ambikapur mixed with global hits." },
  bastar: { title: "Future Radio Bastar | Jagdalpur's Voice", desc: "The vibrant culture of Bastar and Jagdalpur, featuring regional music and AI-curated playlists." },
  raigarh: { title: "Future Radio Raigarh | Regional & Global Mix", desc: "Tune into Future Radio Raigarh for a seamless mix of regional hits and global chartbusters." },
  punjabi: { title: "Future Radio Punjabi | Global Punjabi Hits", desc: "24/7 Punjabi bangers, hip-hop, and global hits on Future Radio Punjabi." },
  news: { title: "Future Radio News | 24/7 Live AI News Station", desc: "Stay updated with real-time news, weather, and traffic curated by AI on Future Radio News." },
};

export async function generateMetadata({ params }: { params: { station: string } }): Promise<Metadata> {
  const station = params.station.toLowerCase();
  const seo = seoMap[station] || { title: `Future Radio ${station} | Live AI Radio`, desc: "Experience the next generation of sound with Future Radio." };

  return {
    title: seo.title,
    description: seo.desc,
    alternates: {
      canonical: `https://thefutureradio.com/radio/${station}`
    },
    openGraph: {
      title: seo.title,
      description: seo.desc,
      url: `https://thefutureradio.com/radio/${station}`,
    }
  };
}

export default function StationRadioPage({ params }: { params: { station: string } }) {
  const station = params.station.toLowerCase();
  const seo = seoMap[station] || { title: `Future Radio ${station} | Live AI Radio`, desc: "Experience the next generation of sound with Future Radio." };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": seo.title,
    "description": seo.desc,
    "url": `https://thefutureradio.com/radio/${station}`,
    "image": "https://thefutureradio.com/fr-business-cover.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Screen-Reader Only SEO Content for Google Bots */}
      <div className="sr-only">
        <h1>{seo.title}</h1>
        <article>
          <p>{seo.desc}</p>
          <h2>About Future Radio {station.charAt(0).toUpperCase() + station.slice(1)}</h2>
          <p>
            Welcome to the official live stream for Future Radio {station}. We broadcast 100% autonomous, AI-powered radio featuring the best independent music, local vernacular folk hits, global chartbusters, and real-time updates. 
            Digital India's #1 Digital Audio Network brings the radio experience to your smartphone. Tune in to hear AI RJs speaking in your local dialect, providing a seamless blend of nostalgia and the future of sound.
          </p>
        </article>
      </div>

      <RadioClient initialStation={station} />
    </>
  );
}
