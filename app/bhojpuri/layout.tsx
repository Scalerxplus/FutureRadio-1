import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Future Radio Bhojpuri | 24/7 Bhojpuri Music & Culture",
  description: "Listen to Bhojpuri folk songs, regional audio, and music on Future Radio Bhojpuri, the ultimate audio network for Bihar and UP.",
  alternates: {
    canonical: "https://thefutureradio.com/bhojpuri",
  },
};

export default function BhojpuriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
