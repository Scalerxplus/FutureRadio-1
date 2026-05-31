import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 max-w-4xl mx-auto w-full">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="space-y-10">
            <section className="text-center pb-8 border-b-4 border-brand-dark border-dashed">
              <p className="text-xl md:text-2xl font-black uppercase tracking-wider">
                By tuning into Future Radio, you agree to the following brutalist terms:
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-yellow text-brand-dark w-8 h-8 flex items-center justify-center border-2 border-brand-dark">1</span>
                The Music
              </h2>
              <p className="text-lg font-medium leading-relaxed pl-10">
                All tracks streamed via Future Radio are aggregated from decentralized, independent platforms (like Audius) or royalty-free databases. We do not claim ownership of the intellectual property of the artists featured.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-yellow text-brand-dark w-8 h-8 flex items-center justify-center border-2 border-brand-dark">2</span>
                Acceptable Use
              </h2>
              <div className="pl-10 space-y-4">
                <p className="text-2xl font-black uppercase text-brand-red bg-gray-100 p-2 inline-block border-2 border-brand-dark shadow-brutal-sm">
                  Listen loud. Share the vibes.
                </p>
                <p className="text-lg font-medium leading-relaxed">
                  Do not attempt to reverse-engineer our proprietary dynamic curation engine or scrape our API endpoints.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <span className="bg-brand-yellow text-brand-dark w-8 h-8 flex items-center justify-center border-2 border-brand-dark">3</span>
                Liability
              </h2>
              <p className="text-lg font-medium leading-relaxed pl-10 border-l-4 border-brand-red py-2 pl-4">
                Future Radio is provided "as is". We are not responsible if our curated tracks cause spontaneous dancing, deep emotional reflection, or late-night driving sessions.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
