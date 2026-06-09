import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "DMCA Takedown | Future Radio",
  description: "Submit a copyright infringement claim for content streamed on Future Radio. We respect intellectual property and act swiftly on verified DMCA requests.",
  alternates: {
    canonical: "https://thefutureradio.com/takedown",
  },
};

export default function TakedownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
