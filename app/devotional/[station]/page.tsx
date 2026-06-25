import { Metadata } from 'next';
import { DEVOTIONAL_STATIONS } from '@/lib/data';
import RadioClient from '@/app/radio/RadioClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { station: string } }): Promise<Metadata> {
  const stationId = params.station;
  const station = DEVOTIONAL_STATIONS.find(s => s.id === stationId);
  
  if (!station) {
    return {
      title: 'Station Not Found | Future Radio',
    };
  }

  return {
    title: `${station.name} - 24/7 Live Stream | Future Radio`,
    description: `Listen to continuous 24/7 live stream of ${station.name}. Enjoy daily bhajans, spiritual satsang, and uninterrupted devotional music on Future Radio.`,
    alternates: {
      canonical: `https://thefutureradio.com/devotional/${station.id}`,
    },
    openGraph: {
      title: `${station.name} | Live Devotional Stream | Future Radio`,
      description: `Join thousands tuning into the 24/7 continuous stream of ${station.name}.`,
      images: [
        {
          url: station.artwork,
          width: 1200,
          height: 630,
          alt: `${station.name} Live Stream Art`,
        }
      ],
    }
  };
}

export default function DevotionalStationPage({ params }: { params: { station: string } }) {
  const stationId = params.station;
  const station = DEVOTIONAL_STATIONS.find(s => s.id === stationId);

  if (!station) {
    notFound();
  }

  const radioStationSchema = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "@id": `https://thefutureradio.com/devotional/${station.id}/#station`,
    "name": `Future Radio ${station.name}`,
    "url": `https://thefutureradio.com/devotional/${station.id}`,
    "logo": "https://thefutureradio.com/icons/player-logo.png",
    "image": station.artwork,
    "description": `India's first autonomous, AI-powered devotional virtual radio station. Streaming 24/7 ${station.name}.`,
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
      <h1 className="sr-only">Live {station.name} - Devotional Radio Station</h1>
      <RadioClient initialStation={station.id} />
    </>
  );
}
