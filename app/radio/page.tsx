import { Metadata } from 'next';
import RadioClient from './RadioClient';

export const metadata: Metadata = {
  title: "Future Radio | Live AI Radio",
  description: "Listen to the best independent music and regional dialects on Future Radio, India's 100% autonomous virtual radio station.",
  alternates: {
    canonical: "https://thefutureradio.com/radio"
  }
};

export default function RadioGlobalPage() {
  return <RadioClient />;
}
