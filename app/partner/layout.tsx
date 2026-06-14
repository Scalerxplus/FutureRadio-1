import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner With Us | Start a Radio Business | Media Mafias",
  description: "Start a radio business or franchise in India. Media Mafias provides the Audio SaaS, software, and infrastructure to launch your own vernacular radio network.",
  keywords: ["start a radio business", "radio franchise in india", "audio saas partner", "radio network infrastructure", "dialect radio partner"]
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
