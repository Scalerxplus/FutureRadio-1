import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business | Products & Services | Media Mafias",
  description: "Explore the Media Mafias product suite: In-Store Radios, Radio 3.0 Technology SaaS, and Future Radio. The definitive digital audio ecosystem.",
  keywords: ["in-store radio", "radio saas", "future radio", "radio technology", "digital audio business"]
};

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
