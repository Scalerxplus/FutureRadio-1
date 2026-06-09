import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Future Radio",
  description: "Learn how Future Radio collects and protects your data to deliver an autonomous, algorithm-driven regional audio experience.",
  alternates: {
    canonical: "https://thefutureradio.com/privacy",
  },
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 max-w-4xl mx-auto w-full">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal translate-y-2 hover:translate-y-0 transition-transform duration-300">
          <div className="space-y-10">
            <section>
              <p className="text-xl md:text-2xl font-black leading-relaxed bg-brand-dark text-white p-4 inline-block shadow-[4px_4px_0_0_#FACC15]">
                At Future Radio, your privacy is as important to us as the music we curate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-red text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-dark">1</span>
                Data We Collect
              </h2>
              <p className="text-lg font-medium leading-relaxed pl-10">
                We collect minimal data necessary to power our streaming engine. This includes your anonymized listening patterns, preferred &quot;Vibe Stations&quot;, and basic device information to optimize audio playback.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-red text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-dark">2</span>
                How We Use It
              </h2>
              <p className="text-lg font-medium leading-relaxed pl-10 border-l-4 border-brand-yellow ml-4 py-2">
                Your data strictly fuels our Master Clock curation engine to deliver a seamless, personalized radio experience. 
                <strong className="block mt-2 underline decoration-wavy decoration-brand-red">We do NOT sell your data to third-party ad brokers.</strong>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-red text-white w-8 h-8 flex items-center justify-center rounded-full border-2 border-brand-dark">3</span>
                Cookies & Local Storage
              </h2>
              <p className="text-lg font-medium leading-relaxed pl-10">
                We use local storage to remember your favorite station and UI preferences (e.g., dark mode) so the music never stops when you return.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
