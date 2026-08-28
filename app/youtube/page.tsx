import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import YouTubeClient from './YouTubeClient';

export const metadata: Metadata = {
  title: "Future Radio | Live Broadcast",
  description: "Live 24/7 Radio Stream",
};

export default function YouTubePage() {
  return <YouTubeClient />;
}
