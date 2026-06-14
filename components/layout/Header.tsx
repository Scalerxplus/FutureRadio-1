"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const links: { name: string; href: string; external?: boolean }[] = [
    { name: "Future Radio", href: "/radio" },
    { name: "Technology", href: "/technology" },
    { name: "Business", href: "/business" },
    { name: "Partner", href: "/partner" },
    { name: "Creator Program", href: "/create" },
    { name: "Market Analysis", href: "/analysis" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="hover-glitch" data-text="MEDIA MAFIAS">
            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
            >
              <Image 
                src="/Logo Main.png" 
                alt="Media Mafias" 
                width={80} 
                height={80} 
                className="object-contain"
              />
            </motion.div>
          </Link>
          <span className="hidden md:inline-block text-[10px] font-mono text-secondary tracking-widest uppercase border border-white/10 px-2 py-0.5 bg-neutral-900/50">
            SECURE_CONN_ESTABLISHED
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex gap-8 items-center text-sm font-bold font-display tracking-widest uppercase">
          {links.map((link, i) => {
            const isActive = pathname === link.href;
            const linkProps = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Link key={i} href={link.href} {...linkProps} className="group relative text-secondary hover:text-white transition-colors flex items-center">
                <span className={`text-red-accent mr-1 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>[</span>
                <span className={isActive ? "text-white" : ""}>{link.name}</span>
                <span className={`text-red-accent ml-1 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>]</span>
              </Link>
            );
          })}
          <Link href="/partner" className="ml-4 brutalist-border bg-black text-red-accent px-6 py-2 hover:bg-red-accent hover:text-white transition-all whitespace-nowrap">
            GET YOUR STATION CODE
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="xl:hidden text-white hover:text-red-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-8 h-8" />
        </button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[60] bg-black border-b border-red-accent flex flex-col pt-24 px-6 pb-6 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,57,43,0.1)_0%,rgba(0,0,0,1)_70%)] pointer-events-none" />
            
            <button 
              className="absolute top-6 right-6 text-white hover:text-red-accent transition-colors z-10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-10 h-10" />
            </button>

            <nav className="relative z-10 flex flex-col gap-8 text-3xl font-display tracking-widest uppercase mt-12">
              {links.map((link, i) => {
                const isActive = pathname === link.href;
                const linkProps = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={link.href} 
                      {...linkProps}
                      onClick={() => !link.external && setIsMobileMenuOpen(false)}
                      className={`hover-glitch block w-fit ${isActive ? "text-white border-l-4 border-red-accent pl-4" : "text-secondary"}`}
                      data-text={link.name}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.1 }}
                className="mt-8"
              >
                <Link 
                  href="/partner" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="inline-block brutalist-border bg-black text-red-accent px-8 py-4 hover:bg-red-accent hover:text-white transition-all text-2xl"
                >
                  GET YOUR STATION CODE
                </Link>
              </motion.div>
            </nav>
            
            <div className="mt-auto relative z-10 pt-12">
              <span className="text-[10px] font-mono text-secondary tracking-widest uppercase border border-white/10 px-2 py-0.5 bg-neutral-900/50">
                SYS.NODE.01 :: CARTEL ACTIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
