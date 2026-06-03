"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0c0e]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/icons/player-logo.png" alt="Future Radio" className="w-8 h-8 object-contain transition-transform group-hover:scale-110" />
          <span className="font-digital text-xl tracking-widest uppercase font-bold text-white group-hover:text-brand-red transition-colors">
            Future Radio
          </span>
        </Link>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
          Home
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/10 to-transparent pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            A Cloud-First Company
          </div>
          <h1 className="text-4xl md:text-6xl font-baloo font-black uppercase tracking-wide leading-tight mb-6">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-500">Audio</span> is Here.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            India's first 100% autonomous, AI-powered virtual radio station network. Decentralized, independent, and strictly built for the modern digital listener.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-20 bg-black/40">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-red/20 to-orange-500/20 flex items-center justify-center border border-brand-red/30 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-red">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <h2 className="text-2xl font-baloo font-bold uppercase tracking-wider text-white">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To provide quick info and entertainment to rural India, taking the most reliable medium—audio—and supercharging it through advanced Web3 radio technology. We aim to bridge the digital divide with culturally relevant, high-quality programming.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-baloo font-bold uppercase tracking-wider text-white">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              To build a decentralized global audio platform that empowers independent artists and creators. By deeply integrating 10 regional dialects into 1 seamless platform, we are preserving local heritage while pioneering the future of global streaming.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-baloo font-bold uppercase tracking-wider text-white">Get In Touch</h2>
          <p className="text-gray-400">
            Have questions, feedback, or want to collaborate? As a cloud-first company, we operate digitally worldwide. Reach out to us directly through our official channels.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <a 
              href="https://wa.me/919209290699" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 px-6 py-4 rounded-xl hover:bg-[#25D366]/20 transition-colors w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825 0 6.938 3.112 6.938 6.937 0 3.825-3.113 6.938-6.938 6.938z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">WhatsApp Only</p>
                <p className="font-mono text-white text-lg">+91 9209290699</p>
              </div>
            </a>
            
            <a 
              href="mailto:hello@thefutureradio.com" 
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Email Us</p>
                <p className="font-mono text-white text-lg">hello@thefutureradio.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest border-t border-white/5 bg-black/60">
        © 2026 Future Radio & Media Mafias. All Rights Reserved.
      </footer>

    </main>
  );
}
