import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-brand-red text-brand-dark flex flex-col font-mono selection:bg-brand-yellow selection:text-black">
      {/* Brutalist Header */}
      <header className="border-b-4 border-brand-dark bg-white p-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/" className="hover:-translate-x-1 transition-transform">
          <div className="p-2 border-2 border-brand-dark shadow-brutal-sm bg-brand-yellow hover:bg-brand-dark hover:text-brand-yellow transition-colors">
            <MoveLeft className="w-6 h-6" />
          </div>
        </Link>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
          The Creators
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 max-w-4xl mx-auto w-full">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl md:text-4xl font-black uppercase mb-4 bg-brand-yellow inline-block px-2 border-2 border-brand-dark">
                The Vision Behind Future Radio
              </h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                Future Radio isn't just an internet radio station; it's a rebellion against the algorithmic monotony of modern streaming platforms. We built this platform for the independent creators, the undiscovered talents, and the global audiophiles who crave authentic human connection.
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
                "We are the architects of the new soundscape. Join the revolution."
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/creators/apply" 
                  className="px-8 py-4 bg-brand-dark text-white text-center font-black uppercase tracking-widest border-4 border-transparent hover:bg-brand-red hover:shadow-brutal transition-all"
                >
                  Apply as Creator
                </Link>
                <Link 
                  href="/admin/review" 
                  className="px-8 py-4 bg-white text-brand-dark text-center font-black uppercase tracking-widest border-4 border-brand-dark hover:bg-brand-yellow transition-all"
                >
                  Admin Review Portal
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
