import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Independent Creators | Future Radio India",
  description: "Join Future Radio as an independent creator, RJ, or artist. Submit your indie music and reach a global audience.",
  alternates: {
    canonical: "https://thefutureradio.com/creators",
  },
  openGraph: {
    title: "Independent Creators | Future Radio India",
    description: "Join Future Radio as an independent creator, RJ, or artist.",
    url: "https://thefutureradio.com/creators",
  }
};

export default function CreatorsPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Independent Creators | Future Radio India",
      "description": "Join Future Radio as an independent creator, RJ, or artist. Submit your indie music and reach a global audience.",
      "url": "https://thefutureradio.com/creators"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://thefutureradio.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "The Creators",
          "item": "https://thefutureradio.com/creators"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-brand-red text-brand-dark flex flex-col font-mono selection:bg-brand-yellow selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Global Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 pt-32 md:pt-40 max-w-4xl mx-auto w-full">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 bg-brand-yellow inline-block px-2 border-2 border-brand-dark">
                The Vision Behind Future Radio
              </h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                Future Radio isn&apos;t just an internet radio station; it&apos;s a rebellion against the algorithmic monotony of modern streaming platforms. We built this platform for the independent creators, the undiscovered talents, and the global audiophiles who crave authentic human connection.
              </p>
            </section>

            <section>
              <h3 className="text-xl md:text-2xl font-black uppercase mb-3 text-brand-red underline decoration-4 underline-offset-4">
                Our Mission
              </h3>
              <p className="text-lg font-medium leading-relaxed bg-gray-100 p-4 border-l-4 border-brand-dark">
                To democratize music discovery by blending cutting-edge predictive curation (BPM & Sentiment analysis) with pure, unfiltered human emotion.
              </p>
            </section>

            <section className="pt-8 border-t-4 border-brand-dark border-dashed">
              <p className="text-2xl md:text-3xl font-black italic text-center uppercase tracking-widest mb-8">
                &quot;We are the architects of the new soundscape. Join the revolution.&quot;
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                <Link 
                  href="/creators/apply" 
                  className="px-6 py-3 bg-brand-dark text-white text-center font-black uppercase tracking-widest border-4 border-transparent hover:bg-brand-red hover:shadow-brutal transition-all"
                >
                  Apply as Creator
                </Link>
                <Link 
                  href="/creators/portal" 
                  className="px-6 py-3 bg-[#FFDB58] text-brand-dark text-center font-black uppercase tracking-widest border-4 border-brand-dark hover:bg-white transition-all"
                >
                  Verified Portal
                </Link>
                <Link 
                  href="/admin/review" 
                  className="px-6 py-3 bg-white text-brand-dark text-center font-black uppercase tracking-widest border-4 border-brand-dark hover:bg-gray-100 transition-all w-full sm:w-auto"
                >
                  Admin Review
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
