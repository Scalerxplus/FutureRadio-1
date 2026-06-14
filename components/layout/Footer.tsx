import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-black py-16 px-6 border-t border-red-accent/20 relative overflow-hidden">
      {/* Decorative scanline accent */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-accent to-transparent opacity-50" />
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="inline-block hover-glitch" data-text="MEDIA MAFIAS">
            <Image 
              src="/Logo horizontal.png" 
              alt="Media Mafias" 
              width={200} 
              height={44} 
              className="object-contain opacity-80 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            />
          </Link>
          <p className="text-secondary font-sans text-sm max-w-sm leading-relaxed border-l-2 border-red-accent/50 pl-4">
            The decentralized audio network built on code. Broadcasting from the underground to the world.
          </p>
          <div className="text-[10px] font-mono text-secondary/40 tracking-widest uppercase">
            SYS.NODE.01 :: ENCRYPTED SIGNAL :: CARTEL ACTIVE
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl tracking-widest text-red-accent uppercase">Access Points</h4>
          <ul className="space-y-4 font-mono text-sm uppercase tracking-widest text-secondary">
            <li><Link href="/" className="hover:text-white transition-all">Home</Link></li>
            <li><Link href="/business" className="hover:text-red-accent transition-colors">Business</Link></li>
            <li><Link href="/radio" className="hover:text-red-accent transition-colors">Future Radio</Link></li>
            <li><Link href="/technology" className="hover:text-red-accent transition-colors">Technology</Link></li>
            <li><Link href="/partner" className="hover:text-red-accent transition-colors">Station Partner</Link></li>
            <li><Link href="/create" className="hover:text-white transition-all">Creator Program</Link></li>
            <li><Link href="/analysis" className="hover:text-white transition-all">Market Analysis</Link></li>
            <li><Link href="/about" className="hover:text-white transition-all">About</Link></li>
            <li><Link href="/contact" className="hover:text-red-accent transition-all">Contact / Legal</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl tracking-widest text-red-accent uppercase">Communications</h4>
          <div className="flex flex-col space-y-2 text-sm font-mono text-secondary">
            <a href="mailto:cartel@mediamafias.com" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="text-red-accent">{">"}</span> cartel@mediamafias.com
            </a>
            <a href="https://wa.me/919209290699" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="text-red-accent">{">"}</span> +91 9209290699
            </a>
            <a href="https://thefutureradio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors mt-4 block border border-white/10 p-2 text-center bg-neutral-900/50">
              thefutureradio.com
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-secondary text-xs font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Media Mafias. All signals reserved.
        </p>
        <p className="text-secondary/30 text-[10px] font-mono tracking-widest">
          v1.0.0-DECENTRALIZED
        </p>
      </div>
    </footer>
  );
};
