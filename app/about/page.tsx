import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-red text-brand-dark flex flex-col font-mono selection:bg-brand-yellow selection:text-black">
      {/* Brutalist Header */}
      <header className="border-b-4 border-brand-dark bg-brand-dark p-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/" className="hover:-translate-x-1 transition-transform">
          <div className="p-2 border-2 border-brand-dark shadow-brutal-sm bg-brand-yellow hover:bg-white hover:text-brand-dark transition-colors">
            <MoveLeft className="w-6 h-6 text-brand-dark" />
          </div>
        </Link>
        <div className="h-10 ml-2">
          <img src="/icons/logo-horizontal-light.png" alt="Future Radio" className="h-full object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 lg:p-24 max-w-4xl mx-auto w-full">
        <div className="bg-white border-4 border-brand-dark p-8 md:p-12 shadow-brutal transform rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="space-y-12">
            
            {/* Title Section */}
            <section className="text-center">
              <div className="inline-block border-2 border-brand-dark bg-blue-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 shadow-brutal-sm transform -rotate-2">
                A Cloud-First Company
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-brand-dark">
                The Future of <span className="text-brand-red underline decoration-8 underline-offset-4">Audio</span> is Here.
              </h1>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto bg-gray-100 p-4 border-2 border-brand-dark shadow-brutal-sm">
                India's first 100% autonomous, AI-powered virtual radio station network. Decentralized, independent, and strictly built for the modern digital listener.
              </p>
            </section>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t-4 border-brand-dark border-dashed">
              <section className="space-y-4">
                <h2 className="text-2xl font-black uppercase bg-brand-yellow inline-block px-2 border-2 border-brand-dark shadow-brutal-sm">
                  Our Mission
                </h2>
                <p className="text-lg font-medium leading-relaxed bg-brand-dark text-white p-4 border-2 border-brand-dark shadow-brutal-sm transform hover:-rotate-1 transition-transform">
                  To provide quick info and entertainment to rural India, taking the most reliable medium—audio—and supercharging it through advanced Web3 radio technology.
                </p>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-black uppercase bg-[#4ADE80] inline-block px-2 border-2 border-brand-dark shadow-brutal-sm">
                  Our Vision
                </h2>
                <p className="text-lg font-medium leading-relaxed bg-brand-red text-white p-4 border-2 border-brand-dark shadow-brutal-sm transform hover:rotate-1 transition-transform">
                  To build a decentralized global audio platform that empowers independent artists and creators by deeply integrating regional dialects into 1 seamless platform.
                </p>
              </section>
            </div>

            {/* Contact Section */}
            <section className="pt-8 border-t-4 border-brand-dark border-dashed text-center">
              <h2 className="text-3xl font-black uppercase mb-6 text-brand-dark decoration-4 underline-offset-4 underline">
                Get In Touch
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="https://wa.me/919209290699" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25D366] text-white border-2 border-brand-dark px-6 py-4 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto font-bold uppercase tracking-wider"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z"/>
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[10px] opacity-90">WhatsApp</p>
                    <p className="text-base font-digital">+91 9209290699</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:hello@thefutureradio.com" 
                  className="flex items-center gap-3 bg-brand-dark text-white border-2 border-brand-dark px-6 py-4 shadow-brutal hover:translate-y-1 hover:shadow-none transition-all w-full sm:w-auto font-bold uppercase tracking-wider"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-brand-yellow">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <div className="text-left leading-none">
                    <p className="text-[10px] text-brand-yellow">Email</p>
                    <p className="text-base font-digital">hello@thefutureradio.com</p>
                  </div>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-brand-dark font-black uppercase tracking-widest border-t-4 border-brand-dark bg-white">
        © {new Date().getFullYear()} Future Radio & Media Mafias.
      </footer>
    </div>
  );
}
