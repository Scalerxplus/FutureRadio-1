import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Bagheli Dialect Campaign | Future Radio",
  description: "Experience the unique Bagheli dialect, folk music, and regional artists digitized on Future Radio's autonomous AI network.",
  alternates: {
    canonical: "https://thefutureradio.com/bagheli",
  },
};

export default function BagheliLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
