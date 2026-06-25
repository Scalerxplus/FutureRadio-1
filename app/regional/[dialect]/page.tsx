import { Metadata } from 'next';
import { REGIONAL_STATIONS } from '@/lib/data';
import RadioClient from '@/app/radio/RadioClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { dialect: string } }): Promise<Metadata> {
  const stationId = params.dialect;
  const station = REGIONAL_STATIONS.find(s => s.id === stationId);
  
  if (!station) {
    return {
      title: 'Station Not Found | Future Radio',
    };
  }

  return {
    title: `${station.name} Live - Apni Boli, Apna Radio | Future Radio`,
    description: `Tune in to the 24/7 autonomous ${station.name} live stream. Featuring traditional folk songs, regional music, and AI-powered RJ shows.`,
    alternates: {
      canonical: `https://thefutureradio.com/regional/${station.id}`,
    },
    openGraph: {
      title: `${station.name} Live | Future Radio`,
      description: `Listen to regional folk music streaming live on ${station.name}.`,
      images: [
        {
          url: station.artwork,
          width: 1200,
          height: 630,
          alt: `${station.name} Live Cover`,
        }
      ],
    }
  };
}

export default function RegionalStationPage({ params }: { params: { dialect: string } }) {
  const stationId = params.dialect;
  const station = REGIONAL_STATIONS.find(s => s.id === stationId);

  if (!station) {
    notFound();
  }

  const radioStationSchema = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "@id": `https://thefutureradio.com/regional/${station.id}/#station`,
    "name": `Future Radio ${station.name}`,
    "url": `https://thefutureradio.com/regional/${station.id}`,
    "logo": "https://thefutureradio.com/icons/player-logo.png",
    "image": station.artwork,
    "description": `India's first autonomous, AI-powered ${station.name} virtual radio station. Streaming 24/7 folk music, traditional geet, and regional tracks.`,
    "parentOrganization": {
      "@type": "Organization",
      "name": "Future Radio Network",
      "url": "https://thefutureradio.com"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(radioStationSchema) }}
      />
      {/* Visually hidden H1 for SEO */}
      <h1 className="sr-only">Live {station.name} Radio Station</h1>
      <p className="sr-only">Tune in to regional folk music and dynamic AI RJs.</p>
      <RadioClient initialStation={station.id} />
    </>
  );
}
