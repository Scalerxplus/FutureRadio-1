import * as React from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-brand-dark py-16 px-6 border-t-4 border-brand-red relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10 text-white">
        <div className="md:col-span-2 space-y-6">
          <Link href="/">
            <img 
              src="/icons/logo-horizontal-light.png" 
              alt="Future Radio" 
              className="h-10 object-contain hover:-translate-y-1 transition-transform"
            />
          </Link>
          <p className="font-mono text-sm max-w-sm leading-relaxed border-l-4 border-brand-yellow pl-4">
            Digital India's #1 Digital & Virtual Radio Network. Broadcasting from the regional underground to the world.
          </p>
          <div className="text-[10px] font-mono tracking-widest uppercase text-brand-yellow">
            10 DIALECTS :: 1 PLATFORM :: ALWAYS LIVE
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl tracking-widest text-brand-red uppercase">Access Points</h4>
          <ul className="space-y-4 font-mono text-sm uppercase tracking-widest">
            <li><Link href="/" className="hover:text-brand-yellow transition-all">Home</Link></li>
            <li><Link href="/business" className="hover:text-brand-yellow transition-colors">Business</Link></li>
            <li><Link href="/radio" className="hover:text-brand-yellow transition-colors">Future Radio</Link></li>
            <li><Link href="/technology" className="hover:text-brand-yellow transition-colors">Technology</Link></li>
            <li><Link href="/partner" className="hover:text-brand-yellow transition-colors">Partner Program</Link></li>
            <li><Link href="/creators" className="hover:text-brand-yellow transition-all">Creator Program</Link></li>
            <li><Link href="/analysis" className="hover:text-brand-yellow transition-all">Market Analysis</Link></li>
            <li><Link href="/about" className="hover:text-brand-yellow transition-all">About</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-display text-xl tracking-widest text-brand-red uppercase">Communications</h4>
          <div className="flex flex-col space-y-2 text-sm font-mono">
            <a href="mailto:hello@thefutureradio.com" className="hover:text-brand-yellow transition-colors flex items-center gap-2">
              <span className="text-brand-red">{">"}</span> hello@thefutureradio.com
            </a>
            <a href="https://wa.me/919209290699" className="hover:text-brand-yellow transition-colors flex items-center gap-2">
              <span className="text-brand-red">{">"}</span> +91 9209290699
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-gray-300 text-xs font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} Future Radio. All signals reserved.
        </p>
        <p className="text-gray-300 text-[10px] sm:text-xs font-mono tracking-widest uppercase">
          The Future Radio is a <a href="https://www.scalerxlab.com/" target="_blank" rel="noopener noreferrer" className="text-brand-yellow hover:text-white underline transition-colors">ScalerX Lab</a> Ecosystem Infrastructure.
        </p>
      </div>
    </footer>
  );
};
