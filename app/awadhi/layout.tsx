import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Future Radio Awadhi | 24/7 Awadhi Songs & Culture",
  description: "Listen to Awadhi songs, folk music, and regional audio on Future Radio Awadhi, a dialect-first stream for listeners across the Awadh region.",
  alternates: {
    canonical: "https://thefutureradio.com/awadhi",
  },
};

export default function AwadhiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
