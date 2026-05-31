"use client";

import Link from "next/link";

export default function TakedownPage() {
  return (
    <div className="min-h-screen bg-brand-surface text-white selection:bg-brand-red selection:text-white flex flex-col font-mono">
      {/* Brutalist Micro-grid Background overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      
      <header className="w-full bg-brand-dark border-b-4 border-brand-red p-6 flex flex-col items-center justify-center relative z-10 shadow-[0_4px_0_0_rgba(255,51,102,1)]">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase text-center">DMCA TAKEDOWN</h1>
        <p className="text-brand-red text-sm md:text-base font-bold tracking-[0.3em] uppercase mt-2">COPYRIGHT COMPLIANCE</p>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6 relative z-10 my-8">
        <div className="w-full max-w-3xl bg-brand-dark border-4 border-brand-red shadow-[12px_12px_0px_0px_rgba(255,51,102,1)] p-8 md:p-12">
          
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
              COPYRIGHT INFRINGEMENT CLAIM
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-sans max-w-2xl mx-auto leading-relaxed">
              Future Radio respects intellectual property rights. If you believe your copyrighted work is being streamed without permission or outside the scope of the Audius Open Music License (OML), please submit a takedown request below. Our algorithms will immediately blacklist the track upon verification.
            </p>
          </div>

          <form className="space-y-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-red uppercase tracking-widest">Your Full Name / Entity</label>
                <input 
                  type="text" 
                  className="w-full bg-black border-2 border-white/20 p-3 text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
                  placeholder="e.g. John Doe / Label Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-red uppercase tracking-widest">Contact Email</label>
                <input 
                  type="email" 
                  className="w-full bg-black border-2 border-white/20 p-3 text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
                  placeholder="legal@yourdomain.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-red uppercase tracking-widest">Infringing Audius Track Link / Future Radio Timestamp</label>
              <input 
                type="text" 
                className="w-full bg-black border-2 border-white/20 p-3 text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
                placeholder="https://audius.co/..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-red uppercase tracking-widest">Proof of Original Ownership (Link/Description)</label>
              <textarea 
                className="w-full bg-black border-2 border-white/20 p-3 text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors h-32 resize-none"
                placeholder="Please provide details confirming you are the copyright holder..."
                required
              />
            </div>

            <div className="pt-4">
              <div className="flex items-start gap-3 mb-6">
                <input type="checkbox" id="perjury" className="mt-1 accent-brand-red w-4 h-4 cursor-pointer" required />
                <label htmlFor="perjury" className="text-xs text-gray-400 select-none cursor-pointer leading-tight">
                  I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                </label>
              </div>

              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("Takedown request submitted securely. Our compliance team will review and blacklist the track within 24 hours.");
                }}
                className="w-full bg-brand-red hover:bg-white hover:text-black text-white text-xl font-black uppercase tracking-widest py-5 px-8 transition-all active:scale-95 border-2 border-transparent hover:border-brand-red"
              >
                SUBMIT TAKEDOWN NOTICE
              </button>
            </div>
          </form>

        </div>
      </main>

      <footer className="w-full text-center pb-8 pt-6 px-6">
        <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-brand-dark hover:text-white hover:underline transition-colors">
          &larr; BACK TO TERMINAL
        </Link>
      </footer>
    </div>
  );
}
