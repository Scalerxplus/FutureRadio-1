import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audience Intelligence Hub | Radio Market Data | Media Mafias",
  description: "Explore verified market data, estimated TAM, and smartphone penetration for regional macro-zones and linguistic micro-nodes in India. Advertise with precision.",
  keywords: ["radio audience data", "regional audio market analysis", "dialect targeting", "digital audio demographics", "indian radio statistics"]
};

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
